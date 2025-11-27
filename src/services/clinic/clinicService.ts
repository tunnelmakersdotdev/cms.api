import { isValidObjectId } from "mongoose";
import ClinicModel from "../../database/model/clinic/ClinicModel";
import { paginationQueryBuilder } from "../../mongoose";

class ClinicService {
  async getAllClinics({ query, filter }: { query: any; filter: any }) {
    try {
      const model = await paginationQueryBuilder({
        _model: ClinicModel,
        query,
        select: "",
        likeSearch: "name",
        where: filter,
      });

      return model;
    } catch (error) {
      throw error;
    }
    // Logic to get all clinics
  }

  async createOrUpdateClinic({ id, body }: { id: string; body: any }) {
    try {
      if (isValidObjectId(id)) {
        //update
        const oneMOdel = await ClinicModel.findByIdAndUpdate(id, body, {
          new: true,
        });
        return oneMOdel ? oneMOdel.toObject() : null;
      } else {
        const newModel = new ClinicModel(body);
        await newModel.save();
        return newModel.toObject();
      }
    } catch (error) {
      throw error;
    }
  }
  async getClinicById(id: string) {
    try {
      const oneModel = await ClinicModel.findById(id);
      return oneModel ? oneModel.toObject() : null;
    } catch (error) {
      throw error;
    }
    // Logic to get clinic by ID
  }
}

export default new ClinicService();
