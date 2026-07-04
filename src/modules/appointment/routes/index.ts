import express from "express";
import {
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from "../controllers/appointmentController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

// Admin/staff routes — mounted under /admin/appointment (JWT-guarded).
// Everyone on the staff side can view/manage their clinic's appointments.
const appointmentRoutes = express.Router();

appointmentRoutes.use(requireRole(ROLE_GROUPS.staffSide));

appointmentRoutes.get("/", getAllAppointments);
appointmentRoutes.get("/get/:id", getAppointmentById);
appointmentRoutes.post("/status/:id", updateAppointmentStatus);

export default appointmentRoutes;
