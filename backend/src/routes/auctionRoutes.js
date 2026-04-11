import { Router } from "express";
import { createAuctionListing, getApprovedAuctions, getMyAuctionListings } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/approved", getApprovedAuctions);
router.get("/mine", requireAuth, requireRole("buyer_seller", "admin"), getMyAuctionListings);
router.post("/", requireAuth, requireRole("buyer_seller", "admin"), createAuctionListing);

export default router;
