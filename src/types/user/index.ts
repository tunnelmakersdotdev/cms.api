import { Types } from "mongoose";

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  group: Types.ObjectId;
  password: string;
  media: any;
};



export type AuthJwtUserType = {
  id: string;
  code?: string;
  name?: string;
  previousId?: string;
};
