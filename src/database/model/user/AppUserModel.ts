import mongoose, { Schema } from "mongoose";
import { COLLECTION_GROUP, COLLECTION_USER } from "..";
import { hashPassword } from "../../../modules/auth/helper";
import { UserType } from "../../../types/user";

export type ModelType = Pick<
  UserType,
  "name" | "email" | "password" | "media" | "role" | "group"
> & {
  x__: string;
};

const mediaSchema = new mongoose.Schema(
  {
    documentId: { type: String },
    source: { type: String },
    url: { type: String },
    key: { type: String },
    mime: { type: String },
  },
  { _id: false }
);

const userSchema: mongoose.Schema<ModelType> = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    group: { type: Schema.Types.ObjectId, ref: COLLECTION_GROUP },
    media: { type: [mediaSchema] },
    x__: { type: String, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (this, next) {
  if (this.isModified("password")) {
    this.x__ = this.password;
    this.password = await hashPassword(this.password);
  }
  next();
});
userSchema.pre("findOneAndUpdate", async function (this, next) {
  const update: any = this.getUpdate();
  if (update && update?.password) {
    const password = update?.password;
    update.x__ = password;
    const hPassword = await hashPassword(password);
    update.password = hPassword;
  }
  next();
});

const UserModel = mongoose.model<ModelType>(
  COLLECTION_USER,
  userSchema,
  COLLECTION_USER
);

export default UserModel;
