import bcrypt from "bcryptjs";
import AuctionListing from "../models/AuctionListing.js";
import User from "../models/User.js";
import BlockedEmail from "../models/BlockedEmail.js";

export async function ensureAdminSeedData() {
  const pendingCount = await AuctionListing.countDocuments({ status: "pending" });

  if (pendingCount === 0) {
    await AuctionListing.insertMany([
      {
        title: "Rare Ming Dynasty Vase",
        sellerName: "AntiqueMasters",
        sellerEmail: "antiquemasters@shop.com",
        startingBid: 12000,
        currentBid: 12000,
        category: "Antiques",
        emoji: "🏺",
        timer: "2d 8h",
        urgent: false,
        live: false,
        status: "pending",
      },
      {
        title: "2023 Lamborghini Urus",
        sellerName: "LuxCarDeals",
        sellerEmail: "luxcardeals@shop.com",
        startingBid: 180000,
        currentBid: 180000,
        category: "Vehicles",
        emoji: "🚗",
        timer: "1d 6h",
        urgent: true,
        live: false,
        status: "pending",
      },
    ]);
  }

  const suspiciousEmail = "s99@anon.net";
  const isBlocked = await BlockedEmail.findOne({ email: suspiciousEmail });
  const suspiciousUser = await User.findOne({ email: suspiciousEmail });
  if (!suspiciousUser && !isBlocked) {
    const pass = await bcrypt.hash("Suspicious@123", 10);
    await User.create({
      name: "SuspiciousUser99",
      email: suspiciousEmail,
      password: pass,
      role: "buyer_seller",
      isVerified: true,
      status: "flagged",
    });
  }
}
