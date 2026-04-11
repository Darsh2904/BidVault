import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password -otpHash");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status === "suspended" || user.status === "flagged") {
      return res.status(403).json({ message: "Account access is restricted" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user.role === "admin" && !req.user.isAdminApproved) {
      return res.status(403).json({ message: "Admin access pending approval" });
    }

    next();
  };
}
