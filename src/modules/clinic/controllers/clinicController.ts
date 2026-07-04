import { RequestHandler } from "express";
import {
  response200,
  response403,
  response500,
} from "../../../common/response";
import { debug } from "../../../common/debug";
import clinicService from "../../../services/clinic/clinicService";
import {
  callerClinicId,
  clinicScopeFilter,
  isSystemAdmin,
  ownsClinicResource,
} from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";
import { emitClinicChanged } from "../../../socket";

export const getAllClinics: RequestHandler = async (req, res) => {
  const { status } = req.query;
  try {
    // A clinic-admin only sees their own clinic (scoped on the _id field).
    const filter: any = clinicScopeFilter(req, "_id");
    if (status) filter.approvalStatus = status;
    const model = await clinicService.getAllClinics({
      query: req.query,
      filter,
    });
    return response200({
      res,
      data: model,
      message: "Clinics fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const approveClinic: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "approved" | "rejected"
  try {
    const data = await clinicService.setApproval(
      id,
      status === "rejected" ? "rejected" : "approved"
    );
    emitClinicChanged({
      id,
      action: status === "rejected" ? "rejected" : "approved",
    });
    return response200({
      res,
      data,
      message: `Clinic ${status === "rejected" ? "rejected" : "approved"}`,
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getClinicById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    // A clinic-admin may only read their own clinic.
    if (!ownsClinicResource(req as AuthenticatedRequest, id)) {
      return response403({ res });
    }
    const oneModel = await clinicService.getClinicById(id);
    return response200({
      res,
      data: oneModel,
      message: "Clinic fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getClinicUsage: RequestHandler = async (req, res) => {
  const areq = req as AuthenticatedRequest;
  try {
    // system-admin may pass ?clinicId=; everyone else uses their own clinic.
    const clinicId = isSystemAdmin(areq)
      ? (req.query.clinicId as string) || callerClinicId(areq)
      : callerClinicId(areq);
    if (!clinicId) {
      return response200({ res, data: null, message: "No clinic in scope" });
    }
    const usage = await clinicService.getUsage(clinicId);
    return response200({ res, data: usage, message: "Usage fetched" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const createOrUpdateClinic: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    address,
    phones,
    emails,
    website,
    plan,
    maxStaff,
    maxDoctors,
  } = req.body;

  try {
    const data = await clinicService.createOrUpdateClinic({
      id,
      body: {
        name,
        address,
        phones,
        emails,
        website,
        plan,
        maxStaff,
        maxDoctors,
      },
    });
    emitClinicChanged({
      id: (data as any)?.id ?? id,
      action: id && id !== "new" ? "updated" : "created",
    });
    response200({
      res,
      data,
      message: "Clinic created/updated successfully",
    });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};
