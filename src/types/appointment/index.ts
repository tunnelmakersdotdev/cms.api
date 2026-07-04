import { Types } from "mongoose";

export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "serving"
  | "completed"
  | "cancelled"
  | "no-show";

/**
 * One booked time slot with a doctor. A slot is identified by
 * (doctorId, date, startTime); a partial unique index prevents double-booking
 * while `active` is true.
 */
export type AppointmentType = {
  id: string;
  clinicId: Types.ObjectId; // ref Clinic
  doctorId: Types.ObjectId; // ref User (role: doctor)
  customerId?: Types.ObjectId; // ref User (role: customer) — optional for manual booking
  customerName?: string; // patient name for manual/walk-in booking
  customerPhone?: string; // patient phone for manual/walk-in booking
  date: string; // "2026-06-10"
  startTime: string; // "09:15"
  endTime: string; // "09:30"
  tokenNumber?: number; // queue token for the clinic that day
  status: AppointmentStatus;
  active: boolean; // false once cancelled — frees the slot for rebooking
  notes?: string;
};

/** A computed bookable slot (slots are derived, not stored). */
export type SlotType = {
  startTime: string;
  endTime: string;
  available: boolean;
};
