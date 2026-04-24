// src/modules/reminders/reminder.controller.ts
import { Request, Response } from "express"
import reminderService from "./reminder.service.js"
import prisma from "@/config/database.js"

// Xóa toàn bộ declare global ở đây

export class ReminderController {
  async getStatus(req: Request, res: Response) {
    try {
      const taskId = Number(req.params.taskId)
      const userId = req.user!.id

      const task = await prisma.task.findFirst({
        where: { id: taskId, userId },
      })
      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" })
      }

      const reminder = await prisma.reminder.findFirst({
        where: { taskId },
      })
      return res.status(200).json({
        success: true,
        isSent: reminder?.isSent ?? false,
        remindAt: reminder?.remindAt ?? null,
        taskId,
      })
    } catch {
      return res.status(500).json({ success: false, message: "Failed to get reminder status" })
    }
  }

  async resetReminder(req: Request, res: Response) {
    try {
      const taskId = Number(req.params.taskId)
      const userId = req.user!.id

      const task = await prisma.task.findFirst({
        where: { id: taskId, userId },
      })
      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" })
      }

      await reminderService.markAsUnsent(taskId)
      return res.status(200).json({
        success: true,
        message: "Reminder reset. You will be notified again in the next cycle.",
      })
    } catch {
      return res.status(500).json({ success: false, message: "Failed to reset reminder" })
    }
  }
}

export default new ReminderController()