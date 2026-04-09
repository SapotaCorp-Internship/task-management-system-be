import prisma from "@/config/database.js";

export class ReminderService {
  async getTasksDueIn24Hours() {
    const now = new Date();

    const twentyFourHoursLater = new Date(now.getTime() + 31 * 60 * 60 * 1000);

    return prisma.task.findMany({
      where: {
        status: { not: "DONE" },
        deletedAt: null,
        deadline: {
          gte: now, 
          lte: twentyFourHoursLater, 
        },
        reminders: {
          none: { isSent: true },
        },
      },
      include: { user: true },
    });
  }

  async markAsSent(taskId: number, userId: number) {
    try {
      const existing = await prisma.reminder.findFirst({ where: { taskId } });

      if (existing) {
        return await prisma.reminder.update({
          where: { id: existing.id },
          data: { isSent: true, remindAt: new Date() },
        });
      }

      return await prisma.reminder.create({
        data: { taskId, userId, isSent: true, remindAt: new Date() },
      });
    } catch (error) {
      console.error("[Service Error] Error at markAsSent:", error);
      throw error;
    }
  }

  async markAsUnsent(taskId: number) {
    return prisma.reminder.deleteMany({ where: { taskId } });
  }
}

export default new ReminderService();
