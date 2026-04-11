import { Router } from "express";
import {
  confirmEscrowPayment,
  createEscrowOrder,
  getMyEscrowTransactions,
  handleRazorpayWebhook,
  raiseEscrowDispute,
  releaseEscrowFunds,
  requestEscrowRelease,
} from "../controllers/paymentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/webhook/razorpay", handleRazorpayWebhook);

router.use(requireAuth);

router.get("/me", getMyEscrowTransactions);
router.post("/create-escrow-order", requireRole("buyer_seller", "admin"), createEscrowOrder);
router.post("/confirm-payment", requireRole("buyer_seller", "admin"), confirmEscrowPayment);
router.post("/:transactionId/request-release", requireRole("buyer_seller", "admin"), requestEscrowRelease);
router.post("/:transactionId/release", requireRole("buyer_seller", "admin"), releaseEscrowFunds);
router.post("/:transactionId/dispute", requireRole("buyer_seller", "admin"), raiseEscrowDispute);

export default router;
