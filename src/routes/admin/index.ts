import express from "express";
import userRoutes from "../../modules/user/routes";
import clinicRoutes from "../../modules/clinic/routes";
import scheduleRoutes from "../../modules/schedule/routes";
import appointmentRoutes from "../../modules/appointment/routes";
import doctorRoutes from "../../modules/doctor/routes";
import staffRoutes from "../../modules/staff/routes";
import dashboardRoutes from "../../modules/dashboard/routes";
import profileRoutes from "../../modules/profile/routes";
import subscriptionRoutes from "../../modules/subscription/routes";
import planAdminRoutes from "../../modules/plan/routes/admin";
import { authenticateToken } from "../../modules/auth/helper";

const adminRoutes = express.Router();

// Guard everything under /admin — requires a valid JWT (sets req.user).
adminRoutes.use(authenticateToken);

adminRoutes.use("/dashboard", dashboardRoutes);
adminRoutes.use("/me", profileRoutes);
adminRoutes.use("/subscription-request", subscriptionRoutes);
adminRoutes.use("/plan", planAdminRoutes);
adminRoutes.use("/user", userRoutes);
adminRoutes.use("/clinic", clinicRoutes);
adminRoutes.use("/doctor", doctorRoutes);
adminRoutes.use("/staff", staffRoutes);
adminRoutes.use("/schedule", scheduleRoutes);
adminRoutes.use("/appointment", appointmentRoutes);

export default adminRoutes;
