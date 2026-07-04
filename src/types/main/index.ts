import { Request } from "express";
import { AuthJwtUserType, UserType } from "../user";

// authenticateToken sets req.user to the full app user (incl. role + clinicId),
// not just the JWT payload — type it accordingly for tenancy scoping.
export type AuthenticatedRequest = Request & {
  user?: AuthJwtUserType & Partial<UserType>;
};
export type UserStampType = {
  createdBy?: string;
  updatedBy?: string;
};
