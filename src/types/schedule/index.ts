import { Types } from "mongoose";

/**
 * A doctor's recurring weekly availability. The system expands a schedule into
 * discrete bookable slots of `slotMinutes` length for a requested date.
 */
export type ScheduleType = {
  id: string;
  doctorId: Types.ObjectId; // ref User (role: doctor)
  clinicId: Types.ObjectId; // ref Clinic
  dayOfWeek: number; // 0 (Sun) – 6 (Sat)
  startTime: string; // "09:00"
  endTime: string; // "13:00"
  slotMinutes: number; // e.g. 15 → slot length
  active: boolean;
};
