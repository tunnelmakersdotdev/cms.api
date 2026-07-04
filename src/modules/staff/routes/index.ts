import express from "express";
import {
  createOrUpdateStaff,
  getAllStaff,
  getStaffById,
} from "../controllers/staffController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

const staffRoutes = express.Router();

// Staff management is clinic-admin (own clinic) + system-admin.
staffRoutes.use(requireRole(ROLE_GROUPS.clinicManagement));

staffRoutes.get("/", getAllStaff);
staffRoutes.post(["/add/", "/add/:id"], createOrUpdateStaff);
staffRoutes.get("/get/:id", getStaffById);

export default staffRoutes;
