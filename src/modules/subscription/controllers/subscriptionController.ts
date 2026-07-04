import { RequestHandler } from "express";
import { response200, response422, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import subscriptionService from "../../../services/subscription/subscriptionService";
import {
  callerClinicId,
  clinicScopeFilter,
  isSystemAdmin,
} from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";
import { emitClinicChanged } from "../../../socket";

export const createSubscriptionRequest: RequestHandler = async (req, res) => {
  const areq = req as AuthenticatedRequest;
  const { requestedPlan, maxStaff, maxDoctors, note } = req.body;
  try {
    // System-admin may target any clinic; others are forced to their own.
    const clinicId = isSystemAdmin(areq)
      ? req.body.clinicId ?? callerClinicId(areq)
      : callerClinicId(areq);
    if (!clinicId) {
      return response422({ res, message: "No clinic in scope" });
    }
    if (!requestedPlan) {
      return response422({ res, message: "A requested plan is required" });
    }
    const data = await subscriptionService.createRequest({
      clinicId,
      requestedBy: (areq.user?.id ?? (areq.user as any)?._id)?.toString(),
      requestedPlan,
      maxStaff,
      maxDoctors,
      note,
    });
    return response200({
      res,
      data,
      message: "Subscription change requested — pending admin approval",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getSubscriptionRequests: RequestHandler = async (req, res) => {
  const { status } = req.query;
  try {
    const filter: any = clinicScopeFilter(req as AuthenticatedRequest);
    if (status) filter.status = status;
    const data = await subscriptionService.getRequests({
      query: req.query,
      filter,
    });
    return response200({ res, data, message: "Requests fetched" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const approveSubscriptionRequest: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { status, maxStaff, maxDoctors } = req.body; // status + optional cap overrides
  try {
    const override =
      maxStaff !== undefined || maxDoctors !== undefined
        ? {
            maxStaff: maxStaff !== undefined ? Number(maxStaff) : undefined,
            maxDoctors:
              maxDoctors !== undefined ? Number(maxDoctors) : undefined,
          }
        : undefined;
    const data = await subscriptionService.setStatus(
      id,
      status === "rejected" ? "rejected" : "approved",
      override
    );
    if (data && status !== "rejected") {
      emitClinicChanged({ id: (data as any).clinicId?.toString(), action: "updated" });
    }
    return response200({
      res,
      data,
      message: `Request ${status === "rejected" ? "rejected" : "approved"}`,
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
