import express from "express";
import authRoutes from "../modules/auth/routes";
import adminRoutes from "./admin";

const allRoutes = express.Router();

allRoutes.use("/auth", authRoutes);
allRoutes.use("/admin", adminRoutes);

allRoutes.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

export default allRoutes;
