import { UserRole } from "../types/user";

/**
 * Authorization groups. Higher-privilege roles are included in each group so
 * they inherit access (mirrors the frontend @auth/authRoles).
 */
export const ROLE_GROUPS = {
  /** Only the system administrator. */
  systemAdmin: ["system-admin"] as UserRole[],

  /** Clinic-level management (clinics, doctors, staff, schedules, plans). */
  clinicManagement: ["system-admin", "clinic-admin"] as UserRole[],

  /** Everyone who operates the control panel (i.e. not a customer). */
  staffSide: [
    "system-admin",
    "clinic-admin",
    "doctor",
    "staff",
  ] as UserRole[],
};
