import { Router } from "express";
import reminderController from "../controller/reminder.controller.js";

const router = Router();

router.get("/status/:taskId", reminderController.getStatus);

router.delete("/:taskId", reminderController.resetReminder);

export default router;