import express from "express";
import { getDashboard } from "../controllers/dashboardController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/", requireRole(ROLE_GROUPS.staffSide), getDashboard);

export default dashboardRoutes;
