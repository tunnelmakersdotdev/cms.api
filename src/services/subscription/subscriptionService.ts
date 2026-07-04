import SubscriptionRequestModel from "../../database/model/subscription/SubscriptionRequestModel";
import ClinicModel from "../../database/model/clinic/ClinicModel";
import clinicService from "../clinic/clinicService";
import { extractSelect, paginationQueryBuilder } from "../../mongoose";

const SELECT =
  "clinicId requestedBy currentPlan requestedPlan maxStaff maxDoctors note status";

class SubscriptionService {
  /** Create (or replace the open) plan-change request for a clinic. */
  async createRequest({
    clinicId,
    requestedBy,
    requestedPlan,
    maxStaff,
    maxDoctors,
    note,
  }: {
    clinicId: string;
    requestedBy?: string;
    requestedPlan: string;
    maxStaff?: number;
    maxDoctors?: number;
    note?: string;
  }) {
    const clinic = await ClinicModel.findById(clinicId).select("plan");
    const currentPlan = clinic?.plan ?? "base";

    const data: any = {
      clinicId,
      requestedBy,
      currentPlan,
      requestedPlan,
      maxStaff,
      maxDoctors,
      note,
      status: "pending",
    };

    // One open request per clinic — replace any existing pending one.
    const existing = await SubscriptionRequestModel.findOne({
      clinicId,
      status: "pending",
    });
    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return existing.toObject();
    }
    const created = new SubscriptionRequestModel(data);
    await created.save();
    return created.toObject();
  }

  async getRequests({ query, filter }: { query: any; filter: any }) {
    return paginationQueryBuilder({
      _model: SubscriptionRequestModel,
      query,
      select: extractSelect(SELECT),
      where: filter,
      defaultSort: { createdAt: -1 },
      populate: [
        { path: "clinicId", select: "name plan" } as any,
        { path: "requestedBy", select: "name email" } as any,
      ],
    });
  }

  async getPendingForClinic(clinicId: string) {
    const req = await SubscriptionRequestModel.findOne({
      clinicId,
      status: "pending",
    }).lean();
    return req ?? null;
  }

  /**
   * Approve/reject. On approval, the clinic's plan + caps are updated. The admin
   * may override the requested counts (used for enterprise/custom tiers).
   */
  async setStatus(
    id: string,
    status: "approved" | "rejected",
    override?: { maxStaff?: number; maxDoctors?: number }
  ) {
    const req = await SubscriptionRequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!req) return null;

    if (status === "approved") {
      await clinicService.createOrUpdateClinic({
        id: req.clinicId.toString(),
        body: {
          plan: req.requestedPlan,
          maxStaff: override?.maxStaff ?? req.maxStaff,
          maxDoctors: override?.maxDoctors ?? req.maxDoctors,
        },
      });
    }
    return req.toObject();
  }

  async countPending() {
    return SubscriptionRequestModel.countDocuments({ status: "pending" });
  }
}

export default new SubscriptionService();
