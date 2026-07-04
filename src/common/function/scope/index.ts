import { AuthenticatedRequest } from "../../../types/main";

/**
 * Build a Mongoose filter that scopes a query to the requesting user's clinic.
 *
 * - system-admin → {} (sees every clinic)
 * - clinic-admin / doctor / staff → { [field]: their clinicId }
 *
 * `field` is the property holding the clinic reference on the target collection
 * (e.g. "clinicId" for doctors/staff/appointments, "_id" for the clinic itself).
 */
export const clinicScopeFilter = (
  req: AuthenticatedRequest,
  field: string = "clinicId"
): Record<string, any> => {
  const user = req.user;
  if (!user || user.role === "system-admin") {
    return {};
  }
  if (user.clinicId) {
    return { [field]: user.clinicId };
  }
  // A non-admin with no clinic should see nothing rather than everything.
  return { [field]: "__none__" };
};

export const isSystemAdmin = (req: AuthenticatedRequest): boolean =>
  req.user?.role === "system-admin";

/** The clinic a non-system-admin user belongs to (for forcing ownership on create). */
export const callerClinicId = (
  req: AuthenticatedRequest
): string | undefined => {
  const cid = req.user?.clinicId as any;
  return cid ? cid.toString() : undefined;
};

/**
 * Object-level authorization: may the caller access a record belonging to
 * `resourceClinicId`? system-admin → always; others → only their own clinic.
 * The resource ref may be a raw id, a populated { _id }, or undefined.
 */
export const ownsClinicResource = (
  req: AuthenticatedRequest,
  resourceClinicId: any
): boolean => {
  if (isSystemAdmin(req)) return true;
  const callerId = callerClinicId(req);
  if (!callerId || !resourceClinicId) return false;
  const resId =
    typeof resourceClinicId === "object"
      ? (resourceClinicId._id ?? resourceClinicId.id ?? resourceClinicId).toString()
      : resourceClinicId.toString();
  return callerId === resId;
};
