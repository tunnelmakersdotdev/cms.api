import { Request } from "express";
import { AuthJwtUserType } from "../user";

export type AuthenticatedRequest = Request & { user?: AuthJwtUserType };
export type UserStampType = {
  createdBy?: string;
  updatedBy?: string;
};
