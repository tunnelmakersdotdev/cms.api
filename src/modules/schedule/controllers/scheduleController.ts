import { RequestHandler } from "express";
import { response200, response403, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import scheduleService from "../../../services/schedule/scheduleService";
import {
  callerClinicId,
  clinicScopeFilter,
  isSystemAdmin,
  ownsClinicResource,
} from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";

export const getAllSchedules: RequestHandler = async (req, res) => {
  const { doctorId } = req.query;
  try {
    const filter: any = clinicScopeFilter(req as AuthenticatedRequest);
    if (doctorId) filter.doctorId = doctorId;
    const model = await scheduleService.getAllSchedules({
      query: req.query,
      filter,
    });
    return response200({
      res,
      data: model,
      message: "Schedules fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getScheduleById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const oneModel = await scheduleService.getScheduleById(id);
    if (oneModel && !ownsClinicResource(req as AuthenticatedRequest, oneModel.clinicId)) {
      return response403({ res });
    }
    return response200({
      res,
      data: oneModel,
      message: "Schedule fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const createOrUpdateSchedule: RequestHandler = async (req, res) => {
  const areq = req as AuthenticatedRequest;
  const { id } = req.params;
  const { doctorId, clinicId, dayOfWeek, startTime, endTime, slotMinutes, active } =
    req.body;

  try {
    // Force the schedule onto the caller's clinic (system-admin may target any).
    const effectiveClinicId = isSystemAdmin(areq)
      ? clinicId
      : callerClinicId(areq) ?? clinicId;

    // On edit, verify the existing schedule belongs to the caller's clinic.
    if (id && id !== "new" && !isSystemAdmin(areq)) {
      const existing = await scheduleService.getScheduleById(id);
      if (existing && !ownsClinicResource(areq, existing.clinicId)) {
        return response403({ res });
      }
    }

    const data = await scheduleService.createOrUpdateSchedule({
      id,
      body: {
        doctorId,
        clinicId: effectiveClinicId,
        dayOfWeek,
        startTime,
        endTime,
        slotMinutes,
        active,
      },
    });
    response200({
      res,
      data,
      message: "Schedule created/updated successfully",
    });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};
