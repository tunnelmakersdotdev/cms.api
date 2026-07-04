import { RequestHandler } from "express";
import { response200, response403, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import appointmentService from "../../../services/appointment/appointmentService";
import {
  clinicScopeFilter,
  ownsClinicResource,
} from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";
import { emitDisplayChanged } from "../../../socket";

// ---- Admin / staff side --------------------------------------------------

export const getAllAppointments: RequestHandler = async (req, res) => {
  const { doctorId, date, status } = req.query;
  try {
    // Scope to the caller's clinic (system-admin sees all).
    const filter: any = clinicScopeFilter(req as AuthenticatedRequest);
    if (doctorId) filter.doctorId = doctorId;
    if (date) filter.date = date;
    if (status) filter.status = status;
    const model = await appointmentService.getAllAppointments({
      query: req.query,
      filter,
    });
    return response200({
      res,
      data: model,
      message: "Appointments fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getAppointmentById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const oneModel = await appointmentService.getAppointmentById(id);
    if (oneModel && !ownsClinicResource(req as AuthenticatedRequest, oneModel.clinicId)) {
      return response403({ res });
    }
    return response200({
      res,
      data: oneModel,
      message: "Appointment fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const updateAppointmentStatus: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    // Verify the appointment belongs to the caller's clinic.
    const existing = await appointmentService.getAppointmentById(id);
    if (existing && !ownsClinicResource(req as AuthenticatedRequest, existing.clinicId)) {
      return response403({ res });
    }
    const data = await appointmentService.updateStatus({ id, status });
    emitDisplayChanged((existing as any)?.clinicId?.toString());
    return response200({
      res,
      data,
      message: "Appointment status updated",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

// ---- Public / customer booking ------------------------------------------

export const getAvailableSlots: RequestHandler = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;
  try {
    const slots = await appointmentService.getAvailableSlots({
      doctorId,
      date: String(date),
    });
    return response200({
      res,
      data: slots,
      message: "Slots fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const bookAppointment: RequestHandler = async (req, res) => {
  try {
    const result = await appointmentService.bookAppointment({ body: req.body });
    if (!result.ok) {
      return response200({
        res,
        status: false,
        data: null,
        message: "That slot was just taken. Please pick another.",
      });
    }
    emitDisplayChanged(req.body?.clinicId);
    return response200({
      res,
      data: result.appointment,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const cancelAppointment: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await appointmentService.cancelAppointment(id);
    return response200({
      res,
      data,
      message: "Appointment cancelled",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
