import UserModel from "../../database/model/user/AppUserModel";
import ClinicModel from "../../database/model/clinic/ClinicModel";
import AppointmentModel from "../../database/model/appointment/AppointmentModel";
import subscriptionService from "../subscription/subscriptionService";

const ACTIVE_DOCTOR = { $in: ["pending", "approved"] };

class DashboardService {
  /**
   * Role-aware stats. system-admin gets global figures + approval queues;
   * clinic-side roles get their own clinic's figures + plan usage.
   */
  async getStats({
    systemAdmin,
    clinicId,
  }: {
    systemAdmin: boolean;
    clinicId?: string;
  }) {
    const today = new Date().toISOString().slice(0, 10);
    const clinicWhere = systemAdmin ? {} : { clinicId };
    const apptWhere = systemAdmin ? {} : { clinicId };

    const [doctors, staff, appointmentsToday, appointmentsTotal, pendingDoctors] =
      await Promise.all([
        UserModel.countDocuments({
          role: "doctor",
          approvalStatus: ACTIVE_DOCTOR,
          ...clinicWhere,
        }),
        UserModel.countDocuments({ role: "staff", ...clinicWhere }),
        AppointmentModel.countDocuments({
          ...apptWhere,
          date: today,
          active: true,
        }),
        AppointmentModel.countDocuments({ ...apptWhere }),
        UserModel.countDocuments({
          role: "doctor",
          approvalStatus: "pending",
          ...clinicWhere,
        }),
      ]);

    const stats: Record<string, number> = {
      doctors,
      staff,
      appointmentsToday,
      appointmentsTotal,
      pendingDoctors,
    };

    if (systemAdmin) {
      const [clinics, pendingClinics, pendingSubscriptions] = await Promise.all([
        ClinicModel.countDocuments({}),
        ClinicModel.countDocuments({ approvalStatus: "pending" }),
        subscriptionService.countPending(),
      ]);
      stats.clinics = clinics;
      stats.pendingClinics = pendingClinics;
      stats.pendingSubscriptions = pendingSubscriptions;
    }

    // Plan usage + display code for a single clinic in scope.
    let usage = null;
    let displayId: string | null = null;
    if (!systemAdmin && clinicId) {
      const clinic = await ClinicModel.findById(clinicId).select(
        "plan maxStaff maxDoctors displayId"
      );
      if (clinic) {
        displayId = clinic.displayId ?? null;
        usage = {
          plan: clinic.plan,
          maxStaff: clinic.maxStaff,
          maxDoctors: clinic.maxDoctors,
          staffUsed: staff,
          doctorsUsed: doctors,
        };
      }
    }

    // Today's appointments (most relevant operational view).
    const todayAppointments = await AppointmentModel.find({
      ...apptWhere,
      date: today,
    })
      .select("date startTime endTime customerName status doctorId")
      .populate({ path: "doctorId", select: "name" })
      .sort({ startTime: 1 })
      .limit(15)
      .lean();

    return {
      systemAdmin,
      stats,
      usage,
      displayId,
      todayAppointments: todayAppointments.map((a: any) => ({
        id: a._id?.toString(),
        date: a.date,
        startTime: a.startTime,
        endTime: a.endTime,
        customerName: a.customerName ?? "—",
        status: a.status,
        doctorName: a.doctorId?.name ?? "—",
      })),
    };
  }
}

export default new DashboardService();
