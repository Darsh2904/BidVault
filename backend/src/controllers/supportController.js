import SupportRequest from "../models/SupportRequest.js";

const ALLOWED_TOPICS = new Set(["account", "payment", "auction", "dispute", "other"]);
const ALLOWED_STATUSES = new Set(["open", "in_progress", "resolved", "closed"]);
const ALLOWED_SORT_FIELDS = new Set(["createdAt", "updatedAt", "status", "topic", "fullName", "email"]);
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

function normalizeText(value = "") {
  return String(value).trim();
}

function normalizeTopic(value = "") {
  const normalized = String(value).trim().toLowerCase();
  return ALLOWED_TOPICS.has(normalized) ? normalized : "other";
}

function isValidEmail(value = "") {
  return /^\S+@\S+\.\S+$/.test(String(value));
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function supportTicketDto(ticket) {
  return {
    id: String(ticket._id),
    fullName: ticket.fullName,
    email: ticket.email,
    topic: ticket.topic,
    orderId: ticket.orderId,
    message: ticket.message,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export async function createSupportRequest(req, res) {
  try {
    const fullName = normalizeText(req.body?.fullName);
    const email = normalizeText(req.body?.email).toLowerCase();
    const topic = normalizeTopic(req.body?.topic);
    const orderId = normalizeText(req.body?.orderId);
    const message = normalizeText(req.body?.message);

    if (!fullName || !email || !message) {
      return res.status(400).json({ message: "Full name, email, and message are required" });
    }

    if (fullName.length < 2 || fullName.length > 80) {
      return res.status(400).json({ message: "Full name must be between 2 and 80 characters" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({ message: "Message must be between 10 and 2000 characters" });
    }

    const ticket = await SupportRequest.create({
      fullName,
      email,
      topic,
      orderId,
      message,
      metadata: {
        source: "help_center",
        ip: req.ip,
        userAgent: req.get("user-agent") || "",
      },
    });

    return res.status(201).json({
      message: "Support request submitted successfully",
      ticket: {
        id: String(ticket._id),
        status: ticket.status,
        topic: ticket.topic,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit support request", error: error.message });
  }
}

export async function getAdminSupportRequests(req, res) {
  try {
    const statusFilter = normalizeText(req.query?.status).toLowerCase();
    const searchQuery = normalizeText(req.query?.q);
    const requestedPage = toPositiveInteger(req.query?.page, 1);
    const requestedLimit = toPositiveInteger(req.query?.limit, DEFAULT_PAGE_SIZE);
    const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
    const sortByRaw = normalizeText(req.query?.sortBy);
    const sortBy = ALLOWED_SORT_FIELDS.has(sortByRaw) ? sortByRaw : "createdAt";
    const sortOrderRaw = normalizeText(req.query?.sortOrder).toLowerCase();
    const sortOrder = sortOrderRaw === "asc" ? 1 : -1;
    const baseQuery = {};
    const ticketsQuery = {};

    if (statusFilter && statusFilter !== "all") {
      if (!ALLOWED_STATUSES.has(statusFilter)) {
        return res.status(400).json({ message: "Invalid support ticket status filter" });
      }
      ticketsQuery.status = statusFilter;
    }

    if (searchQuery) {
      const safeRegex = new RegExp(escapeRegex(searchQuery), "i");
      baseQuery.$or = [
        { fullName: safeRegex },
        { email: safeRegex },
        { orderId: safeRegex },
        { message: safeRegex },
      ];
    }

    Object.assign(ticketsQuery, baseQuery);

    const total = await SupportRequest.countDocuments(ticketsQuery);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);
    const skip = (page - 1) * limit;

    const [tickets, groupedCounts] = await Promise.all([
      SupportRequest.find(ticketsQuery)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip(skip)
        .limit(limit),
      SupportRequest.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const summary = { total, open: 0, inProgress: 0, resolved: 0, closed: 0 };

    groupedCounts.forEach((entry) => {
      if (entry._id === "open") summary.open = entry.count;
      if (entry._id === "in_progress") summary.inProgress = entry.count;
      if (entry._id === "resolved") summary.resolved = entry.count;
      if (entry._id === "closed") summary.closed = entry.count;
    });

    return res.status(200).json({
      tickets: tickets.map(supportTicketDto),
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        sortBy,
        sortOrder: sortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load support requests", error: error.message });
  }
}

export async function updateAdminSupportRequestStatus(req, res) {
  try {
    const { ticketId } = req.params;
    const nextStatus = normalizeText(req.body?.status).toLowerCase();

    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return res.status(400).json({ message: "Invalid support ticket status" });
    }

    const ticket = await SupportRequest.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    ticket.status = nextStatus;
    await ticket.save();

    return res.status(200).json({
      message: "Support ticket status updated",
      ticket: supportTicketDto(ticket),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update support ticket status", error: error.message });
  }
}
