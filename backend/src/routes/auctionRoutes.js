import { Router } from "express";
import { createAuctionListing, getApprovedAuctions, getMyAuctionListings, getMyBidAuctions } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/approved", getApprovedAuctions);
router.get("/my-bids", requireAuth, requireRole("buyer_seller", "admin"), getMyBidAuctions);
router.get("/mine", requireAuth, requireRole("buyer_seller", "admin"), getMyAuctionListings);
router.post("/", requireAuth, requireRole("buyer_seller", "admin"), createAuctionListing);

export default router;
