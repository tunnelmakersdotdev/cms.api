import express from "express";
import { getMe } from "../controllers/profileController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

// Any signed-in control-panel user can view their own profile.
const profileRoutes = express.Router();

profileRoutes.get("/", requireRole(ROLE_GROUPS.staffSide), getMe);

export default profileRoutes;
