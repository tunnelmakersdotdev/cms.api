import { RequestHandler } from "express";
import { debug } from "../../../common/debug";
import { response200, response403, response500 } from "../../../common/response";
import userServices from "../../../services/user/userServices";
import {
  callerClinicId,
  clinicScopeFilter,
  isSystemAdmin,
  ownsClinicResource,
} from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";

export const createOrUpdateUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const areq = req as AuthenticatedRequest;

  debug("UserController - createOrUpdateUser - payload:", {
    id,
    body: req.body,
  });
  try {
    const systemAdmin = isSystemAdmin(areq);
    const body = { ...req.body };

    // A clinic-admin can only create users in their own clinic and may not
    // mint another system-admin.
    if (!systemAdmin) {
      body.clinicId = callerClinicId(areq);
      if (body.role === "system-admin") delete body.role;

      // On edit, the target user must belong to the caller's clinic.
      if (id && id !== "new") {
        const existing = await userServices.getUserById(id);
        if (existing && !ownsClinicResource(areq, (existing as any).clinicId)) {
          return response403({ res });
        }
      }
    }

    const data = await userServices.createOrUpdateUser({ id, body });
    response200({
      res,
      data,
      message: "User created/updated successfully",
    });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};

export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    // Scope to the caller's clinic — a clinic-admin must not see the system
    // admin or users from other clinics.
    const filter = clinicScopeFilter(req as AuthenticatedRequest);
    const data = await userServices.getAllUsers({
      query: req.query,
      filter,
    });
    return response200({ res, data, message: "Users fetched successfully" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await userServices.getUserById(id);
    if (data && !ownsClinicResource(req as AuthenticatedRequest, (data as any).clinicId)) {
      return response403({ res });
    }
    return response200({ res, data, message: "User fetched successfully" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
