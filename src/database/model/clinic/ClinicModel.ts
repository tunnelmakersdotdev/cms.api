import mongoose, { Schema } from "mongoose";
import { COLLECTION_CLINIC, COLLECTION_USER } from "..";
import { AddressType, ClinicType } from "../../../types/clinic";

export type ModelType = Pick<
  ClinicType,
  "name" | "emails" | "phones" | "address" | "website" | "userId"
> & {};

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
