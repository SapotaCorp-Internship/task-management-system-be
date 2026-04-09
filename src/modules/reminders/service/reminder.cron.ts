import cron from "node-cron";
import reminderService from "./reminder.service.js";
import { getIO } from "@/config/socker.js";

export function startReminderCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const dueTasks = await reminderService.getTasksDueIn24Hours();
      
      if (dueTasks.length === 0) {
        return;
      }

      const io = getIO();

      for (const task of dueTasks) {
        const roomName = `user_${task.userId}`;
        
        io.to(roomName).emit("REMINDER_TOAST", {
          title: "Reminder: Task Due Soon",
          message: `Task "${task.title}" is due soon on ${new Date(task.deadline!).toLocaleString('vi-VN')}.`,
          taskId: task.id
        });

        await reminderService.markAsSent(task.id, task.userId);
      }
    } catch (error) {
      console.error("[Cron Error]:", error);
    }
  });
}