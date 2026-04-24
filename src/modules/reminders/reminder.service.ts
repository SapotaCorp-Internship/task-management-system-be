import prisma from "@/config/database.js";

const REMINDER_WINDOW_MS = 31 * 60 * 60 * 1000;

export class ReminderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReminderError";
  }
}

export class ReminderService {
  async getTasksDueIn24Hours() {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + REMINDER_WINDOW_MS);

    return prisma.task.findMany({
      where: {
        status: { not: "DONE" },
        deletedAt: null,
        deadline: {
          gte: now,
          lte: in24Hours,
        },
        reminders: {
          none: { isSent: true },
        },
      },
      include: { user: true },
    });
  }

  async markAsSent(taskId: number, userId: number) {
    const existing = await prisma.reminder.findFirst({ where: { taskId } });

    if (existing) {
      return prisma.reminder.update({
        where: { id: existing.id },
        data: { isSent: true, remindAt: new Date() },
      });
    }

    return prisma.reminder.create({
      data: { taskId, userId, isSent: true, remindAt: new Date() },
    });
  }
  async markAsUnsent(taskId: number) {
    return prisma.reminder.deleteMany({ where: { taskId } });
  }

  async scheduleReminder(taskId: number, deadline: Date | null) {
    if (!deadline || deadline <= new Date()) {
      await this.markAsUnsent(taskId);
      return;
    }

    await this.markAsUnsent(taskId);
  }

  async clearRemindersForTask(taskId: number) {
    return prisma.reminder.deleteMany({ where: { taskId } });
  }
}

export default new ReminderService();
