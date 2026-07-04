import { RequestHandler } from "express";
import { response200, response403, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import staffService, {
  StaffLimitError,
} from "../../../services/staff/staffService";
import {
  callerClinicId,
  clinicScopeFilter,
  isSystemAdmin,
  ownsClinicResource,
} from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";

export const getAllStaff: RequestHandler = async (req, res) => {
  try {
    const filter = clinicScopeFilter(req as AuthenticatedRequest);
    const model = await staffService.getAllStaff({ query: req.query, filter });
    return response200({
      res,
      data: model,
      message: "Staff fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getStaffById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await staffService.getStaffById(id);
    if (data && !ownsClinicResource(req as AuthenticatedRequest, data.clinicId)) {
      return response403({ res });
    }
    return response200({ res, data, message: "Staff fetched successfully" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const createOrUpdateStaff: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const areq = req as AuthenticatedRequest;
  const { name, email, password, clinicId } = req.body;

  try {
    // clinic-admin can only add staff to their own clinic.
    const effectiveClinicId = isSystemAdmin(areq)
      ? clinicId
      : callerClinicId(areq) ?? clinicId;

    // On edit, verify the existing staff belongs to the caller's clinic.
    if (id && id !== "new" && !isSystemAdmin(areq)) {
      const existing = await staffService.getStaffById(id);
      if (existing && !ownsClinicResource(areq, existing.clinicId)) {
        return response403({ res });
      }
    }

    const data = await staffService.createOrUpdateStaff({
      id,
      body: { name, email, password, clinicId: effectiveClinicId },
    });
    return response200({
      res,
      data,
      message: "Staff saved successfully",
    });
  } catch (error) {
    if (error instanceof StaffLimitError) {
      return response200({
        res,
        status: false,
        data: null,
        message: error.message,
      });
    }
    debug(error);
    return response500({ res, data: error });
  }
};
