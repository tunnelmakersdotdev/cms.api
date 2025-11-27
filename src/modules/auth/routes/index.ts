import express from "express";
import { login, verifyToken } from "../controllers/authController";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.get("/verify-token", verifyToken);

export default authRoutes;
