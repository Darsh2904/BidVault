import { Router } from "express";
import { createSupportRequest } from "../controllers/supportController.js";

const router = Router();

router.post("/requests", createSupportRequest);

export default router;
