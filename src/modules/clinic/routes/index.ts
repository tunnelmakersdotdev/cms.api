import express from "express";
import {
  approveClinic,
  createOrUpdateClinic,
  getAllClinics,
  getClinicById,
  getClinicUsage,
} from "../controllers/clinicController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

const clinicRoutes = express.Router();

// Reads: system-admin + clinic-admin (scoped to own clinic in the controller).
clinicRoutes.get("/", requireRole(ROLE_GROUPS.clinicManagement), getAllClinics);
clinicRoutes.get(
  "/usage",
  requireRole(ROLE_GROUPS.clinicManagement),
  getClinicUsage
);
clinicRoutes.get(
  "/get/:id",
  requireRole(ROLE_GROUPS.clinicManagement),
  getClinicById
);
// Creating clinics & setting plans is system-admin only.
clinicRoutes.post(
  ["/add/", "/add/:id"],
  requireRole(ROLE_GROUPS.systemAdmin),
  createOrUpdateClinic
);
// Approving/rejecting a clinic registration is system-admin only.
clinicRoutes.post(
  "/approve/:id",
  requireRole(ROLE_GROUPS.systemAdmin),
  approveClinic
);

export default clinicRoutes;
