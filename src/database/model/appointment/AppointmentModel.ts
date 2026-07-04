import mongoose, { Schema } from "mongoose";
import {
  COLLECTION_APPOINTMENT,
  COLLECTION_CLINIC,
  COLLECTION_USER,
} from "..";
import { AppointmentType } from "../../../types/appointment";

export type ModelType = Pick<
  AppointmentType,
  | "clinicId"
  | "doctorId"
  | "customerId"
  | "customerName"
  | "customerPhone"
  | "date"
  | "startTime"
  | "endTime"
  | "tokenNumber"
  | "status"
  | "active"
  | "notes"
> & {};

const modelSchema: mongoose.Schema<ModelType> = new mongoose.Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: COLLECTION_CLINIC },
    doctorId: { type: Schema.Types.ObjectId, ref: COLLECTION_USER },
    customerId: { type: Schema.Types.ObjectId, ref: COLLECTION_USER },
    customerName: { type: String },
    customerPhone: { type: String },
    date: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    tokenNumber: { type: Number },
    status: {
      type: String,
      enum: [
        "booked",
        "confirmed",
        "serving",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "booked",
    },
    active: { type: Boolean, default: true },
    notes: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Double-booking guard: at most one ACTIVE appointment per (doctor, date, slot).
// Cancelling sets active=false, which frees the slot to be booked again.
modelSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const AppointmentModel = mongoose.model<ModelType>(
  COLLECTION_APPOINTMENT,
  modelSchema,
  COLLECTION_APPOINTMENT
);

export default AppointmentModel;
