import mongoose from "mongoose";

const blockedEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    reason: {
      type: String,
      default: "Blocked by admin",
    },
    blockedBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const BlockedEmail = mongoose.model("BlockedEmail", blockedEmailSchema);

export default BlockedEmail;
