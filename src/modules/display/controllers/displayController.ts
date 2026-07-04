import { RequestHandler } from "express";
import { response200, response404, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import displayService from "../../../services/display/displayService";

export const getDisplay: RequestHandler = async (req, res) => {
  const { displayId } = req.params;
  try {
    const data = await displayService.getDisplayData(displayId);
    if (!data) {
      return response404({ res, message: "Display not found" });
    }
    return response200({ res, data, message: "Display fetched" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
