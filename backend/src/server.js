import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { ensurePermanentAdmin } from "./config/permanentAdmin.js";
import { ensureAdminSeedData } from "./config/seedAdminData.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

function parseOriginList(value = "") {
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const configuredOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:5173",
  ...parseOriginList(process.env.CLIENT_URLS),
]);

const hasConfiguredVercelOrigin = [...configuredOrigins].some((origin) => {
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
});

function isAllowedLocalOrigin(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function isAllowedVercelOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowBecauseConfigured = configuredOrigins.has(origin);
      const allowBecauseLocal = isAllowedLocalOrigin(origin);
      const allowBecauseVercel = hasConfiguredVercelOrigin && isAllowedVercelOrigin(origin);

      if (allowBecauseConfigured || allowBecauseLocal || allowBecauseVercel) {
        return callback(null, true);
      }

      // Reject silently so disallowed origins do not trigger server 500s.
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "15mb",
    verify: (req, res, buf) => {
      if (req.originalUrl === "/api/payments/webhook/razorpay") {
        req.rawBody = Buffer.from(buf);
      }
    },
  })
);
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support", supportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const boot = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in environment");
    process.exit(1);
  }

  await connectDB(process.env.MONGODB_URI);
  await ensurePermanentAdmin();
  await ensureAdminSeedData();

  app.listen(PORT, () => {
    console.log(`Auth server running on http://localhost:${PORT}`);
  });
};

boot();
