import UserModel from "../../../database/model/user/AppUserModel";
import { generateToken, verifyPassword } from "../helper";
import { debug } from "../../../common/debug";
import jwt from "jsonwebtoken";
import { Request, } from "express";
import { getAppUser } from "../../../common/function/user";
import { UserType } from "../../../types/user";

const secretKey: string | undefined = process.env.JWT_SECRET ?? "sample";

class AuthService {
  async login(email: string, password: string) {
    try {
      debug("AuthService - login - start", { email, password });
      if (!email || !password) {
        return "Email and Password are required";
      }

      const user = await UserModel.findOne({
        email: email,
        // status: COMMON_STATUS_ACTIVE,
      }).select("id name email password");

      if (user) {
        //ip checking id need

        const passCompare = await verifyPassword(user.password, password);
        if (passCompare) {
          ///otp checking if need
          return this.generateAndResponse({ user: user as UserType });
        }
      }
      return "Invalid email or password";
    } catch (error) {
      debug(error);
      throw error;
    }
  }

  async authVerify({ req }: { req: Request }) {
    try {
      let authHeader = req.headers["authorization"]?.toString();
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        throw Error("Access Denied !!");
      }

      // Use synchronous jwt.verify to ensure a return value
      const user = jwt.verify(token, secretKey ?? "sample") as any;

      let userData = (await getAppUser(user.id)) as UserType;

      const data = await this.generateAndResponse({ user: userData });

      return data;
    } catch (error) {
      debug(error);
      throw error;
    }
  }

  async generateAndResponse({ user }: { user: UserType & { _id?: string } }) {
    const token = generateToken({
      email: user?.email,
      id: (user?.id ?? user._id)?.toString(),
      name: user?.name,
    });

    return {
      access_token: token,
      username: user.email,
      email: user.email,
      user: {
        id: user.id,
        role: ["admin"],
        data: {
          displayName: user.name,
          photoURL: "#",
          email: user.email,
          settings: {
            layout: {},
            theme: {},
          },
        },
      },
    };
  }

  // getSampleAuthResponse = () => {
  //   return {
  //     user: {
  //       id: "0",
  //       role: "admin",
  //       displayName: "Abbott Keitch",
  //       photoURL: "/assets/images/avatars/brian-hughes.jpg",
  //       email: "admin@fusetheme.com",
  //       settings: {
  //         layout: {},
  //         theme: {},
  //       },
  //       shortcuts: ["apps.calendar", "apps.mailbox", "apps.contacts"],
  //     },
  //     access_token:
  //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4NzgzNjMsImlzcyI6IkZ1c2UiLCJleHAiOjE3NjQ0ODMxNjMsImlkIjoiMCJ9.gLqrfnB4JyZMwiaQudnL4RMfGmpZ9-5AeLwD3AETm-E",
  //   };
}

export default AuthService;
