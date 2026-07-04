import UserModel from "../../database/model/user/AppUserModel";
import ClinicModel from "../../database/model/clinic/ClinicModel";
import subscriptionService from "../subscription/subscriptionService";

class ProfileService {
  /** The caller's own profile + clinic + subscription details. */
  async getMe(userId: string) {
    const user = await UserModel.findById(userId)
      .select(
        "name email role clinicId specialization consultationFee approvalStatus isDefault profileImage"
      )
      .lean();
    if (!user) return null;

    let clinic: any = null;
    let usage: any = null;
    let pendingRequest: any = null;

    if (user.clinicId) {
      pendingRequest = await subscriptionService.getPendingForClinic(
        user.clinicId.toString()
      );

      clinic = await ClinicModel.findById(user.clinicId)
        .select("name plan maxStaff maxDoctors displayId approvalStatus address")
        .lean();

      if (clinic) {
        const [staffUsed, doctorsUsed] = await Promise.all([
          UserModel.countDocuments({ role: "staff", clinicId: user.clinicId }),
          UserModel.countDocuments({
            role: "doctor",
            clinicId: user.clinicId,
            approvalStatus: { $in: ["pending", "approved"] },
          }),
        ]);
        usage = { staffUsed, doctorsUsed };
      }
    }

    return {
      user: {
        id: (user as any)._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        consultationFee: user.consultationFee,
        approvalStatus: user.approvalStatus,
        isDefault: user.isDefault,
      },
      clinic: clinic
        ? {
            id: clinic._id?.toString(),
            name: clinic.name,
            plan: clinic.plan,
            maxStaff: clinic.maxStaff,
            maxDoctors: clinic.maxDoctors,
            displayId: clinic.displayId,
            approvalStatus: clinic.approvalStatus,
            address: clinic.address,
          }
        : null,
      usage,
      pendingRequest: pendingRequest
        ? {
            requestedPlan: pendingRequest.requestedPlan,
            status: pendingRequest.status,
          }
        : null,
    };
  }
}

export default new ProfileService();
