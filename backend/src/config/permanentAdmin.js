import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const PERMANENT_ADMIN = {
  name: "Darsh Patel",
  email: "darshnation@gmail.com",
  password: "@Darsh3283",
};

export async function ensurePermanentAdmin() {
  const email = PERMANENT_ADMIN.email.toLowerCase().trim();
  let adminUser = await User.findOne({ email });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(PERMANENT_ADMIN.password, 10);
    adminUser = new User({
      name: PERMANENT_ADMIN.name,
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      isVerified: true,
      isAdminApproved: true,
      otpHash: null,
      otpExpiresAt: null,
    });
    await adminUser.save();
    console.log("Permanent admin account created");
    return;
  }

  let shouldSave = false;

  if (adminUser.name !== PERMANENT_ADMIN.name) {
    adminUser.name = PERMANENT_ADMIN.name;
    shouldSave = true;
  }

  if (adminUser.role !== "admin") {
    adminUser.role = "admin";
    shouldSave = true;
  }

  if (!adminUser.isVerified) {
    adminUser.isVerified = true;
    shouldSave = true;
  }

  if (!adminUser.isAdminApproved) {
    adminUser.isAdminApproved = true;
    shouldSave = true;
  }

  if (adminUser.status !== "active") {
    adminUser.status = "active";
    shouldSave = true;
  }

  if (adminUser.otpHash || adminUser.otpExpiresAt) {
    adminUser.otpHash = null;
    adminUser.otpExpiresAt = null;
    shouldSave = true;
  }

  const passwordMatches = await bcrypt.compare(PERMANENT_ADMIN.password, adminUser.password);
  if (!passwordMatches) {
    adminUser.password = await bcrypt.hash(PERMANENT_ADMIN.password, 10);
    shouldSave = true;
  }

  if (shouldSave) {
    await adminUser.save();
    console.log("Permanent admin account synced");
  }
}
