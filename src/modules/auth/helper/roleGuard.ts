import { NextFunction, Response } from "express";
import { response403 } from "../../../common/response";
import { AuthenticatedRequest } from "../../../types/main";

/**
 * Route guard: allow the request only if req.user.role is in `allowed`.
 * Runs after authenticateToken (which sets req.user). Returns 403 otherwise.
 *
 * Usage:  router.post("/add", requireRole(ROLE_GROUPS.clinicManagement), handler)
 */
export const requireRole =
  (allowed: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (role && allowed.includes(role)) {
      next();
      return;
    }
    response403({
      res,
      message: "You don't have permission to perform this action",
    });
  };
