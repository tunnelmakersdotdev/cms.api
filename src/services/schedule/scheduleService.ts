import { isValidObjectId } from "mongoose";
import ScheduleModel from "../../database/model/schedule/ScheduleModel";
import { extractSelect, paginationQueryBuilder } from "../../mongoose";

class ScheduleService {
  async getAllSchedules({ query, filter }: { query: any; filter: any }) {
    try {
      const model = await paginationQueryBuilder({
        _model: ScheduleModel,
        query,
        select: extractSelect(
          "doctorId clinicId dayOfWeek startTime endTime slotMinutes active"
        ),
        where: filter,
        populate: [{ path: "doctorId", select: "name email" } as any],
      });
      return model;
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdateSchedule({ id, body }: { id: string; body: any }) {
    try {
      if (isValidObjectId(id)) {
        const oneModel = await ScheduleModel.findByIdAndUpdate(id, body, {
          new: true,
        });
        return oneModel ? oneModel.toObject() : null;
      } else {
        const newModel = new ScheduleModel(body);
        await newModel.save();
        return newModel.toObject();
      }
    } catch (error) {
      throw error;
    }
  }

  async getScheduleById(id: string) {
    try {
      const oneModel = await ScheduleModel.findById(id).select(
        extractSelect(
          "doctorId clinicId dayOfWeek startTime endTime slotMinutes active"
        )
      );
      return oneModel ? oneModel.toObject() : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Active schedules for a doctor on a given weekday — used by slot computation.
   */
  async getActiveSchedulesForDay(doctorId: string, dayOfWeek: number) {
    return ScheduleModel.find({ doctorId, dayOfWeek, active: true }).lean();
  }
}

export default new ScheduleService();
