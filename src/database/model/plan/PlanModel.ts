import mongoose from "mongoose";
import { COLLECTION_PLAN } from "..";
import { PlanCatalogType } from "../../../types/plan";

export type ModelType = Pick<
  PlanCatalogType,
  | "key"
  | "name"
  | "maxStaff"
  | "maxDoctors"
  | "price"
  | "editableCounts"
  | "active"
  | "sortOrder"
> & {};

const modelSchema: mongoose.Schema<ModelType> = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    name: { type: String },
    maxStaff: { type: Number, default: 0 },
    maxDoctors: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    editableCounts: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const PlanModel = mongoose.model<ModelType>(
  COLLECTION_PLAN,
  modelSchema,
  COLLECTION_PLAN
);

export default PlanModel;
