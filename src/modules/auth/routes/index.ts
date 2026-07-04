import express from "express";
import {
  googleLogin,
  googleSignUp,
  login,
  registerClinic,
  verifyToken,
} from "../controllers/authController";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/google-login", googleLogin);
authRoutes.post("/google-sign-up", googleSignUp);
authRoutes.post("/register-clinic", registerClinic);
authRoutes.get("/verify-token", verifyToken);

export default authRoutes;
