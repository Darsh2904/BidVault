import { Router } from "express";
import {
  approveAdminRequest,
  getPendingAdminRequests,
  login,
  me,
  requestForgotPasswordOtp,
  requestSignupOtp,
  resetForgotPassword,
  verifySignupOtp,
} from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/signup/request-otp", requestSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/forgot-password/request-otp", requestForgotPasswordOtp);
router.post("/forgot-password/reset", resetForgotPassword);
router.post("/login", login);
router.get("/me", requireAuth, me);

router.get("/admin-requests", requireAuth, requireRole("admin"), getPendingAdminRequests);
router.post("/admin-requests/:userId/approve", requireAuth, requireRole("admin"), approveAdminRequest);

export default router;
