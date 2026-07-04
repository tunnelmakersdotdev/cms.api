import express from "express";
import {
  createOrUpdateUser,
  getAllUsers,
  getUserById,
} from "../controllers/userController";
import { requireRole } from "../../auth/helper/roleGuard";
import { ROLE_GROUPS } from "../../../config/roles";

const userRoutes = express.Router();

// Generic user administration is system-admin only. Clinic-admins manage their
// people through the dedicated Doctors and Staff modules instead.
userRoutes.use(requireRole(ROLE_GROUPS.systemAdmin));

userRoutes.get("/", getAllUsers);
userRoutes.get("/get/:id", getUserById);
userRoutes.post("/add", createOrUpdateUser);
userRoutes.post("/add/:id", createOrUpdateUser);

export default userRoutes;
