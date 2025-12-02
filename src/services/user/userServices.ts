import { debug } from "console";
import { createDocumentUrlForApp, uploadBase64File } from "../../common/media";
import UserModel from "../../database/model/user/AppUserModel";
import { NewDocsType } from "../../types/media";
import { extractSelect, paginationQueryBuilder } from "../../mongoose";

class UserServices {
  async uploadFile({
    newDocs,
    removeDocs,
    id,
  }: {
    newDocs: NewDocsType;
    removeDocs: string[];
    id: string;
  }) {
    const user = await UserModel.findById(id).select("media");
    const insertedMedia = [];
    if (!user) throw new Error("User not found");

    if (Array.isArray(newDocs)) {
      for (const element of newDocs) {
        const item = await uploadBase64File({
          base64Data: element.url,
          basePath: `/user/${id}/`,
          key: element.key,
        });
        insertedMedia.push(item);
      }
    }

    if (insertedMedia.length) {
      user.media.push(...insertedMedia);
    }

    if (Array.isArray(removeDocs) && removeDocs.length) {
      const removingMedia = user.media.filter((item: any) =>
        removeDocs.includes(item.documentId)
      );
      debug("Removing media items:", removingMedia);
    }
    await user.save();
  }

  async createOrUpdateUser({ id, body }: { id: string; body: any }) {
    try {
      const { newDocs, removeDocs } = body;
      if (id) {
        const oneModel = await UserModel.findByIdAndUpdate(id, body, {
          new: true,
        });
        if (oneModel) {
          await this.uploadFile({
            newDocs,
            removeDocs,
            id: oneModel._id.toString(),
          });
          return oneModel ? oneModel.toObject() : null;
        }
      }

      const newModel = new UserModel(body);
      const savedModel = await newModel.save();
      if (savedModel) {
        await this.uploadFile({
          newDocs,
          removeDocs,
          id: savedModel._id.toString(),
        });
        return savedModel ? savedModel.toObject() : null;
      }
    } catch (error) {
      debug("Error in createOrUpdateUser:", error);
      throw error;
    }
    // Logic to create or update user
  }

  async getAllUsers({ query, filter }: { query: any; filter: any }) {
    const model = await paginationQueryBuilder({
      _model: UserModel,
      query,
      select: extractSelect("name email profileImage"),
      likeSearch: "name email",
      where: filter,
      mediaLoop: true,
    });

    return model;
  }

  async getUserById(id: string) {
    try {
      const oneModel = await UserModel.findById(id).select(
        extractSelect("name email media")
      );
      if (oneModel) {
        let newData: any = oneModel.toJSON();
        newData["media"] = await createDocumentUrlForApp(oneModel.media);
        return newData ? newData : null;
      }
    } catch (error) {
      debug("Error in getUserById:", error);
      throw error;
    }
  }
}

export default new UserServices();
