import prisma from "@/config/database.js";
import { CreateNotificationDto } from "../notification.dto.js";

export class NotificationService {
  async getNotifications(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            deadline: true,
          },
        },
      },
    });
  }

  async createNotification(data: CreateNotificationDto) {
    return prisma.notification.create({ data });
  }

  async markAsRead(notificationId: number, userId: number) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    return result.count > 0;
  }
}

export default new NotificationService();
