import { isValidObjectId } from "mongoose";
import UserModel from "../../database/model/user/AppUserModel";
import ClinicModel from "../../database/model/clinic/ClinicModel";
import { extractSelect, paginationQueryBuilder } from "../../mongoose";

// Doctors are Users with role "doctor". This service scopes all reads/writes
// to that role so doctor management stays separate from generic user CRUD.
const DOCTOR_SELECT =
  "name email role clinicId specialization consultationFee isDefault approvalStatus profileImage";

export class DoctorLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DoctorLimitError";
  }
}

class DoctorService {
  async getAllDoctors({ query, filter }: { query: any; filter: any }) {
    try {
      const model = await paginationQueryBuilder({
        _model: UserModel,
        query,
        select: extractSelect(DOCTOR_SELECT),
        likeSearch: "name email",
        where: { role: "doctor", ...(filter || {}) },
        populate: [{ path: "clinicId", select: "name" } as any],
      });
      return model;
    } catch (error) {
      throw error;
    }
  }

  /** Count doctors holding a seat (pending or approved) for a clinic. */
  async countActiveDoctors(clinicId: string): Promise<number> {
    return UserModel.countDocuments({
      role: "doctor",
      clinicId,
      approvalStatus: { $in: ["pending", "approved"] },
    });
  }

  async createOrUpdateDoctor({ id, body }: { id: string; body: any }) {
    try {
      const data: any = { ...body, role: "doctor" };
      if (!data.password) delete data.password;

      let saved: any;
      if (isValidObjectId(id)) {
        saved = await UserModel.findByIdAndUpdate(id, data, { new: true });
      } else {
        // Creating a new doctor — enforce the clinic's plan limit first.
        if (data.clinicId) {
          const clinic = await ClinicModel.findById(data.clinicId).select(
            "maxDoctors"
          );
          const limit = clinic?.maxDoctors ?? 0;
          const used = await this.countActiveDoctors(data.clinicId);
          if (used >= limit) {
            throw new DoctorLimitError(
              `Doctor limit reached for this plan (${used}/${limit}). Upgrade the plan to add more.`
            );
          }
        }
        const newModel = new UserModel(data);
        await newModel.save();
        saved = newModel;
      }

      // Only one default doctor per clinic — clear the flag on the others.
      if (saved && data.isDefault && saved.clinicId) {
        await UserModel.updateMany(
          {
            role: "doctor",
            clinicId: saved.clinicId,
            _id: { $ne: saved._id },
          },
          { isDefault: false }
        );
      }

      return saved ? saved.toObject() : null;
    } catch (error) {
      throw error;
    }
  }

  async setApprovalStatus(id: string, status: "approved" | "rejected") {
    try {
      const updated = await UserModel.findByIdAndUpdate(
        id,
        { approvalStatus: status },
        { new: true }
      ).select(extractSelect(DOCTOR_SELECT));
      return updated ? updated.toObject() : null;
    } catch (error) {
      throw error;
    }
  }

  async getDoctorById(id: string) {
    try {
      // No populate here — the edit form needs the raw clinicId string.
      const oneModel = await UserModel.findById(id).select(
        extractSelect(DOCTOR_SELECT)
      );
      return oneModel ? oneModel.toObject() : null;
    } catch (error) {
      throw error;
    }
  }
}

export default new DoctorService();
