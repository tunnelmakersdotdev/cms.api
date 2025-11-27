import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { debug } from "../debug";

/*
//usage example:
 const filepath = await uploadBase64File({
    base64Data: base64Data,
    basePath: "uploadFilePath",
    mimeType: "application/pdf",
  });
  */

interface UploadBase64Options {
  base64Data: string;
  basePath: string;
  key: string;
}

interface UploadResult {
  documentId: string;
  url: string;
  key: string;
  mime?: string;
  source: "old";
}

export async function uploadBase64File({
  base64Data,
  basePath, // default folder
  key,
}: UploadBase64Options): Promise<UploadResult> {
  const isProduction = process.env.NODE_ENV === "production";
  const id = randomUUID(); // unique ID for tracking/deleting

  const base64Clean = base64Split(base64Data);
  const fileBuffer = Buffer.from(base64Clean, "base64");
  const mime = detectMimeType(base64Clean);
  const fileName = `${key}_${id}.${mime?.extension}`;
  const filePath = `${basePath}/${fileName}`;

  if (isProduction) {
    // --- Upload to S3 ---
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filePath,
      Body: fileBuffer,
      ContentEncoding: "base64",
      ContentType: mime?.mime,
    };

    // const uploadResult = await s3.upload(params).promise();
    return { documentId: id, url: "", key, mime: mime?.mime, source: "old" };
  } else {
    // --- Save locally to project root /uploads ---
    const uploadDir = path.join("uploads", basePath);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);

    return {
      documentId: id,
      url: `/uploads/${basePath}/${path.basename(filePath)}`,
      key,
      mime: mime?.mime,
      source: "old",
    };
  }
}

export const fileSignatureList = [
  {
    fileType: "JPEG",
    extension: "jpg",
    mime: "image/jpeg",
    base64Start: "/9j/",
  },
  {
    fileType: "PNG",
    extension: "png",
    mime: "image/png",
    base64Start: "iVBORw",
  },
  {
    fileType: "GIF",
    extension: "gif",
    mime: "image/gif",
    base64Start: "R0lGODlh",
  },
  {
    fileType: "TIFF",
    extension: "tiff",
    mime: "image/tiff",
    base64Start: "SUkqAA",
  },
  { fileType: "BMP", extension: "bmp", mime: "image/bmp", base64Start: "Qk0" },
  {
    fileType: "SVG",
    extension: "svg",
    mime: "image/svg+xml",
    base64Start: "PHN2ZyB4bWxu",
  },
  {
    fileType: "MP3",
    extension: "mp3",
    mime: "audio/mpeg",
    base64Start: "SUQzBAAAA",
  },
  {
    fileType: "MP4",
    extension: "mp4",
    mime: "video/mp4",
    base64Start: "AAAAIGZ0e",
  },
  {
    fileType: "PDF",
    extension: "pdf",
    mime: "application/pdf",
    base64Start: "JVBERi0xLj",
  },
  {
    fileType: "DOCX",
    extension: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    base64Start: "UEsDBBQ",
  },
  {
    fileType: "DOCX",
    extension: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    base64Start: "UEsDBBQ",
  },
  {
    fileType: "TXT",
    extension: "txt",
    mime: "text/plain",
    base64Start: "dGV4dC9wbGFpbg==",
  },
  {
    fileType: "CSV",
    extension: "csv",
    mime: "text/plain",
    base64Start: "U29tZSBkYXRhIGZpbGUgY29udGVudCBvZiB0aGUgY29udGVudA==",
  },
  {
    fileType: "XLSX",
    extension: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    base64Start: "UEsDBBQ",
  },
  {
    fileType: "PPTX",
    extension: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    base64Start: "UEsDBBQ",
  },
  {
    fileType: "WEBP",
    extension: "webp",
    mime: "image/webp",
    base64Start: "UklGR",
  },
];

export function detectMimeType(
  b64: string
): null | { mime: string; extension: string } {
  for (const s of fileSignatureList) {
    if (b64.indexOf(s.base64Start) === 0) {
      return { mime: s.mime, extension: s.extension };
    }
  }
  return null;
}

export const base64Split = (base64String: string): string => {
  const commaIndex = base64String.indexOf(",");
  const base64Data = base64String.slice(commaIndex + 1);
  return base64Data;
};

export const createDocumentUrlForApp = async (
  docs: any,
  getFirstURL: boolean = false
) => {
  let result = [];
  if (Array.isArray(docs)) {
    for (const iterator of docs) {
      const currentUrl = await createUrl(iterator.url);
      if (getFirstURL) return currentUrl;
      result.push({
        documentId: iterator.documentId,
        mime: iterator.mime,
        key: iterator.key,
        source: iterator.source,
        url: currentUrl,
      });
    }
  } else {
    debug("docs error", docs);
  }
  return result;
};

const createUrl = async (filePath: string) => {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    return process.env.APP_URL + filePath;
  } else {
    // if (bucketname == publicBucket) {
    //   return process.env.BUCKET_PUBLIC_URL + filePath;
    // } else {
    //   return await generatePresignedUrl(bucketname, filePath, 1800);
    // }
  }
  return "#";
};
