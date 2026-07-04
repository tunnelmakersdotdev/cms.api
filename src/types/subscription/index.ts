import { Types } from "mongoose";
import { PlanType } from "../clinic";

export type SubscriptionRequestType = {
  id: string;
  clinicId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  currentPlan: PlanType;
  requestedPlan: PlanType;
  maxStaff?: number; // for custom plan requests
  maxDoctors?: number; // for custom plan requests
  note?: string;
  status: "pending" | "approved" | "rejected";
};
