import AuctionListing from "../models/AuctionListing.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import {
  createRazorpayOrder,
  hasRazorpayCredentials,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../utils/paymentGateway.js";

const PAYMENT_GATEWAY = (process.env.PAYMENT_GATEWAY || "mock").toLowerCase();
const PAYMENT_CURRENCY = (process.env.PAYMENT_CURRENCY || "INR").toUpperCase();
const PAYMENT_PLATFORM_FEE_PERCENT = Number(process.env.PAYMENT_PLATFORM_FEE_PERCENT || 2);

function getActiveGateway() {
  if (["mock", "razorpay", "stripe"].includes(PAYMENT_GATEWAY)) {
    return PAYMENT_GATEWAY;
  }
  return "mock";
}

function getAuctionAmount(auction) {
  const baseAmount = Number(auction.winningBid || auction.currentBid || auction.startingBid || 0);
  return Number.isFinite(baseAmount) ? baseAmount : 0;
}

function getPlatformFeeBreakup(amount) {
  const feePercent = Number.isFinite(PAYMENT_PLATFORM_FEE_PERCENT) && PAYMENT_PLATFORM_FEE_PERCENT >= 0
    ? PAYMENT_PLATFORM_FEE_PERCENT
    : 2;

  const feeAmount = Number(((amount * feePercent) / 100).toFixed(2));
  const sellerReceivable = Number((amount - feeAmount).toFixed(2));

  return {
    feePercent,
    feeAmount,
    sellerReceivable,
  };
}

function toTransactionDto(transaction) {
  return {
    id: String(transaction._id),
    auctionId: String(transaction.auctionId),
    buyerUserId: String(transaction.buyerUserId),
    sellerEmail: transaction.sellerEmail,
    amount: transaction.amount,
    platformFeePercent: transaction.platformFeePercent,
    platformFeeAmount: transaction.platformFeeAmount,
    sellerReceivable: transaction.sellerReceivable,
    currency: transaction.currency,
    gateway: transaction.gateway,
    gatewayOrderId: transaction.gatewayOrderId,
    gatewayPaymentId: transaction.gatewayPaymentId,
    status: transaction.status,
    paidAt: transaction.paidAt,
    releaseRequestedAt: transaction.releaseRequestedAt,
    releasedAt: transaction.releasedAt,
    disputedAt: transaction.disputedAt,
    createdAt: transaction.createdAt,
  };
}

async function createNotification({ recipientEmail, message, metadata = {} }) {
  const user = await User.findOne({ email: recipientEmail.toLowerCase() }).select("_id");

  await Notification.create({
    recipientUser: user?._id || null,
    recipientEmail: recipientEmail.toLowerCase(),
    type: "info",
    message,
    metadata,
  });
}

function isAdmin(user) {
  return user?.role === "admin";
}

function isBuyerForTransaction(user, transaction) {
  return String(transaction.buyerUserId) === String(user?._id);
}

function isSellerForAuction(user, auction) {
  return String(user?.email || "").toLowerCase() === String(auction?.sellerEmail || "").toLowerCase();
}

async function moveTransactionToEscrowHeld({
  transaction,
  auction,
  gatewayOrderId = "",
  gatewayPaymentId = "",
  gatewaySignature = "",
  notifyBuyerEmail = "",
}) {
  if (["escrow_held", "release_requested", "released"].includes(transaction.status)) {
    return false;
  }

  transaction.status = "escrow_held";
  transaction.gatewayOrderId = String(gatewayOrderId || transaction.gatewayOrderId || "");
  transaction.gatewayPaymentId = String(gatewayPaymentId || transaction.gatewayPaymentId || "");
  transaction.gatewaySignature = String(gatewaySignature || transaction.gatewaySignature || "");
  transaction.paidAt = transaction.paidAt || new Date();
  await transaction.save();

  auction.paymentStatus = "escrow_held";
  auction.winnerUserId = transaction.buyerUserId;
  auction.winningBid = transaction.amount;
  auction.paidAt = transaction.paidAt;
  auction.live = false;
  await auction.save();

  await createNotification({
    recipientEmail: auction.sellerEmail,
    message: `Payment for auction "${auction.title}" is now held in escrow.`,
    metadata: {
      auctionId: String(auction._id),
      transactionId: String(transaction._id),
    },
  });

  if (notifyBuyerEmail) {
    await createNotification({
      recipientEmail: notifyBuyerEmail,
      message: `Your payment for "${auction.title}" is secured in escrow.`,
      metadata: {
        auctionId: String(auction._id),
        transactionId: String(transaction._id),
      },
    });
  }

  return true;
}

export async function createEscrowOrder(req, res) {
  try {
    const { auctionId } = req.body;

    if (!auctionId) {
      return res.status(400).json({ message: "auctionId is required" });
    }

    const auction = await AuctionListing.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status !== "approved") {
      return res.status(400).json({ message: "Only approved auctions can be paid" });
    }

    if (isSellerForAuction(req.user, auction)) {
      return res.status(400).json({ message: "Seller cannot pay for own auction" });
    }

    if (["escrow_held", "release_requested", "released"].includes(auction.paymentStatus)) {
      return res.status(400).json({ message: `Payment flow already started (${auction.paymentStatus})` });
    }

    const amount = getAuctionAmount(auction);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid auction amount for payment" });
    }

    const gateway = getActiveGateway();
    let paymentOrder = null;

    if (gateway === "razorpay") {
      if (!hasRazorpayCredentials()) {
        return res.status(500).json({
          message: "Razorpay credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        });
      }

      // Razorpay receipt supports up to 40 characters.
      const receipt = `auc_${String(auction._id).slice(-8)}_${Date.now().toString().slice(-12)}`;

      paymentOrder = await createRazorpayOrder({
        amount,
        currency: PAYMENT_CURRENCY,
        receipt,
        notes: {
          auctionId: String(auction._id),
          buyerUserId: String(req.user._id),
        },
      });
    } else {
      paymentOrder = {
        id: `mock_order_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        amount: Math.round(amount * 100),
        currency: PAYMENT_CURRENCY,
        status: "created",
        keyId: "mock_public_key",
        gateway: "mock",
      };
    }

    const { feePercent, feeAmount, sellerReceivable } = getPlatformFeeBreakup(amount);

    const transaction = await PaymentTransaction.create({
      auctionId: auction._id,
      buyerUserId: req.user._id,
      sellerEmail: auction.sellerEmail,
      sellerName: auction.sellerName,
      amount,
      platformFeePercent: feePercent,
      platformFeeAmount: feeAmount,
      sellerReceivable,
      currency: PAYMENT_CURRENCY,
      gateway,
      gatewayOrderId: paymentOrder.id,
      status: "created",
      metadata: {
        source: "bidvault",
      },
    });

    auction.winnerUserId = req.user._id;
    auction.winningBid = amount;
    auction.paymentStatus = "unpaid";
    auction.escrowTransactionId = transaction._id;
    await auction.save();

    return res.status(201).json({
      message:
        gateway === "mock"
          ? "Escrow order created in mock mode. Use confirm-payment endpoint to complete payment."
          : "Escrow order created successfully.",
      transaction: toTransactionDto(transaction),
      paymentOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create escrow order", error: error.message });
  }
}

export async function confirmEscrowPayment(req, res) {
  try {
    const {
      transactionId,
      gatewayOrderId = "",
      gatewayPaymentId = "",
      gatewaySignature = "",
    } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "transactionId is required" });
    }

    const transaction = await PaymentTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (!isBuyerForTransaction(req.user, transaction) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Only transaction buyer or admin can confirm payment" });
    }

    if (["escrow_held", "release_requested", "released"].includes(transaction.status)) {
      return res.status(200).json({
        message: `Transaction already in ${transaction.status} state`,
        transaction: toTransactionDto(transaction),
      });
    }

    const auction = await AuctionListing.findById(transaction.auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Linked auction not found" });
    }

    if (transaction.gateway === "razorpay") {
      if (!gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
        return res.status(400).json({
          message: "gatewayOrderId, gatewayPaymentId and gatewaySignature are required for Razorpay confirmation",
        });
      }

      if (gatewayOrderId !== transaction.gatewayOrderId) {
        return res.status(400).json({ message: "Razorpay order mismatch" });
      }

      const isSignatureValid = verifyRazorpayPaymentSignature({
        orderId: gatewayOrderId,
        paymentId: gatewayPaymentId,
        signature: gatewaySignature,
      });

      if (!isSignatureValid) {
        return res.status(400).json({ message: "Invalid Razorpay payment signature" });
      }
    }

    await moveTransactionToEscrowHeld({
      transaction,
      auction,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      notifyBuyerEmail: req.user.email,
    });

    return res.status(200).json({
      message: "Payment confirmed and funds moved to escrow",
      transaction: toTransactionDto(transaction),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to confirm escrow payment", error: error.message });
  }
}

export async function handleRazorpayWebhook(req, res) {
  try {
    const signature = String(req.headers["x-razorpay-signature"] || "");
    if (!signature) {
      return res.status(400).json({ message: "Missing Razorpay webhook signature" });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (!webhookSecret) {
      return res.status(500).json({ message: "RAZORPAY_WEBHOOK_SECRET is not configured" });
    }

    const payload = req.rawBody || JSON.stringify(req.body || {});
    const isSignatureValid = verifyRazorpayWebhookSignature({ payload, signature, webhookSecret });

    if (!isSignatureValid) {
      return res.status(400).json({ message: "Invalid Razorpay webhook signature" });
    }

    const eventData = req.body && typeof req.body === "object"
      ? req.body
      : JSON.parse(String(payload || "{}"));

    const eventType = String(eventData?.event || "");
    const paymentEntity = eventData?.payload?.payment?.entity || null;
    const orderEntity = eventData?.payload?.order?.entity || null;
    const gatewayOrderId = String(paymentEntity?.order_id || orderEntity?.id || "");
    const gatewayPaymentId = String(paymentEntity?.id || "");

    if (!gatewayOrderId) {
      return res.status(200).json({ message: "Webhook received without order id" });
    }

    const transaction = await PaymentTransaction.findOne({ gatewayOrderId });
    if (!transaction) {
      return res.status(200).json({ message: "No matching transaction for webhook order" });
    }

    const auction = await AuctionListing.findById(transaction.auctionId);
    if (!auction) {
      return res.status(200).json({ message: "No linked auction for webhook transaction" });
    }

    if (eventType === "payment.failed") {
      if (!["released", "disputed"].includes(transaction.status)) {
        transaction.status = "failed";
        transaction.gatewayPaymentId = gatewayPaymentId || transaction.gatewayPaymentId;
        transaction.metadata = {
          ...(transaction.metadata || {}),
          webhookFailure: {
            eventType,
            at: new Date().toISOString(),
          },
        };
        await transaction.save();
      }

      return res.status(200).json({ message: "Payment failure webhook processed" });
    }

    if (["payment.captured", "order.paid", "payment.authorized"].includes(eventType)) {
      const buyer = await User.findById(transaction.buyerUserId).select("email");

      await moveTransactionToEscrowHeld({
        transaction,
        auction,
        gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature: signature,
        notifyBuyerEmail: buyer?.email || "",
      });

      return res.status(200).json({ message: "Payment capture webhook processed" });
    }

    return res.status(200).json({ message: `Webhook ignored for event ${eventType || "unknown"}` });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process Razorpay webhook", error: error.message });
  }
}

export async function requestEscrowRelease(req, res) {
  try {
    const { transactionId } = req.params;

    const transaction = await PaymentTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const auction = await AuctionListing.findById(transaction.auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Linked auction not found" });
    }

    if (!isSellerForAuction(req.user, auction) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Only auction seller or admin can request release" });
    }

    if (transaction.status !== "escrow_held") {
      return res.status(400).json({ message: `Release request not allowed from ${transaction.status}` });
    }

    transaction.status = "release_requested";
    transaction.releaseRequestedAt = new Date();
    await transaction.save();

    auction.paymentStatus = "release_requested";
    await auction.save();

    const buyer = await User.findById(transaction.buyerUserId).select("email");
    if (buyer?.email) {
      await createNotification({
        recipientEmail: buyer.email,
        message: `Seller requested escrow release for auction "${auction.title}". Confirm delivery to release funds.`,
        metadata: {
          auctionId: String(auction._id),
          transactionId: String(transaction._id),
        },
      });
    }

    return res.status(200).json({
      message: "Escrow release requested successfully",
      transaction: toTransactionDto(transaction),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to request escrow release", error: error.message });
  }
}

export async function releaseEscrowFunds(req, res) {
  try {
    const { transactionId } = req.params;

    const transaction = await PaymentTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (!isBuyerForTransaction(req.user, transaction) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Only buyer or admin can release escrow" });
    }

    if (transaction.status === "released") {
      return res.status(200).json({
        message: "Escrow already released",
        transaction: toTransactionDto(transaction),
      });
    }

    if (!["escrow_held", "release_requested"].includes(transaction.status)) {
      return res.status(400).json({ message: `Escrow cannot be released from ${transaction.status}` });
    }

    const auction = await AuctionListing.findById(transaction.auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Linked auction not found" });
    }

    transaction.status = "released";
    transaction.releasedAt = new Date();
    await transaction.save();

    auction.paymentStatus = "released";
    auction.releasedAt = transaction.releasedAt;
    await auction.save();

    await createNotification({
      recipientEmail: auction.sellerEmail,
      message: `Escrow released for "${auction.title}". Payout can now be processed to seller.`,
      metadata: {
        auctionId: String(auction._id),
        transactionId: String(transaction._id),
      },
    });

    await createNotification({
      recipientEmail: req.user.email,
      message: `You confirmed delivery and escrow was released for "${auction.title}".`,
      metadata: {
        auctionId: String(auction._id),
        transactionId: String(transaction._id),
      },
    });

    return res.status(200).json({
      message: "Escrow released successfully",
      transaction: toTransactionDto(transaction),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to release escrow", error: error.message });
  }
}

export async function raiseEscrowDispute(req, res) {
  try {
    const { transactionId } = req.params;
    const { reason = "Dispute raised by user" } = req.body;

    const transaction = await PaymentTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const auction = await AuctionListing.findById(transaction.auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Linked auction not found" });
    }

    const isBuyer = isBuyerForTransaction(req.user, transaction);
    const isSeller = isSellerForAuction(req.user, auction);

    if (!isBuyer && !isSeller && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Only buyer, seller, or admin can raise a dispute" });
    }

    if (!["escrow_held", "release_requested"].includes(transaction.status)) {
      return res.status(400).json({ message: `Dispute not allowed from ${transaction.status}` });
    }

    transaction.status = "disputed";
    transaction.disputedAt = new Date();
    transaction.metadata = {
      ...(transaction.metadata || {}),
      dispute: {
        reason: String(reason).trim().slice(0, 500) || "Dispute raised",
        raisedBy: req.user.email,
        raisedAt: new Date().toISOString(),
      },
    };
    await transaction.save();

    auction.paymentStatus = "disputed";
    await auction.save();

    await createNotification({
      recipientEmail: auction.sellerEmail,
      message: `A dispute was raised for "${auction.title}". Escrow release is paused.`,
      metadata: {
        auctionId: String(auction._id),
        transactionId: String(transaction._id),
      },
    });

    const buyer = await User.findById(transaction.buyerUserId).select("email");
    if (buyer?.email) {
      await createNotification({
        recipientEmail: buyer.email,
        message: `Dispute recorded for auction "${auction.title}". Admin review is required.`,
        metadata: {
          auctionId: String(auction._id),
          transactionId: String(transaction._id),
        },
      });
    }

    return res.status(200).json({
      message: "Dispute raised. Escrow is now on hold",
      transaction: toTransactionDto(transaction),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to raise dispute", error: error.message });
  }
}

export async function getMyEscrowTransactions(req, res) {
  try {
    const query = isAdmin(req.user)
      ? {}
      : {
          $or: [
            { buyerUserId: req.user._id },
            { sellerEmail: String(req.user.email || "").toLowerCase() },
          ],
        };

    const transactions = await PaymentTransaction.find(query)
      .populate({ path: "auctionId", select: "title" })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      transactions: transactions.map((entry) => ({
        id: String(entry._id),
        auctionId: String(entry.auctionId?._id || entry.auctionId),
        auctionTitle: entry.auctionId?.title || "Auction",
        buyerUserId: String(entry.buyerUserId),
        sellerName: entry.sellerName || "Seller",
        sellerEmail: entry.sellerEmail,
        amount: entry.amount,
        platformFeePercent: entry.platformFeePercent,
        platformFeeAmount: entry.platformFeeAmount,
        sellerReceivable: entry.sellerReceivable,
        currency: entry.currency,
        gateway: entry.gateway,
        status: entry.status,
        createdAt: entry.createdAt,
        paidAt: entry.paidAt,
        releaseRequestedAt: entry.releaseRequestedAt,
        releasedAt: entry.releasedAt,
        disputedAt: entry.disputedAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load escrow transactions", error: error.message });
  }
}
