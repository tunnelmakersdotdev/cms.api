import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "..";
import UserModel from "../model/user/AppUserModel";

/**
 * Seed (or promote) the main system administrator.
 *
 * Run with:  npm run seed:admin
 * Override the password via env:  SEED_ADMIN_PASSWORD=yourpass npm run seed:admin
 *
 * Re-running is safe (idempotent): an existing user with this email is promoted
 * to system-admin and its password reset to the configured value.
 */
const ADMIN_EMAIL = "rishvanrv7@gmail.com";
const ADMIN_NAME = "Rishvan";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";

const seedAdmin = async (): Promise<void> => {
  await connectDB();

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    existing.role = "system-admin";
    existing.name = existing.name || ADMIN_NAME;
    existing.password = ADMIN_PASSWORD; // pre-save hook re-hashes it
    await existing.save();
    console.log(`Promoted existing user to system-admin: ${ADMIN_EMAIL}`);
  } else {
    const admin = new UserModel({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: "system-admin",
      password: ADMIN_PASSWORD, // pre-save hook hashes it
    });
    await admin.save();
    console.log(`Created system-admin: ${ADMIN_EMAIL}`);
  }

  console.log(`Login password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
