import UserModel from "../../../database/model/user/AppUserModel";
import { extractSelect } from "../../../mongoose";
import { UserType } from "../../../types/user";

export const getAppUser = async (
  userId: string
): Promise<Partial<UserType>> => {
  const user = await UserModel.findById(userId)
    .select(extractSelect("id name email"))
    .lean();
  return user as Partial<UserType>;
};
