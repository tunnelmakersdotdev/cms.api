import express from "express";
import {
  googleLogin,
  googleSignUp,
  login,
  verifyToken,
} from "../controllers/authController";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/google-login", googleLogin);
authRoutes.post("/google-sign-up", googleSignUp);
authRoutes.get("/verify-token", verifyToken);

export default authRoutes;
