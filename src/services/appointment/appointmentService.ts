import AppointmentModel from "../../database/model/appointment/AppointmentModel";
import { extractSelect, paginationQueryBuilder } from "../../mongoose";
import scheduleService from "../schedule/scheduleService";
import { SlotType } from "../../types/appointment";

// Statuses that still occupy a slot (cancelled/no-show free it conceptually,
// but only `active:false` actually frees it for the unique index).
const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
};

const toHHMM = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

class AppointmentService {
  /**
   * Compute the bookable slots for a doctor on a date by expanding the doctor's
   * active schedule(s) for that weekday, then marking any already-booked slots
   * as unavailable. Slots are derived on the fly — never stored.
   */
  async getAvailableSlots({
    doctorId,
    date,
  }: {
    doctorId: string;
    date: string;
  }): Promise<SlotType[]> {
    // Parse the date as a calendar day (no timezone shenanigans).
    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

    const schedules = await scheduleService.getActiveSchedulesForDay(
      doctorId,
      dayOfWeek
    );

    // Expand every schedule into discrete slots.
    const slots: SlotType[] = [];
    for (const s of schedules) {
      const start = toMinutes(s.startTime);
      const end = toMinutes(s.endTime);
      const step = s.slotMinutes || 15;
      for (let t = start; t + step <= end; t += step) {
        slots.push({
          startTime: toHHMM(t),
          endTime: toHHMM(t + step),
          available: true,
        });
      }
    }

    // Subtract slots that already have an active booking.
    const booked = await AppointmentModel.find({
      doctorId,
      date,
      active: true,
    })
      .select("startTime")
      .lean();
    const takenStarts = new Set(booked.map((b: any) => b.startTime));

    return slots
      .map((slot) => ({
        ...slot,
        available: !takenStarts.has(slot.startTime),
      }))
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  }

  /**
   * Book a slot. Relies on the partial-unique index to reject a second booking
   * of the same (doctor, date, startTime) — surfaced as a friendly conflict.
   */
  async bookAppointment({ body }: { body: any }) {
    const {
      clinicId,
      doctorId,
      customerId,
      customerName,
      customerPhone,
      date,
      startTime,
      endTime,
      notes,
    } = body;
    try {
      // Per-clinic, per-day sequential token number.
      const todayCount = await AppointmentModel.countDocuments({
        clinicId,
        date,
      });
      const tokenNumber = todayCount + 1;

      const appointment = new AppointmentModel({
        clinicId,
        doctorId,
        customerId,
        customerName,
        customerPhone,
        date,
        startTime,
        endTime,
        tokenNumber,
        notes,
        status: "booked",
        active: true,
      });
      await appointment.save();
      return { ok: true, appointment: appointment.toObject() };
    } catch (error: any) {
      if (error?.code === 11000) {
        // Duplicate key → slot was taken between slot listing and booking.
        return { ok: false, reason: "slot_taken" };
      }
      throw error;
    }
  }

  async cancelAppointment(id: string) {
    try {
      // Freeing the slot = active:false so the unique index lets it be rebooked.
      const updated = await AppointmentModel.findByIdAndUpdate(
        id,
        { status: "cancelled", active: false },
        { new: true }
      );
      return updated ? updated.toObject() : null;
    } catch (error) {
      throw error;
    }
  }

  async updateStatus({ id, status }: { id: string; status: string }) {
    try {
      const active = !(status === "cancelled" || status === "no-show");
      const updated = await AppointmentModel.findByIdAndUpdate(
        id,
        { status, active },
        { new: true }
      );
      return updated ? updated.toObject() : null;
    } catch (error) {
      throw error;
    }
  }

  async getAllAppointments({ query, filter }: { query: any; filter: any }) {
    try {
      const model = await paginationQueryBuilder({
        _model: AppointmentModel,
        query,
        select: extractSelect(
          "clinicId doctorId customerId customerName customerPhone date startTime endTime tokenNumber status active notes"
        ),
        where: filter,
        defaultSort: { date: -1, startTime: 1 },
        populate: [
          { path: "doctorId", select: "name email" } as any,
          { path: "customerId", select: "name email" } as any,
        ],
      });
      return model;
    } catch (error) {
      throw error;
    }
  }

  async getAppointmentById(id: string) {
    try {
      const oneModel = await AppointmentModel.findById(id).select(
        extractSelect(
          "clinicId doctorId customerId date startTime endTime status active notes"
        )
      );
      return oneModel ? oneModel.toObject() : null;
    } catch (error) {
      throw error;
    }
  }
}

export default new AppointmentService();
