import { Router } from "express";
import { getMyNotifications } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, getMyNotifications);

export default router;
