import express from "express";
import {
  approveSubscriptionRequest,
  createSubscriptionRequest,
  getSubscriptionRequests,
} from "../controllers/subscriptionController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

const subscriptionRoutes = express.Router();

// Clinic-admin requests a change & views their own; system-admin sees all.
subscriptionRoutes.post(
  "/",
  requireRole(ROLE_GROUPS.clinicManagement),
  createSubscriptionRequest
);
subscriptionRoutes.get(
  "/",
  requireRole(ROLE_GROUPS.clinicManagement),
  getSubscriptionRequests
);
// Approving/rejecting is system-admin only.
subscriptionRoutes.post(
  "/:id/approve",
  requireRole(ROLE_GROUPS.systemAdmin),
  approveSubscriptionRequest
);

export default subscriptionRoutes;
