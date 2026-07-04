import ClinicModel from "../../database/model/clinic/ClinicModel";
import AppointmentModel from "../../database/model/appointment/AppointmentModel";

const mapToken = (a: any) => ({
  token: a.tokenNumber ?? null,
  time: a.startTime,
  doctor: a.doctorId?.name ?? "",
  patient: a.customerName ?? "",
  status: a.status,
});

class DisplayService {
  /**
   * Public token board for a clinic (by its display code): today's active
   * (now-serving) and waiting tokens. Returns null for an unknown code.
   */
  async getDisplayData(displayId: string) {
    const clinic = await ClinicModel.findOne({ displayId }).select("name");
    if (!clinic) return null;

    const today = new Date().toISOString().slice(0, 10);
    const appts = await AppointmentModel.find({
      clinicId: clinic._id,
      date: today,
      status: { $in: ["booked", "confirmed", "serving"] },
    })
      .select("tokenNumber status startTime doctorId customerName")
      .populate({ path: "doctorId", select: "name" })
      .sort({ tokenNumber: 1 })
      .lean();

    return {
      clinicId: clinic._id.toString(),
      clinicName: clinic.name,
      date: today,
      active: appts.filter((a: any) => a.status === "serving").map(mapToken),
      waiting: appts.filter((a: any) => a.status !== "serving").map(mapToken),
    };
  }
}

export default new DisplayService();
