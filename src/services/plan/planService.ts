import { isValidObjectId } from "mongoose";
import PlanModel from "../../database/model/plan/PlanModel";

// Default catalog seeded on first use. Base/Pro use the catalog (master plan)
// counts; only Enterprise allows per-clinic editable counts.
const DEFAULT_PLANS = [
  { key: "base", name: "Base", maxStaff: 2, maxDoctors: 3, price: 0, editableCounts: false, active: true, sortOrder: 1 },
  { key: "pro", name: "Pro", maxStaff: 5, maxDoctors: 10, price: 999, editableCounts: false, active: true, sortOrder: 2 },
  { key: "enterprise", name: "Enterprise", maxStaff: 20, maxDoctors: 50, price: 4999, editableCounts: true, active: true, sortOrder: 3 },
];

// Expose a string `id` (the frontend keys on it) alongside the lean fields.
const withId = (p: any) => ({ ...p, id: p?._id?.toString() });

class PlanService {
  /** Seed the default plans once if the catalog is empty. */
  async ensureSeeded() {
    const count = await PlanModel.estimatedDocumentCount();
    if (count === 0) {
      await PlanModel.insertMany(DEFAULT_PLANS);
    }
  }

  async getActive() {
    await this.ensureSeeded();
    const plans = await PlanModel.find({ active: true })
      .sort({ sortOrder: 1 })
      .lean();
    return plans.map(withId);
  }

  async getAll() {
    await this.ensureSeeded();
    const plans = await PlanModel.find({}).sort({ sortOrder: 1 }).lean();
    return plans.map(withId);
  }

  async getByKey(key: string) {
    return PlanModel.findOne({ key }).lean();
  }

  async createOrUpdate({ id, body }: { id: string; body: any }) {
    if (isValidObjectId(id)) {
      const updated = await PlanModel.findByIdAndUpdate(id, body, {
        new: true,
      });
      return updated ? updated.toObject() : null;
    }
    const created = new PlanModel(body);
    await created.save();
    return created.toObject();
  }
}

export default new PlanService();
