import { FieldValidationError } from "express-validator";
import _ from "lodash";
import { Response } from "express";
import { UserType } from "../../types/user";
import { PAGINATION_DEFAULT_LIMIT } from "../../config";
import { AuthenticatedRequest, UserStampType } from "../../types/main";

type responseType<T = any> = {
  res: Response;
  code?: number;
  status?: boolean;
  title?: string;
  error?: string;
  errors?: any;
  message?: string;
  data?: T;
};
export const response200 = ({
  res,
  status = true,
  message = "success",
  data = null,
  title = "",
  error = "",
}: responseType) => {
  return res.status(200).json({
    status,
    data,
    title,
    message,
    error,
  });
};
export const response201 = ({
  res,
  status = true,
  message = "success",
}: responseType) => {
  return res.status(201).json({
    status,
    message,
  });
};
export const response401 = ({
  res,
  status = true,
  message = "Access Denied !!",
  data,
}: responseType) => {
  return res.status(401).json({
    status,
    data,
    message,
  });
};

export const response404 = ({
  res,
  status = false,
  message = "404",
  data = null,
}: responseType) => {
  return res.status(404).json({
    status,
    data,
    message,
  });
};
export const response403 = ({
  res,
  status = false,
  message = "403 Authentication error",
  data = null,
}: responseType) => {
  return res.status(404).json({
    status,
    data,
    message,
  });
};
export const response422 = ({
  res,
  errors,
  status = false,
  message = "404",
  data = null,
}: responseType) => {
  return res.status(422).json({
    status,
    data,
    message,
    errors,
  });
};
export const response500 = ({
  res,
  status = false,
  data,
  error,
  message = "500",
}: responseType) => {
  return res.status(500).json({
    status,
    message,
    data,
    error,
  });
};

type paginationParamsType = {
  page?: string | number;
  limit?: string | number;
  search?: string;
  sort?: string;
  sortColumn?: string;
};

export const getPaginationParams = ({
  page,
  limit,
  search,
  sort,
  sortColumn,
}: paginationParamsType) => {
  page = parseInt((page ?? 1) as string, 10);
  limit = parseInt((limit ?? PAGINATION_DEFAULT_LIMIT) as string, 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip, search, sort, sortColumn };
};

export const errorResponse = (errors: FieldValidationError[]) => {
  return _.map(errors, (e: any) => {
    return { type: e.path ?? e.type, message: [e.msg] };
  });
};

export const getAuthUser = (req: AuthenticatedRequest): UserType | null => {
  const user = req.user;
  if (user) {
    return user as UserType;
  }
  return null;
};

export const userStampData = (
  req: AuthenticatedRequest
): Partial<UserStampType> => {
  const user = req.user;
  if (user) {
    return { createdBy: user.id, updatedBy: user.id };
  }
  return {};
};

export const userStampDataFromID = (userId: string): Partial<UserStampType> => {
  if (userId) {
    return { createdBy: userId, updatedBy: userId };
  }
  return {};
};

// export const isAdmin = (user: UserType, main = false) => {
//   if ((user.permissions ?? []).includes("super.admin") && main === true) {
//     return true;
//   } else if ((user.permissions ?? []).includes("admin") && main === false) {
//     return true;
//   } else {
//     return false;
//   }
// };

// type permissionChecker = {
//   user: UserType;
//   permission?: string | string[];
//   adminAllow?: boolean;
// };

// export const permissionChecker = ({
//   user,
//   permission,
//   adminAllow = true,
// }: permissionChecker) => {
//   if (adminAllow) {
//     if ((user.permissions ?? []).includes("admin")) {
//       return true;
//     }
//   }
//   if (typeof permission === "string") {
//     if ((user.permissions ?? []).includes(permission)) {
//       return true;
//     }
//   } else {
//     if (
//       _.some(permission, (item: any) =>
//         _.includes(user.permissions ?? [], item)
//       )
//     ) {
//       return true;
//     }
//   }
//   return false;
// };

export const error500Message = (error: any) => {
  if (error.name === "ValidationError") {
    const errorMessages = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
    const formattedError = {
      message: "Validation failed",
      errors: errorMessages,
    };
    return formattedError;
  } else return error;
};

export const getIpAddress = (req: AuthenticatedRequest): string => {
  const ip = req.headers["x-forwarded-for"] || req.ip;
  if (Array.isArray(ip)) {
    return ip[0]; // If multiple IPs are present, return the first one
  }
  return ip as string; // Return the IP address as a string
};

export const getReqUserAgent = (req: AuthenticatedRequest): string => {
  const userAgent = req.get("User-Agent");
  if (Array.isArray(userAgent)) {
    return userAgent[0];
  }
  return userAgent as string;
};
