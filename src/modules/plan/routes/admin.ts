import express from "express";
import {
  createOrUpdatePlan,
  getAllPlans,
} from "../controllers/planController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

// Plan management — system-admin only. Mounted at /admin/plan.
const planAdminRoutes = express.Router();

planAdminRoutes.get("/", requireRole(ROLE_GROUPS.systemAdmin), getAllPlans);
planAdminRoutes.post(
  ["/add/", "/add/:id"],
  requireRole(ROLE_GROUPS.systemAdmin),
  createOrUpdatePlan
);

export default planAdminRoutes;
