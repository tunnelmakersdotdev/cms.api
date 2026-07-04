import { Types } from "mongoose";

export type UserRole =
  | "system-admin"
  | "clinic-admin"
  | "doctor"
  | "staff"
  | "customer";

export const USER_ROLES: UserRole[] = [
  "system-admin",
  "clinic-admin",
  "doctor",
  "staff",
  "customer",
];

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  group: Types.ObjectId;
  googleId?: string;
  profileImage?: string;
  password: string;
  media: any;
  // clinic association — set for clinic-admin / doctor / staff (one user → one clinic)
  clinicId?: Types.ObjectId;
  // doctor-only profile fields
  specialization?: string;
  consultationFee?: number;
  // marks the clinic's default doctor (pre-selected in booking)
  isDefault?: boolean;
  // doctor approval workflow: clinic-admin requests → system-admin approves
  approvalStatus?: "pending" | "approved" | "rejected";
};

export type AuthJwtUserType = {
  id: string;
  code?: string;
  name?: string;
  previousId?: string;
};
