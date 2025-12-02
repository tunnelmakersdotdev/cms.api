import { RequestHandler } from "express";
import { response200, response500 } from "../../../common/response";
import { debug } from "../../../common/debug";
import clinicService from "../../../services/clinic/clinicService";

export const getAllClinics: RequestHandler = async (req, res) => {
  const {} = req.params;
  try {
    const model = await clinicService.getAllClinics({
      query: req.query,
      filter: {},
    });
    return response200({
      res,
      data: model,
      message: "Clinics fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const getClinicById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const oneModel = await clinicService.getClinicById(id);
    return response200({
      res,
      data: oneModel,
      message: "Clinic fetched successfully",
    });
  } catch (error) {
    debug(error);
    return response500({ res, data: error });
  }
};

export const createOrUpdateClinic: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { name, address, phones, emails, website, username, password } =
    req.body;

  try {
    const data = await clinicService.createOrUpdateClinic({
      id,
      body: {
        name,
        address,
        phones,
        emails,
        website,
      },
    });
    response200({
      res,
      data,
      message: "Clinic created/updated successfully",
    });
    return;
  } catch (error) {
    debug(error);
    response500({ res, data: error });
    return;
  }
};
