import { RequestHandler } from "express";
import { response200, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import dashboardService from "../../../services/dashboard/dashboardService";
import { callerClinicId, isSystemAdmin } from "../../../common/function/scope";
import { AuthenticatedRequest } from "../../../types/main";

export const getDashboard: RequestHandler = async (req, res) => {
  const areq = req as AuthenticatedRequest;
  try {
    const data = await dashboardService.getStats({
      systemAdmin: isSystemAdmin(areq),
      clinicId: callerClinicId(areq),
    });
    return response200({ res, data, message: "Dashboard fetched" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
