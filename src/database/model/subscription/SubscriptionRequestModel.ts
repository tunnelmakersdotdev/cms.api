import mongoose, { Schema } from "mongoose";
import {
  COLLECTION_CLINIC,
  COLLECTION_SUBSCRIPTION_REQUEST,
  COLLECTION_USER,
} from "..";
import { SubscriptionRequestType } from "../../../types/subscription";

export type ModelType = Pick<
  SubscriptionRequestType,
  | "clinicId"
  | "requestedBy"
  | "currentPlan"
  | "requestedPlan"
  | "maxStaff"
  | "maxDoctors"
  | "note"
  | "status"
> & {};

const modelSchema: mongoose.Schema<ModelType> = new mongoose.Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: COLLECTION_CLINIC },
    requestedBy: { type: Schema.Types.ObjectId, ref: COLLECTION_USER },
    currentPlan: { type: String },
    requestedPlan: { type: String },
    maxStaff: { type: Number },
    maxDoctors: { type: Number },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

const SubscriptionRequestModel = mongoose.model<ModelType>(
  COLLECTION_SUBSCRIPTION_REQUEST,
  modelSchema,
  COLLECTION_SUBSCRIPTION_REQUEST
);

export default SubscriptionRequestModel;
