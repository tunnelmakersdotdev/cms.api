import { RequestHandler } from "express";
import {
  response200,
  response422,
  response500,
} from "../../../common/response";
import AuthService from "../services/authService";
import { debug } from "../../../common/debug";
import googleService from "../../../services/google/googleService";
import clinicService from "../../../services/clinic/clinicService";
import { emitClinicChanged } from "../../../socket";

const authService = new AuthService();

export const registerClinic: RequestHandler = async (req, res) => {
  const {
    clinicName,
    address,
    plan,
    maxStaff,
    maxDoctors,
    name,
    email,
    password,
  } = req.body;
  try {
    if (!clinicName || !name || !email || !password) {
      response422({
        res,
        message: "Clinic name, your name, email and password are required",
      });
      return;
    }
    const result = await clinicService.registerClinic({
      clinic: { name: clinicName, address, plan, maxStaff, maxDoctors },
      owner: { name, email, password },
    });
    if (!result.ok) {
      response422({
        res,
        message: "An account with this email already exists",
      });
      return;
    }
    emitClinicChanged({ id: result.clinicId, action: "created" });
    response200({
      res,
      data: { clinicId: result.clinicId, status: "pending" },
      message:
        "Registration submitted. Your clinic is pending admin approval — you'll be able to sign in once approved.",
    });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const oneModel = await authService.login(email, password);

    if (typeof oneModel === "string") {
      response422({ res, message: oneModel });
      return;
    }
    response200({ res, data: oneModel });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};
export const googleSignUp: RequestHandler = async (req, res) => {
  const { credential } = req.body;
  try {
    const googleUser = await googleService.verifyGoogleToken(credential);
    const oneModel = await authService.googleSignUp(googleUser);

    debug("Google SignUp - Token Verified", { oneModel });

    if (typeof oneModel === "string") {
      response422({ res, message: oneModel });
      return;
    }
    response200({ res, data: oneModel });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};
export const googleLogin: RequestHandler = async (req, res) => {
  const { credential } = req.body;
  try {
    const googleUser = await googleService.verifyGoogleToken(credential);
    const oneModel = await authService.googleLogin(googleUser);
    if (typeof oneModel === "string") {
      response422({ res, message: oneModel });
      return;
    }
    response200({ res, data: oneModel });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};

export const verifyToken: RequestHandler = async (req, res) => {
  try {
    const oneModel = await authService.authVerify({ req });

    if (oneModel) {
      response200({
        res,
        data: oneModel,
        message: "User verified successfully",
      });
    }
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error, message: "User verification failed" });
    return;
  }
};
