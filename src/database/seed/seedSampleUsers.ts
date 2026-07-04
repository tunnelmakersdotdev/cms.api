import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "..";
import UserModel from "../model/user/AppUserModel";
import ClinicModel from "../model/clinic/ClinicModel";

/**
 * Seed one sample user per non-admin role for local testing.
 *
 * Run with:  npm run seed:users
 * Override the shared password:  SEED_USER_PASSWORD=yourpass npm run seed:users
 *
 * Idempotent: re-running updates the same users (matched by email).
 */
const PASSWORD = process.env.SEED_USER_PASSWORD ?? "Test@123";

const seedSampleUsers = async (): Promise<void> => {
  await connectDB();

  // 1. Ensure a sample clinic exists (on the Pro plan) to attach users to.
  const clinicDefaults = {
    name: "Sample Clinic",
    emails: ["info@sampleclinic.test"],
    phones: ["+910000000000"],
    address: {
      street: "1 Main St",
      city: "Nilambur",
      state: "Kerala",
      zip: "679329",
      country: "India",
    },
    plan: "pro",
    maxStaff: 5,
    maxDoctors: 10,
  };
  let clinic = await ClinicModel.findOne({ name: "Sample Clinic" });
  if (!clinic) {
    clinic = await ClinicModel.create(clinicDefaults);
  } else {
    // backfill plan caps + display code on a clinic created earlier
    clinic.set({ plan: "pro", maxStaff: 5, maxDoctors: 10 });
    if (!clinic.displayId) {
      const { generateDisplayId } = await import(
        "../model/clinic/ClinicModel"
      );
      clinic.set({ displayId: generateDisplayId() });
    }
    await clinic.save();
  }
  const clinicId = clinic._id;

  // 2. Define one user per non-admin role.
  const users: Array<Record<string, any>> = [
    {
      name: "Clinic Admin",
      email: "clinicadmin@example.com",
      role: "clinic-admin",
      clinicId,
    },
    {
      name: "Dr. Sample Doctor",
      email: "doctor@example.com",
      role: "doctor",
      clinicId,
      specialization: "General Medicine",
      consultationFee: 300,
    },
    {
      name: "Front Desk Staff",
      email: "staff@example.com",
      role: "staff",
      clinicId,
    },
    {
      name: "Sample Customer",
      email: "customer@example.com",
      role: "customer",
    },
  ];

  // 3. Upsert each (save() so the password pre-save hook hashes it).
  for (const u of users) {
    const existing = await UserModel.findOne({ email: u.email });
    if (existing) {
      Object.assign(existing, u);
      existing.password = PASSWORD;
      await existing.save();
      console.log(`Updated ${u.role}: ${u.email}`);
    } else {
      const created = new UserModel({ ...u, password: PASSWORD });
      await created.save();
      console.log(`Created ${u.role}: ${u.email}`);
    }
  }

  console.log("\nSample credentials (password for all): " + PASSWORD);
  console.table(
    users.map((u) => ({ role: u.role, email: u.email, password: PASSWORD }))
  );

  await mongoose.disconnect();
  process.exit(0);
};

seedSampleUsers().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
