import bcrypt from "bcrypt";
import { debug } from "../../../common/debug";
import jwt from "jsonwebtoken";
import { AuthJwtUserType, UserType } from "../../../types/user";
import { AuthenticatedRequest } from "../../../types/main";
import { NextFunction, Response } from "express";
import { response401 } from "../../../common/response";
import { getAppUser } from "../../../common/function/user";

const passwordSalt: number = 7;
const secretKey: string | undefined = process.env.JWT_SECRET;

export const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, passwordSalt);
  return hashedPassword;
};

export const verifyPassword = async (
  hashedPassword: string,
  userInput: string
): Promise<boolean> => {
  debug("userInput,hashPassword", userInput, hashedPassword);

  return await bcrypt.compare(userInput, hashedPassword);
};

export const generateToken = (
  user: { expiry?: string } & Partial<UserType>
): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    } as AuthJwtUserType,
    secretKey ?? "rishu_secret_key_here",
    { expiresIn: user.expiry ?? "24h" } as jwt.SignOptions
  );
};

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let authHeader = req.headers["authorization"]?.toString();

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    response401({ res, message: "Access Denied !!" });
    return;
  }

  jwt.verify(token, secretKey ?? "sample", async (err: any, user: any) => {
    if (err) {
      response401({ res, message: "Access Denied !!" });
      return;
    }

    let userData = (await getAppUser(user.id)) as UserType;
    req.user = userData;

    // const ip = req.ip;
    // const userAgent = req.get("User-Agent");

    // let userIp = userData.ip;
    // let uAgent = userData.userAgent;
    // if (!ip || !userAgent) {
    //   return response401({
    //     res,
    //     message: "Access Denied N/A",
    //     data: { ip, userAgent },
    //   });
    // }

    // if (typeof userIp !== "undefined" && ip != USER_DEFAULT_IP) {
    //   if (!userIp.includes("*") && !userIp.includes(ip)) {
    //     return response401({ res, message: "Access Denied Ip" });
    //   }
    //   if (typeof uAgent !== "undefined" && !uAgent.includes("*")) {
    //     if (userAgent && !uAgent.includes(userAgent)) {
    //       return response401({ res, message: "Access Denied useragent" });
    //     }
    //   }
    // }
    // console.log(req.user);

    next();
  });
};
