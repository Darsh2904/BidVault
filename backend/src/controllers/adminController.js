import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AuctionListing from "../models/AuctionListing.js";
import Notification from "../models/Notification.js";
import BlockedEmail from "../models/BlockedEmail.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import { PERMANENT_ADMIN } from "../config/permanentAdmin.js";

function formatJoinedDate(dateInput) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateInput));
}

function userDto(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "buyer/seller",
    status: user.status || "active",
    isAdminApproved: Boolean(user.isAdminApproved),
    joined: formatJoinedDate(user.createdAt),
  };
}

function auctionDto(auction) {
  return {
    id: String(auction._id),
    item: auction.title,
    seller: auction.sellerName,
    sellerEmail: auction.sellerEmail,
    bid: `₹${Number(auction.startingBid).toLocaleString()}`,
    cat: auction.category,
    category: auction.category,
    status: auction.status,
  };
}

function durationToTimer(duration) {
  const map = {
    "24 Hours": "24h",
    "3 Days": "3d",
    "5 Days": "5d",
    "7 Days": "7d",
  };

  return map[duration] || "7d";
}

function sanitizeImages(rawImages) {
  if (!Array.isArray(rawImages)) return [];

  return rawImages
    .filter((image) => typeof image === "string" && image.startsWith("data:image/"))
    .slice(0, 5);
}

export async function getAdminUsers(req, res) {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ users: users.map(userDto) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load users", error: error.message });
  }
}

async function deleteUserAndRelatedData({ target, blockedBy, reason, shouldBlockEmail = true }) {
  const normalizedEmail = String(target.email || "").toLowerCase();

  if (shouldBlockEmail) {
    await BlockedEmail.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        reason: reason || "Blocked due to suspicious activity",
        blockedBy: blockedBy || "admin",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  await Notification.deleteMany({
    $or: [{ recipientUser: target._id }, { recipientEmail: normalizedEmail }],
  });

  await AuctionListing.deleteMany({ sellerEmail: normalizedEmail });

  await PaymentTransaction.deleteMany({
    $or: [{ buyerUserId: target._id }, { sellerEmail: normalizedEmail }],
  });

  await User.findByIdAndDelete(target._id);

  return normalizedEmail;
}

export async function updateAdminUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "flagged"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const target = await User.findById(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target.email.toLowerCase() === PERMANENT_ADMIN.email.toLowerCase()) {
      return res.status(400).json({ message: "Permanent admin status cannot be changed" });
    }

    if (String(target._id) === String(req.user?._id) && status === "suspended") {
      return res.status(400).json({ message: "You cannot suspend your own admin account" });
    }

    if (status === "suspended") {
      if (target.role !== "admin") {
        const blockedEmail = await deleteUserAndRelatedData({
          target,
          blockedBy: req.user?.email,
          reason: "Blocked due to suspension by admin",
        });

        return res.status(200).json({
          message: "User suspended and deleted permanently",
          deletedUserId: String(userId),
          blockedEmail,
        });
      }
    }

    target.status = status;
    await target.save();

    return res.status(200).json({ message: "User status updated", user: userDto(target) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
}

export async function deleteAndBlockUser(req, res) {
  try {
    const { userId } = req.params;

    const target = await User.findById(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target.email.toLowerCase() === PERMANENT_ADMIN.email.toLowerCase()) {
      return res.status(400).json({ message: "Permanent admin account cannot be deleted" });
    }

    if (String(target._id) === String(req.user?._id)) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const shouldBlockEmail = target.role !== "admin";
    const blockedEmail = await deleteUserAndRelatedData({
      target,
      blockedBy: req.user?.email,
      reason: shouldBlockEmail ? "Blocked due to suspicious activity" : "Pending admin request removed by admin",
      shouldBlockEmail,
    });

    return res.status(200).json({
      message: shouldBlockEmail
        ? "User deleted and email blocked permanently"
        : "Pending admin account deleted successfully",
      blockedEmail,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete and block user", error: error.message });
  }
}

export async function getPendingAuctionListings(req, res) {
  try {
    const auctions = await AuctionListing.find({ status: "pending" }).sort({ createdAt: -1 });
    return res.status(200).json({ pending: auctions.map(auctionDto) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load pending auctions", error: error.message });
  }
}

async function notifySeller(auction, type, message) {
  const sellerUser = await User.findOne({ email: auction.sellerEmail.toLowerCase() });

  await Notification.create({
    recipientUser: sellerUser?._id || null,
    recipientEmail: auction.sellerEmail.toLowerCase(),
    type,
    message,
    metadata: {
      auctionId: String(auction._id),
      auctionTitle: auction.title,
      category: auction.category,
    },
  });
}

export async function approveAuctionListing(req, res) {
  try {
    const { auctionId } = req.params;

    const auction = await AuctionListing.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction listing not found" });
    }

    auction.status = "approved";
    auction.live = true;
    auction.currentBid = auction.currentBid || auction.startingBid;
    await auction.save();

    await notifySeller(
      auction,
      "auction_approved",
      `Your listing \"${auction.title}\" has been approved and is now live on BidVault.`
    );

    return res.status(200).json({ message: "Auction approved", auction: auctionDto(auction) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve auction", error: error.message });
  }
}

export async function rejectAuctionListing(req, res) {
  try {
    const { auctionId } = req.params;

    const auction = await AuctionListing.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction listing not found" });
    }

    auction.status = "rejected";
    auction.live = false;
    await auction.save();

    await notifySeller(
      auction,
      "auction_rejected",
      `Your listing \"${auction.title}\" was rejected by BidVault admin review.`
    );

    return res.status(200).json({ message: "Auction rejected", auction: auctionDto(auction) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject auction", error: error.message });
  }
}

export async function getApprovedAuctions(req, res) {
  try {
    const auctions = await AuctionListing.find({
      status: "approved",
      live: true,
      paymentStatus: { $nin: ["escrow_held", "release_requested", "released"] },
    }).sort({ updatedAt: -1 });

    const data = auctions.map((auction) => ({
      id: String(auction._id),
      emoji: auction.emoji || "📦",
      title: auction.title,
      seller: auction.sellerName,
      bid: `₹${Number(auction.currentBid || auction.startingBid).toLocaleString()}`,
      timer: auction.timer || "2d",
      urgent: Boolean(auction.urgent),
      live: Boolean(auction.live),
      cat: auction.category,
    }));

    return res.status(200).json({ auctions: data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load approved auctions", error: error.message });
  }
}

export async function getMyAuctionListings(req, res) {
  try {
    const sellerEmail = String(req.user?.email || "").toLowerCase();
    if (!sellerEmail) {
      return res.status(400).json({ message: "Seller email is required" });
    }

    const listings = await AuctionListing.find({ sellerEmail })
      .sort({ createdAt: -1 })
      .lean();

    const data = listings.map((auction) => ({
      id: String(auction._id),
      item: auction.title,
      bid: `₹${Number(auction.currentBid || auction.startingBid).toLocaleString()}`,
      cat: auction.category,
      status: auction.status,
      live: Boolean(auction.live),
      timer: auction.timer || "2d",
      urgent: Boolean(auction.urgent),
      createdAt: auction.createdAt,
      updatedAt: auction.updatedAt,
    }));

    return res.status(200).json({ listings: data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load seller listings", error: error.message });
  }
}

export async function createAuctionListing(req, res) {
  try {
    const {
      title,
      description,
      category,
      startingBid,
      reservePrice,
      duration,
      condition,
      images,
    } = req.body;

    if (!title || !description || !category || !startingBid || !reservePrice || !duration || !condition) {
      return res.status(400).json({ message: "All auction details are required" });
    }

    const parsedStartingBid = Number(startingBid);
    const parsedReservePrice = Number(reservePrice);

    if (!Number.isFinite(parsedStartingBid) || parsedStartingBid <= 0) {
      return res.status(400).json({ message: "Starting bid must be a valid number greater than 0" });
    }

    if (!Number.isFinite(parsedReservePrice) || parsedReservePrice < 0) {
      return res.status(400).json({ message: "Reserve price must be 0 or a positive number" });
    }

    if (parsedReservePrice < parsedStartingBid) {
      return res.status(400).json({ message: "Reserve price must be greater than or equal to starting bid" });
    }

    const safeImages = sanitizeImages(images);

    if (!safeImages.length) {
      return res.status(400).json({ message: "At least one auction image is required" });
    }

    if (Array.isArray(images) && images.length > 0 && safeImages.length === 0) {
      return res.status(400).json({ message: "Only valid image files are allowed" });
    }

    const listing = await AuctionListing.create({
      title: String(title).trim(),
      description: String(description || "").trim(),
      sellerName: req.user?.name || "Seller",
      sellerEmail: req.user?.email || "",
      startingBid: parsedStartingBid,
      currentBid: parsedStartingBid,
      reservePrice: parsedReservePrice,
      category: String(category).trim(),
      duration: String(duration || "7 Days"),
      condition: String(condition || "Excellent"),
      images: safeImages,
      timer: durationToTimer(String(duration)),
      urgent: String(duration) === "24 Hours",
      live: true,
      status: "approved",
    });

    return res.status(201).json({
      message: "Auction published successfully",
      auction: {
        id: String(listing._id),
        title: listing.title,
        status: listing.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create auction listing", error: error.message });
  }
}
