import mongoose, {
  AggregateOptions,
  Model,
  PipelineStage,
  QueryOptions,
  Types,
} from "mongoose";
import _ from "lodash";
import { PopulateOptions } from "mongoose";
import { getPaginationParams } from "../common/response";
import { replacePrefixFromText, toCamelCase } from "../common";
import { createDocumentUrlForApp } from "../common/media";

export type PopulateType = {
  path: string;
  select?: string | string[] | object;
  model?: Model<any>;
  match?: any;
  options?: QueryOptions;
};

const splitSelect = (select: string) => {
  let objects: any = {};
  for (const iterator of select.split(" ").filter((e) => e)) {
    if (iterator.includes(":")) {
      const splitData = iterator.split(":");
      objects[splitData[1]] = "$" + splitData[0];
    } else {
      objects[iterator] = 1;
    }
  }
  return objects;
};

export const extractSelect = (select: string | string[] | object) => {
  if (!select) {
    return {};
  }

  let objects: any = {};
  objects["id"] = "$_id";
  objects["code"] = "$code";
  if (Array.isArray(select)) {
    for (const iterator of select) {
      objects = Object.assign({}, objects, splitSelect(iterator));
    }
  } else if (typeof select === "object") {
    return select;
  } else {
    objects = Object.assign({}, objects, splitSelect(select));
  }

  return objects;
};
const dataNumber = ["code", "dwId", "voucherNo"];
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
}

export const extractLikeQuery = (
  select: string,
  search: string,
  numberFields?: string[]
) => {
  let objects = [];

  if (search.length != 0) {
    let dataNumbers = dataNumber;
    if (numberFields?.length) {
      dataNumbers = [...numberFields, ...dataNumbers];
    }
    const regex = new RegExp(escapeRegExp(search), "i");
    for (const iterator of select.split(" ").filter((e) => e)) {
      if (dataNumbers.includes(iterator)) {
        objects.push({
          $expr: {
            $regexMatch: {
              input: { $toString: `$${iterator}` },
              regex: regex,
            },
          },
        });
      } else {
        objects.push({ [iterator]: { $regex: regex } });
      }
    }

    if (objects.length) {
      return {
        $or: objects,
      };
    }
  }
  return {};
};
type paginationQueryBuilderProps = {
  _model: Model<any>;
  select: string | object;
  likeSearch?: string;
  query: any;
  defaultSort?: { [key: string]: number };
  where?: any;
  mediaLoop?: boolean;
  extraLoop?: boolean;
  extraLoopKey?: string;
  populate?: PopulateOptions[];
  numberFields?: string[];
  searchPrefixReplace?: string | string[];
  restructure?: (arg: any) => any;
  isExtraGroup?: boolean;
  extraGroup?: any;
};

export const paginationQueryBuilder = async ({
  _model,
  select,
  likeSearch,
  query,
  populate,
  where,
  numberFields,
  mediaLoop = false,
  // extraLoop = false,
  // extraLoopKey = "info",
  defaultSort,
  searchPrefixReplace,
  restructure,
  extraGroup,
  isExtraGroup,
}: paginationQueryBuilderProps) => {
  try {
    // { path: "parentId", select: "name" }
    const { page, limit, skip, search, sort, sortColumn } =
      getPaginationParams(query);
    let newSearch = replacePrefixFromText({
      prefix: searchPrefixReplace,
      text: search,
    });

    let findQuery = likeSearch
      ? extractLikeQuery(likeSearch, newSearch ?? "", numberFields)
      : {};

    if (where) {
      findQuery = Object.assign(findQuery, where);
    }

    let data = _model
      .find(findQuery, extractSelect(select))
      .skip(skip)
      .limit(limit);
    if (sortColumn) {
      let sortData: { [key: string]: any } = {};
      sortData[toCamelCase(sortColumn)] =
        sort?.toLocaleLowerCase() == "asc" ? 1 : -1;
      data.sort({ ...sortData, ...(defaultSort ?? {}) });
    }

    for (let iterator of populate ?? []) {
      iterator["select"] = extractSelect(iterator.select ?? "");
      data.populate(iterator);
    }
    let dataResponse = await data.exec();
    if (mediaLoop) {
      dataResponse = await mediaLooper({
        model: dataResponse,
        looperType: "page",
      });
    }
    if (restructure) {
      for (const key in dataResponse) {
        let element = dataResponse[key].toObject();
        dataResponse[key] = restructure(element);
      }
    }

    const totalSize = await _model.countDocuments(findQuery);
    let finalData: any = dataResponse;
    if (isExtraGroup) {
      const extraData = await _model.aggregate([
        {
          $match: findQuery,
        },
        {
          $group: extraGroup,
        },
      ]);
      finalData = { data: dataResponse, extraData };
    }
    const pageSize = Math.ceil(totalSize / limit);
    const pageData = {
      totalSize,
      pageSize,
      page,
      perPage: limit,
      data: finalData,
    };
    return pageData;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
type paginationAggQueryBuilderProps = {
  _model: Model<any>;
  // select: string | object;
  agg?: PipelineStage[];
  options?: AggregateOptions;
  likeSearch?: string;
  query: any;
  defaultSort?: { [key: string]: number };
  where?: any;
  mediaLoop?: boolean;
  extraLoop?: boolean;
  extraLoopKey?: string;
  populate?: PopulateOptions[];
  searchPrifixReplace?: string | string[];
  restructure?: (arg: any) => any;
};

export const paginationAggQueryBuilder = async ({
  _model,
  // select,
  agg = [],
  likeSearch,
  query,
  populate,
  where,
  mediaLoop = false,
  extraLoop = false,
  extraLoopKey = "info",
  defaultSort,
  searchPrifixReplace,
  restructure,
}: paginationAggQueryBuilderProps) => {
  try {
    const { page, limit, skip, search, sort, sortColumn } =
      getPaginationParams(query);
    let newSearch = replacePrefixFromText({
      prefix: searchPrifixReplace,
      text: search,
    });
    let findQuery: any = likeSearch
      ? extractLikeQuery(likeSearch, newSearch ?? "")
      : {};
    // console.log("findQuery1111", findQuery);
    if (where) {
      if (Object.values(findQuery).length) {
        findQuery = { $and: [findQuery, where] };
      }
    }
    // console.log("findQuery", findQuery);
    let sortAgg: any = defaultSort ? [{ $sort: defaultSort }] : [];
    if (sortColumn) {
      let sortData: { [key: string]: any } = {};
      sortData[toCamelCase(sortColumn)] =
        sort?.toLocaleLowerCase() == "asc" ? 1 : -1;
      sortAgg = [{ $sort: { ...sortData, ...(defaultSort ?? {}) } }];
    }
    // console.log("sortAgg", sortAgg);

    let data = _model.aggregate([
      { $match: findQuery },
      ...agg,
      ...sortAgg,
      ...[{ $skip: skip }, { $limit: limit }],
    ]);
    // .find(findQuery, extractSelect(select))
    // .skip(skip)
    // .limit(limit);
    // if (sortColumn) {
    //   console.log(sortColumn);

    //   let sortData: { [key: string]: any } = {};
    //   sortData[toCamelCase(sortColumn)] =
    //     sort?.toLocaleLowerCase() == "asc" ? 1 : -1;
    //   data.sort({ ...sortData, ...(defaultSort ?? {}) });
    // }

    // for (let iterator of populate ?? []) {
    //   iterator["select"] = extractSelect(iterator.select ?? "");
    //   data.populate(iterator);
    // }
    let dataResponse = await data.exec();
    // if (mediaLoop) {
    //   // for (const key in dataResponse) {
    //   //   let element = dataResponse[key].toObject();
    //   //   element["media"] = await createDocumentUrlForApp(element.media);
    //   //   dataResponse[key] = element;
    //   // }
    //   dataResponse = await mediaLooper({
    //     model: dataResponse,
    //     looperType: "page",
    //   });
    // }
    if (restructure) {
      for (const key in dataResponse) {
        let element = dataResponse[key].toObject();
        dataResponse[key] = restructure(element);
      }
    }

    // return;

    const totalSize = await _model.countDocuments(findQuery);
    const pageSize = Math.ceil(totalSize / limit);
    const pageData = {
      totalSize,
      pageSize,
      page,
      perPage: limit,
      data: dataResponse,
    };
    return pageData;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

type listBuilderProps = {
  _model: Model<any>;
  select: string | object | string[];
  likeSearch?: string;
  query: any;
  where?: any;
  sortColumn?: any;
  populate?: PopulateType[];
  mediaLoop?: boolean;
};

export const listQueryBuilder = async ({
  _model,
  select,
  likeSearch,
  query,
  where,
  populate,
  sortColumn,
  mediaLoop = false,
}: listBuilderProps) => {
  try {
    // { path: "parentId", select: "name" }
    const { page, limit, skip, search, sort } = getPaginationParams(query);
    let findQuery = likeSearch
      ? extractLikeQuery(likeSearch, search ?? "")
      : {};
    // return;

    if (where) {
      findQuery = Object.assign(findQuery, where);
    }
    let data = _model.find(findQuery, extractSelect(select)).limit(limit ?? 30);
    if (sortColumn) {
      data.sort(sortColumn);
    }

    for (const iterator of populate ?? []) {
      data.populate(iterator);
    }
    const dataResponse = await data.exec();
    // if (mediaLoop) {
    //   // for (const key in dataResponse) {
    //   //   let element = dataResponse[key].toObject();
    //   //   element["extra"]["image"] = await createDocumentUrlForApp(
    //   //     element.media,
    //   //     true
    //   //   );
    //   //   dataResponse[key] = element;
    //   // }
    //   return await mediaLooper({ model: dataResponse, looperType: "list" });
    // }

    return dataResponse;
  } catch (error) {
    console.log(error);

    return [];
  }
};

// export const createModelSchemaOption = ({
//   userstamp = true,
//   logEnable = true,
// }: LogModelSchemaOption): LogModelSchemaOption => {
//   return {
//     userstamp,
//     logEnable,
//   };
// };

export const findOwnerFromCollectionName = (
  ownerType: string,
  ownerId?: string
) => {
  const ownerModel = mongoose.model(ownerType);
  if (ownerId) {
    return ownerModel.findById(ownerId);
  }
  return ownerModel;
};

export const fullTextSearch = (searchTerm: string) => {
  return { $regex: new RegExp(`^${searchTerm}$`, "i") };
};
export const fullTextSearchArray = (searchTerm: string[]) => {
  if (Array.isArray(searchTerm)) {
    const result = [];
    for (const element of searchTerm) {
      result.push({ $regex: new RegExp(`^${element}$`, "i") });
    }
    return result;
  }
  return [];
};
export const fullTextSearchSimple = (searchTerm: string) => {
  return new RegExp(`^${searchTerm}$`, "i");
};

export const isMongoObjectIdValid = (id: any) => {
  return Types.ObjectId.isValid(id);
};

type mediaLooperProps = {
  model: any;
  looperType: "page" | "list";
};

export const mediaLooper = async ({ model, looperType }: mediaLooperProps) => {
  const allData = [];
  for (const key of model) {
    let element = key.toObject();
    if (looperType == "page") {
      element["media"] = await createDocumentUrlForApp(element.media);
    } else {
      element["extra"]["image"] = await createDocumentUrlForApp(
        element.media,
        true
      );
    }
    allData.push(element);
  }
  return allData;
};
