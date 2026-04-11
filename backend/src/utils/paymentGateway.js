import crypto from "crypto";
import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export function hasRazorpayCredentials() {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}

function getRazorpayClient() {
  if (!hasRazorpayCredentials()) {
    throw new Error("Razorpay credentials are missing in environment");
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

export async function createRazorpayOrder({ amount, currency, receipt, notes = {} }) {
  const razorpay = getRazorpayClient();

  const amountInSubunits = Math.round(Number(amount) * 100);
  if (!Number.isFinite(amountInSubunits) || amountInSubunits <= 0) {
    throw new Error("Invalid amount for Razorpay order");
  }

  const order = await razorpay.orders.create({
    amount: amountInSubunits,
    currency,
    receipt,
    notes,
  });

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    keyId: RAZORPAY_KEY_ID,
    gateway: "razorpay",
  };
}

export function verifyRazorpayPaymentSignature({ orderId, paymentId, signature }) {
  if (!hasRazorpayCredentials()) {
    throw new Error("Razorpay credentials are missing in environment");
  }

  const payload = `${orderId}|${paymentId}`;
  const generated = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  return generated === signature;
}

export function verifyRazorpayWebhookSignature({ payload, signature, webhookSecret }) {
  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret is missing in environment");
  }

  const safePayload = Buffer.isBuffer(payload)
    ? payload
    : Buffer.from(String(payload || ""), "utf8");

  const generated = crypto
    .createHmac("sha256", webhookSecret)
    .update(safePayload)
    .digest("hex");

  const generatedBuffer = Buffer.from(generated, "utf8");
  const signatureBuffer = Buffer.from(String(signature || ""), "utf8");

  if (generatedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
}
