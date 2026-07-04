import express from "express";
import { getDisplay } from "../controllers/displayController";

// Public token-display board — no auth (shown on a waiting-room screen).
const displayRoutes = express.Router();

displayRoutes.get("/:displayId", getDisplay);

export default displayRoutes;
