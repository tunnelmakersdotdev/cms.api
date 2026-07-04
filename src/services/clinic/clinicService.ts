import { isValidObjectId } from "mongoose";
import ClinicModel from "../../database/model/clinic/ClinicModel";
import UserModel from "../../database/model/user/AppUserModel";
import { extractSelect, paginationQueryBuilder } from "../../mongoose";
import planService from "../plan/planService";

const CLINIC_SELECT =
  "name address phones emails website plan maxStaff maxDoctors approvalStatus displayId userId";

class ClinicService {
  async getAllClinics({ query, filter }: { query: any; filter: any }) {
    try {
      const model = await paginationQueryBuilder({
        _model: ClinicModel,
        query,
        select: extractSelect(
          "name address plan maxStaff maxDoctors approvalStatus"
        ),
        likeSearch: "name",
        where: filter,
      });

      return model;
    } catch (error) {
      throw error;
    }
  }

  // Apply caps from the (DB-driven) plan catalog. Plans with editableCounts
  // honor supplied maxStaff/maxDoctors; fixed plans always use the plan's caps.
  public async applyPlanCaps(body: any): Promise<any> {
    const planKey: string = body.plan ?? "base";
    const plan = await planService.getByKey(planKey);
    if (!plan) {
      // Unknown plan — keep whatever was supplied.
      return { ...body, plan: planKey };
    }
    if (plan.editableCounts) {
      return {
        ...body,
        plan: planKey,
        maxStaff: body.maxStaff ?? plan.maxStaff,
        maxDoctors: body.maxDoctors ?? plan.maxDoctors,
      };
    }
    return {
      ...body,
      plan: planKey,
      maxStaff: plan.maxStaff,
      maxDoctors: plan.maxDoctors,
    };
  }

  async createOrUpdateClinic({ id, body }: { id: string; body: any }) {
    try {
      const data = body.plan ? await this.applyPlanCaps(body) : body;
      if (isValidObjectId(id)) {
        //update
        const oneMOdel = await ClinicModel.findByIdAndUpdate(id, data, {
          new: true,
        });
        return oneMOdel ? oneMOdel.toObject() : null;
      } else {
        const newModel = new ClinicModel(data);
        await newModel.save();
        return newModel.toObject();
      }
    } catch (error) {
      throw error;
    }
  }
  async getClinicById(id: string) {
    try {
      const oneModel = await ClinicModel.findById(id).select(
        extractSelect(CLINIC_SELECT)
      );
      return oneModel ? oneModel.toObject() : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Self-registration: create a PENDING clinic owned by a new user.
   * The user starts as "customer" and is promoted to clinic-admin on approval.
   */
  async registerClinic({
    clinic,
    owner,
  }: {
    clinic: any;
    owner: { name: string; email: string; password: string };
  }) {
    const exists = await UserModel.exists({ email: owner.email });
    if (exists) {
      return { ok: false, reason: "email_taken" as const };
    }

    // Create the pending clinic with the requester's chosen plan caps.
    const clinicDoc = new ClinicModel(
      await this.applyPlanCaps({ ...clinic, approvalStatus: "pending" })
    );
    await clinicDoc.save();

    // Create the owner user, linked to the clinic, role "customer" until approved.
    const user = new UserModel({
      name: owner.name,
      email: owner.email,
      password: owner.password, // hashed by the pre-save hook
      role: "customer",
      clinicId: clinicDoc._id,
    });
    await user.save();

    clinicDoc.userId = user._id;
    await clinicDoc.save();

    return {
      ok: true as const,
      clinicId: clinicDoc._id.toString(),
      userId: user._id.toString(),
    };
  }

  /**
   * Approve or reject a clinic. On approval the owning user is promoted to
   * clinic-admin so they can manage their clinic.
   */
  async setApproval(clinicId: string, status: "approved" | "rejected") {
    const clinic = await ClinicModel.findByIdAndUpdate(
      clinicId,
      { approvalStatus: status },
      { new: true }
    );
    if (!clinic) return null;

    if (status === "approved" && clinic.userId) {
      await UserModel.findByIdAndUpdate(clinic.userId, {
        role: "clinic-admin",
      });
    }
    return clinic.toObject();
  }

  /** Plan usage for a clinic: caps vs. current staff/doctor counts. */
  async getUsage(clinicId: string) {
    const clinic = await ClinicModel.findById(clinicId).select(
      "plan maxStaff maxDoctors"
    );
    if (!clinic) return null;
    const [staffUsed, doctorsUsed] = await Promise.all([
      UserModel.countDocuments({ role: "staff", clinicId }),
      UserModel.countDocuments({
        role: "doctor",
        clinicId,
        approvalStatus: { $in: ["pending", "approved"] },
      }),
    ]);
    return {
      plan: clinic.plan,
      maxStaff: clinic.maxStaff,
      maxDoctors: clinic.maxDoctors,
      staffUsed,
      doctorsUsed,
    };
  }
}

export default new ClinicService();
