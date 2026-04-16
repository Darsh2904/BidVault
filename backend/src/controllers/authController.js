import bcrypt from "bcryptjs";
import User from "../models/User.js";
import BlockedEmail from "../models/BlockedEmail.js";
import { signToken } from "../utils/token.js";
import { sendAdminApprovalEmail, sendOtpEmail, sendPasswordResetOtpEmail, sendWelcomeEmail } from "../utils/sendOtpEmail.js";

function normalizeRole(inputRole) {
  return inputRole === "admin" ? "admin" : "buyer_seller";
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isVerified: user.isVerified,
    isAdminApproved: user.isAdminApproved,
  };
}

export async function requestSignupOtp(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedRole = normalizeRole(role);

    const blocked = await BlockedEmail.findOne({ email: normalizedEmail });
    if (blocked) {
      return res.status(403).json({ message: "This email is blocked from BidVault." });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing.isVerified) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(password, 10);

    const hasApprovedAdmin =
      (await User.countDocuments({
        role: "admin",
        isVerified: true,
        isAdminApproved: true,
      })) > 0;

    const nextAdminApproved = normalizedRole === "admin" ? !hasApprovedAdmin : false;

    let user = existing;
    if (!user) {
      user = new User({
        name,
        email: normalizedEmail,
        password: passwordHash,
        role: normalizedRole,
        status: "active",
        isVerified: false,
        isAdminApproved: nextAdminApproved,
        otpHash,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
    } else {
      user.name = name;
      user.password = passwordHash;
      user.role = normalizedRole;
      user.status = "active";
      user.isVerified = false;
      user.isAdminApproved = nextAdminApproved;
      user.otpHash = otpHash;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    }

    await user.save();
    await sendOtpEmail(normalizedEmail, otp);

    const response = {
      message: "OTP sent to your email",
      email: normalizedEmail,
    };

    if (process.env.NODE_ENV !== "production") {
      response.devOtp = otp;
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
}

export async function verifySignupOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const blocked = await BlockedEmail.findOne({ email: normalizedEmail });
    if (blocked) {
      return res.status(403).json({ message: "This email is blocked from BidVault." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found for OTP verification" });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No OTP request found for this user" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired. Please request a new OTP" });
    }

    const isMatch = await bcrypt.compare(String(otp), user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;

    if (user.role === "admin") {
      const hasApprovedAdmin =
        (await User.countDocuments({
          role: "admin",
          isVerified: true,
          isAdminApproved: true,
          _id: { $ne: user._id },
        })) > 0;

      if (!hasApprovedAdmin) {
        user.isAdminApproved = true;
      }
    }

    await user.save();

    return res.status(200).json({
      message: "Signup completed successfully",
      user: safeUser(user),
      requiresAdminApproval: user.role === "admin" && !user.isAdminApproved,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify OTP", error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email with OTP first" });
    }

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role === "admin" && !user.isAdminApproved) {
      return res.status(403).json({ message: "Admin account is pending approval by an existing admin" });
    }

    if (user.status === "suspended" || user.status === "flagged") {
      return res.status(403).json({ message: "Account access is restricted. Please contact support." });
    }

    if (!user.welcomeEmailSent) {
      try {
        await sendWelcomeEmail(user.email, user.name);
        user.welcomeEmailSent = true;
        await user.save();
      } catch (mailError) {
        console.warn("Failed to send welcome email:", mailError.message);
      }
    }

    const token = signToken({ userId: user._id, role: user.role });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
}

export async function requestForgotPasswordOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No registered account found for this email" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.passwordResetOtpHash = await bcrypt.hash(otp, 10);
    user.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetOtpEmail(user.email, user.name, otp);

    const response = {
      message: "Password reset OTP sent to your email",
    };

    if (process.env.NODE_ENV !== "production") {
      response.devResetOtp = otp;
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send password reset OTP", error: error.message });
  }
}

export async function resetForgotPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No registered account found for this email" });
    }

    if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ message: "No password reset OTP request found" });
    }

    if (new Date() > user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ message: "OTP expired. Please request a new OTP" });
    }

    const isOtpValid = await bcrypt.compare(String(otp), user.passwordResetOtpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(String(newPassword), 10);
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
}

export async function me(req, res) {
  return res.status(200).json({ user: safeUser(req.user) });
}

export async function getPendingAdminRequests(req, res) {
  try {
    const pendingAdmins = await User.find({
      role: "admin",
      isVerified: true,
      isAdminApproved: false,
    })
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests: pendingAdmins });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load admin requests", error: error.message });
  }
}

export async function approveAdminRequest(req, res) {
  try {
    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "Requested admin user not found" });
    }

    if (targetUser.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin applicant" });
    }

    targetUser.isAdminApproved = true;
    await targetUser.save();

    try {
      await sendAdminApprovalEmail(targetUser.email, targetUser.name);
    } catch (mailError) {
      console.warn("Failed to send admin approval email:", mailError.message);
    }

    return res.status(200).json({
      message: "Admin request approved",
      user: safeUser(targetUser),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve admin request", error: error.message });
  }
}
