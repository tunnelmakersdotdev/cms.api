import { isValidObjectId } from "mongoose";
import UserModel from "../../database/model/user/AppUserModel";
import ClinicModel from "../../database/model/clinic/ClinicModel";
import { extractSelect, paginationQueryBuilder } from "../../mongoose";

// Staff are Users with role "staff", scoped to a clinic and capped by its plan.
const STAFF_SELECT = "name email role clinicId profileImage";

export class StaffLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffLimitError";
  }
}

class StaffService {
  async getAllStaff({ query, filter }: { query: any; filter: any }) {
    try {
      const model = await paginationQueryBuilder({
        _model: UserModel,
        query,
        select: extractSelect(STAFF_SELECT),
        likeSearch: "name email",
        where: { role: "staff", ...(filter || {}) },
        populate: [{ path: "clinicId", select: "name" } as any],
      });
      return model;
    } catch (error) {
      throw error;
    }
  }

  async countStaff(clinicId: string): Promise<number> {
    return UserModel.countDocuments({ role: "staff", clinicId });
  }

  async createOrUpdateStaff({ id, body }: { id: string; body: any }) {
    try {
      const data: any = { ...body, role: "staff" };
      if (!data.password) delete data.password;

      if (isValidObjectId(id)) {
        const oneModel = await UserModel.findByIdAndUpdate(id, data, {
          new: true,
        });
        return oneModel ? oneModel.toObject() : null;
      }

      // Creating new staff — enforce the clinic's plan limit.
      if (data.clinicId) {
        const clinic = await ClinicModel.findById(data.clinicId).select(
          "maxStaff"
        );
        const limit = clinic?.maxStaff ?? 0;
        const used = await this.countStaff(data.clinicId);
        if (used >= limit) {
          throw new StaffLimitError(
            `Staff limit reached for this plan (${used}/${limit}). Upgrade the plan to add more.`
          );
        }
      }

      const newModel = new UserModel(data);
      await newModel.save();
      return newModel.toObject();
    } catch (error) {
      throw error;
    }
  }

  async getStaffById(id: string) {
    try {
      const oneModel = await UserModel.findById(id).select(
        extractSelect(STAFF_SELECT)
      );
      return oneModel ? oneModel.toObject() : null;
    } catch (error) {
      throw error;
    }
  }
}

export default new StaffService();
