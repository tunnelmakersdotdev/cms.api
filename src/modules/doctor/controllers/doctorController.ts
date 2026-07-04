import { RequestHandler } from "express";
import {
  response200,
  response401,
  response403,
  response500,
} from "../../../common/response";
import { debug } from "../../../common/debug";
import doctorService, {
  DoctorLimitError,
} from "../../../services/doctor/doctorService";
import {
  callerClinicId,
  clinicScopeFilter,
  isSystemAdmin,
  ownsClinicResource,
} from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";

export const getAllDoctors: RequestHandler = async (req, res) => {
  const { status } = req.query;
  try {
    // Tenancy scope + optional approval-status filter.
    const filter: any = clinicScopeFilter(req as AuthenticatedRequest);
    if (status) filter.approvalStatus = status;
    const model = await doctorService.getAllDoctors({
      query: req.query,
      filter,
    });
    return response200({
      res,
      data: model,
      message: "Doctors fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getDoctorById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const oneModel = await doctorService.getDoctorById(id);
    if (oneModel && !ownsClinicResource(req as AuthenticatedRequest, oneModel.clinicId)) {
      return response403({ res });
    }
    return response200({
      res,
      data: oneModel,
      message: "Doctor fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const createOrUpdateDoctor: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const areq = req as AuthenticatedRequest;
  const {
    name,
    email,
    password,
    clinicId,
    specialization,
    consultationFee,
    isDefault,
  } = req.body;

  try {
    // A clinic-admin can only create doctors in their own clinic, and those
    // start as "pending". A system-admin can target any clinic and is approved.
    const systemAdmin = isSystemAdmin(areq);
    const effectiveClinicId = systemAdmin
      ? clinicId
      : callerClinicId(areq) ?? clinicId;
    const approvalStatus = systemAdmin ? "approved" : "pending";

    const isNew = !id || id === "new";

    // On edit, a non-system-admin can only touch a doctor in their own clinic.
    if (!isNew && !systemAdmin) {
      const existing = await doctorService.getDoctorById(id);
      if (existing && !ownsClinicResource(areq, existing.clinicId)) {
        return response403({ res });
      }
    }

    const data = await doctorService.createOrUpdateDoctor({
      id,
      body: {
        name,
        email,
        password,
        clinicId: effectiveClinicId,
        specialization,
        consultationFee,
        isDefault: !!isDefault,
        // only stamp approvalStatus when creating; edits keep the existing one
        ...(isNew ? { approvalStatus } : {}),
      },
    });
    return response200({
      res,
      data,
      message: isNew
        ? approvalStatus === "pending"
          ? "Doctor request submitted for approval"
          : "Doctor created successfully"
        : "Doctor updated successfully",
    });
  } catch (error) {
    if (error instanceof DoctorLimitError) {
      return response200({ res, status: false, data: null, message: error.message });
    }
    debug(error);
    return response500({ res, data: error });
  }
};

export const approveDoctor: RequestHandler = async (req, res) => {
  const areq = req as AuthenticatedRequest;
  const { id } = req.params;
  const { status } = req.body; // "approved" | "rejected"
  try {
    if (!isSystemAdmin(areq)) {
      return response401({
        res,
        message: "Only a system admin can approve doctors",
      });
    }
    const data = await doctorService.setApprovalStatus(
      id,
      status === "rejected" ? "rejected" : "approved"
    );
    return response200({
      res,
      data,
      message: `Doctor ${status === "rejected" ? "rejected" : "approved"}`,
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
