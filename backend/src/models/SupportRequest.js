import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      enum: ["account", "payment", "auction", "dispute", "other"],
      default: "account",
      index: true,
    },
    orderId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

supportRequestSchema.index({ createdAt: -1, status: 1 });

const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);

export default SupportRequest;
