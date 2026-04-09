import { Router } from "express";
import notificationController from "../controller/notification.controller.js";
import { authenticateToken } from "@/middleware/auth.middleware.js";

const router = Router();
router.use(authenticateToken);

router.get("/", notificationController.getNotifications);
router.put("/:id/read", notificationController.markAsRead);

export default router;
