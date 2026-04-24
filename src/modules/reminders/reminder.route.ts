import { Router } from "express";
import reminderController from "./reminder.controller.js";
import { authenticateToken } from "@/middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken)

router.get("/status/:taskId", reminderController.getStatus);

router.delete("/:taskId", reminderController.resetReminder);

export default router;