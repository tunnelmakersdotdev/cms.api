import mongoose, { Schema } from "mongoose";
import { COLLECTION_CLINIC, COLLECTION_SCHEDULE, COLLECTION_USER } from "..";
import { ScheduleType } from "../../../types/schedule";

export type ModelType = Pick<
  ScheduleType,
  | "doctorId"
  | "clinicId"
  | "dayOfWeek"
  | "startTime"
  | "endTime"
  | "slotMinutes"
  | "active"
> & {};

const modelSchema: mongoose.Schema<ModelType> = new mongoose.Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: COLLECTION_USER },
    clinicId: { type: Schema.Types.ObjectId, ref: COLLECTION_CLINIC },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    startTime: { type: String },
    endTime: { type: String },
    slotMinutes: { type: Number, default: 15 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A doctor has one active schedule per weekday + start time.
modelSchema.index(
  { doctorId: 1, dayOfWeek: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const ScheduleModel = mongoose.model<ModelType>(
  COLLECTION_SCHEDULE,
  modelSchema,
  COLLECTION_SCHEDULE
);

export default ScheduleModel;
