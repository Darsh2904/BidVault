import mongoose from "mongoose";

const auctionListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    sellerName: {
      type: String,
      required: true,
      trim: true,
    },
    sellerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    startingBid: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBid: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    reservePrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    duration: {
      type: String,
      default: "7 Days",
      trim: true,
    },
    condition: {
      type: String,
      default: "Excellent",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    emoji: {
      type: String,
      default: "📦",
    },
    timer: {
      type: String,
      default: "2d",
    },
    urgent: {
      type: Boolean,
      default: false,
    },
    live: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    winnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    winningBid: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "escrow_held", "release_requested", "released", "refunded", "disputed"],
      default: "unpaid",
      index: true,
    },
    escrowTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
    approvalNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const AuctionListing = mongoose.model("AuctionListing", auctionListingSchema);

export default AuctionListing;
