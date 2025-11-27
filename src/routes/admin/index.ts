import e from "express";
import express from "express";
import userRoutes from "../../modules/user/routes";
import clinicRoutes from "../../modules/clinic/routes";

const adminRoutes = express.Router();
adminRoutes.use("/user", userRoutes);
adminRoutes.use("/clinic", clinicRoutes);

export default adminRoutes;
