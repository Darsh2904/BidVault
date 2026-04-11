import { Router } from "express";
import {
  approveAuctionListing,
  deleteAndBlockUser,
  getAdminUsers,
  getPendingAuctionListings,
  rejectAuctionListing,
  updateAdminUserStatus,
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", getAdminUsers);
router.patch("/users/:userId/status", updateAdminUserStatus);
router.delete("/users/:userId", deleteAndBlockUser);

router.get("/auctions/pending", getPendingAuctionListings);
router.post("/auctions/:auctionId/approve", approveAuctionListing);
router.post("/auctions/:auctionId/reject", rejectAuctionListing);

export default router;
