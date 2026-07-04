import express from "express";
import { getActivePlans } from "../controllers/planController";

// Public active-plan list for dropdowns. Mounted at /plans.
const planPublicRoutes = express.Router();

planPublicRoutes.get("/", getActivePlans);

export default planPublicRoutes;
