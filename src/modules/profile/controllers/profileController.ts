import { RequestHandler } from "express";
import { response200, response401, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import profileService from "../../../services/profile/profileService";
import { AuthenticatedRequest } from "../../../types/main";

export const getMe: RequestHandler = async (req, res) => {
  const areq = req as AuthenticatedRequest;
  const userId = (areq.user?.id ?? (areq.user as any)?._id)?.toString();
  try {
    if (!userId) {
      return response401({ res, message: "Not authenticated" });
    }
    const data = await profileService.getMe(userId);
    return response200({ res, data, message: "Profile fetched" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
