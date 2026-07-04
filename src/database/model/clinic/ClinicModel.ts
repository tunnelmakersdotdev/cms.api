import mongoose, { Schema } from "mongoose";
import { COLLECTION_CLINIC, COLLECTION_USER } from "..";
import { AddressType, ClinicType } from "../../../types/clinic";

export type ModelType = Pick<
  ClinicType,
  | "name"
  | "emails"
  | "phones"
  | "address"
  | "website"
  | "userId"
  | "plan"
  | "maxStaff"
  | "maxDoctors"
  | "approvalStatus"
  | "displayId"
> & {};

// Short, human-readable, URL-safe code for the public display board.
export const generateDisplayId = (): string =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

const addressSchema = new mongoose.Schema<AddressType>(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  { _id: false }
);

const modelSchema: mongoose.Schema<ModelType> = new mongoose.Schema(
  {
    name: { type: String },
    phones: { type: [String] },
    emails: { type: [String] },
    address: { type: addressSchema },
    userId: { type: Schema.Types.ObjectId, ref: COLLECTION_USER },
    website: { type: String },
    // plan key references the (dynamic) Plan catalog — no fixed enum
    plan: { type: String, default: "base" },
    maxStaff: { type: Number, default: 2 },
    maxDoctors: { type: Number, default: 3 },
    // default approved so admin-created & existing clinics are active;
    // self-registration sets "pending" explicitly.
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    displayId: {
      type: String,
      unique: true,
      sparse: true,
      default: generateDisplayId,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ClinicModel = mongoose.model<ModelType>(
  COLLECTION_CLINIC,
  modelSchema,
  COLLECTION_CLINIC
);

export default ClinicModel;
