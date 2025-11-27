import { RequestHandler } from "express";
import { debug } from "../../../common/debug";
import { response200, response500 } from "../../../common/response";
import userServices from "../../../services/user/userServices";

export const createOrUpdateUser: RequestHandler = async (req, res) => {
  const { id } = req.params;

  debug("UserController - createOrUpdateUser - payload:", {
    id,
    body: req.body,
  });
  try {
    const data = await userServices.createOrUpdateUser({ id, body: req.body });
    response200({
      res,
      data,
      message: "User created/updated successfully",
    });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};

export const getAllUsers: RequestHandler = async (req, res) => {
  const {} = req.params;
  try {
    const data = await userServices.getAllUsers({
      query: req.query,
      filter: {},
    });
    return response200({ res, data, message: "Users fetched successfully" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await userServices.getUserById(id);
    return response200({ res, data, message: "User fetched successfully" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
