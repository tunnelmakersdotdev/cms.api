import express from "express";
import authRoutes from "../modules/auth/routes";
import adminRoutes from "./admin";
import bookingRoutes from "../modules/appointment/routes/booking";
import displayRoutes from "../modules/display/routes";
import planPublicRoutes from "../modules/plan/routes/public";

const allRoutes = express.Router();

allRoutes.use("/auth", authRoutes);
allRoutes.use("/admin", adminRoutes);
allRoutes.use("/booking", bookingRoutes);
allRoutes.use("/display", displayRoutes);
allRoutes.use("/plans", planPublicRoutes);

allRoutes.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

export default allRoutes;
