import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionListing",
      required: true,
      index: true,
    },
    buyerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    sellerName: {
      type: String,
      default: "",
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFeePercent: {
      type: Number,
      min: 0,
      default: 2,
    },
    platformFeeAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    sellerReceivable: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    gateway: {
      type: String,
      enum: ["mock", "razorpay", "stripe"],
      default: "mock",
    },
    gatewayOrderId: {
      type: String,
      default: "",
      trim: true,
    },
    gatewayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },
    gatewaySignature: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "created",
        "escrow_held",
        "release_requested",
        "released",
        "refunded",
        "disputed",
        "failed",
      ],
      default: "created",
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    releaseRequestedAt: {
      type: Date,
      default: null,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    disputedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

paymentTransactionSchema.index({ sellerEmail: 1, createdAt: -1 });

const PaymentTransaction = mongoose.model("PaymentTransaction", paymentTransactionSchema);

export default PaymentTransaction;
