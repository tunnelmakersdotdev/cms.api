import mongoose, { Schema } from "mongoose";
import { COLLECTION_CLINIC, COLLECTION_GROUP, COLLECTION_USER } from "..";
import { hashPassword } from "../../../modules/auth/helper";
import { USER_ROLES, UserType } from "../../../types/user";

export type ModelType = Pick<
  UserType,
  | "name"
  | "email"
  | "password"
  | "media"
  | "role"
  | "group"
  | "profileImage"
  | "googleId"
  | "clinicId"
  | "specialization"
  | "consultationFee"
  | "isDefault"
  | "approvalStatus"
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
    // one account per email — a user belongs to exactly one clinic
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { type: String, enum: USER_ROLES, default: "customer" },
    group: { type: Schema.Types.ObjectId, ref: COLLECTION_GROUP },
    googleId: { type: String, unique: true, sparse: true },
    profileImage: { type: String },
    // clinic association — required in practice for clinic-admin / doctor / staff
    clinicId: { type: Schema.Types.ObjectId, ref: COLLECTION_CLINIC },
    // doctor-only profile fields
    specialization: { type: String },
    consultationFee: { type: Number },
    isDefault: { type: Boolean, default: false },
    // doctor approval workflow (default approved so non-doctor users & direct
    // system-admin creations are immediately active)
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    // media: { type: [mediaSchema] },
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
