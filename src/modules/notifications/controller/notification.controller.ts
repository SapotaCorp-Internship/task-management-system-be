import { Request, Response } from "express";
import notificationService from "../service/notification.service.js";
import { success, error } from "@/utils/response.js";

interface AuthRequest extends Request {
  user?: any;
}

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const notifications = await notificationService.getNotifications(userId);
      success(res, notifications);
    } catch (err) {
      error(res, "Failed to fetch notifications");
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      if (Number.isNaN(notificationId)) {
        return error(res, "Invalid notification ID", 400);
      }

      const successResult = await notificationService.markAsRead(
        notificationId,
        userId,
      );
      if (!successResult) {
        return error(res, "Notification not found", 404);
      }
      success(res, { message: "Notification marked as read" });
    } catch (err) {
      error(res, "Failed to update notification");
    }
  }
}

export default new NotificationController();
