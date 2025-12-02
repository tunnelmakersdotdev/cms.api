import { RequestHandler } from "express";
import {
  response200,
  response422,
  response500,
} from "../../../common/response";
import AuthService from "../services/authService";
import { debug } from "../../../common/debug";
import googleService from "../../../services/google/googleService";

const authService = new AuthService();

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
