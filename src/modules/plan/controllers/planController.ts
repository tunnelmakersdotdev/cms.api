import { RequestHandler } from "express";
import { response200, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import planService from "../../../services/plan/planService";

// Public — active plans for dropdowns (registration, settings, clinic form).
export const getActivePlans: RequestHandler = async (_req, res) => {
  try {
    const data = await planService.getActive();
    return response200({ res, data, message: "Plans fetched" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

// Admin — all plans (incl. inactive) for management.
export const getAllPlans: RequestHandler = async (_req, res) => {
  try {
    const data = await planService.getAll();
    return response200({ res, data, message: "Plans fetched" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const createOrUpdatePlan: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { key, name, maxStaff, maxDoctors, price, editableCounts, active, sortOrder } =
    req.body;
  try {
    const data = await planService.createOrUpdate({
      id,
      body: {
        key,
        name,
        maxStaff: Number(maxStaff) || 0,
        maxDoctors: Number(maxDoctors) || 0,
        price: Number(price) || 0,
        editableCounts: !!editableCounts,
        active: active !== false,
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return response200({ res, data, message: "Plan saved" });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};
