import { Request, Response } from "express";
import reminderService from "../service/reminder.service.js";
import prisma from "@/config/database.js";

export class ReminderController {
  async getStatus(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const reminder = await prisma.reminder.findFirst({
        where: { taskId: Number(taskId) }
      });

      return res.status(200).json({
        success: true,
        isSent: reminder?.isSent || false,
        data: reminder
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async resetReminder(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      await reminderService.markAsUnsent(Number(taskId));
      
      return res.status(200).json({
        success: true,
        message: "Reminder reset successfully. The system will re-check this task in the next cycle."
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ReminderController();