import express from "express";
import {
  approveDoctor,
  createOrUpdateDoctor,
  getAllDoctors,
  getDoctorById,
} from "../controllers/doctorController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

const doctorRoutes = express.Router();

// Reads visible to anyone on the staff side (scoped to their clinic).
doctorRoutes.get("/", requireRole(ROLE_GROUPS.staffSide), getAllDoctors);
doctorRoutes.get("/get/:id", requireRole(ROLE_GROUPS.staffSide), getDoctorById);
// Clinic-admin requests doctors; system-admin can also create directly.
doctorRoutes.post(
  ["/add/", "/add/:id"],
  requireRole(ROLE_GROUPS.clinicManagement),
  createOrUpdateDoctor
);
// Approval is system-admin only.
doctorRoutes.post(
  "/approve/:id",
  requireRole(ROLE_GROUPS.systemAdmin),
  approveDoctor
);

export default doctorRoutes;
