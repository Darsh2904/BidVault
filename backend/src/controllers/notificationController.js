import Notification from "../models/Notification.js";

export async function getMyNotifications(req, res) {
  try {
    const email = req.user.email.toLowerCase();

    const notifications = await Notification.find({
      $or: [{ recipientUser: req.user._id }, { recipientEmail: email }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      notifications: notifications.map((entry) => ({
        id: String(entry._id),
        type: entry.type,
        message: entry.message,
        isRead: entry.isRead,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load notifications", error: error.message });
  }
}
