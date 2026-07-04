import express from "express";
import {
  createOrUpdateSchedule,
  getAllSchedules,
  getScheduleById,
} from "../controllers/scheduleController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

const scheduleRoutes = express.Router();

scheduleRoutes.get("/", requireRole(ROLE_GROUPS.staffSide), getAllSchedules);
scheduleRoutes.get(
  "/get/:id",
  requireRole(ROLE_GROUPS.staffSide),
  getScheduleById
);
// Defining availability is clinic-admin + system-admin.
scheduleRoutes.post(
  ["/add/", "/add/:id"],
  requireRole(ROLE_GROUPS.clinicManagement),
  createOrUpdateSchedule
);

export default scheduleRoutes;
