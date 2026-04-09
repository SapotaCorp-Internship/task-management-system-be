import prisma from "@/config/database.js";
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from "../dto/task.dto.js";
import reminderService from "@/modules/reminders/service/reminder.service.js";

export class TaskService {
  async getTasks(userId: number, query: TaskQueryDto) {
    const {
      status,
      priority,
      categoryId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = query;

    const where: any = { userId, deletedAt: null };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === "priority") {
      orderBy.priority = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.task.count({ where });

    return { tasks, total, page, limit };
  }

  async getTaskById(id: number, userId: number) {
    return prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });
  }

  async createTask(userId: number, data: CreateTaskDto) {
    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    await this.logTaskHistory(
      task.id,
      userId,
      "CREATED",
      null,
      JSON.stringify(task),
    );

    try {
      await reminderService.scheduleReminder(task.id, userId, task.deadline);
    } catch (reError) {
      console.error(
        "⚠️ [Reminder Error]: Can not schedule reminder for new task. Task created successfully but reminder failed:",
        reError.message,
      );
    }

    return task;
  }

  async updateTask(id: number, userId: number, data: UpdateTaskDto) {
    const existingTask = await this.getTaskById(id, userId);
    if (!existingTask) throw new Error("Task not found");

    const updateData: any = { ...data };
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }

    if (data.status === "DONE" && existingTask.status !== "DONE") {
      updateData.completedAt = new Date();
    } else if (data.status !== "DONE" && data.status !== undefined) {
      updateData.completedAt = null;
    }


    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    try {
      if (task.status === "DONE" || !task.deadline) {
        await reminderService.clearRemindersForTask(task.id);
      } else {
        await reminderService.scheduleReminder(task.id, userId, task.deadline);
      }
      console.log(`✅ [Reminder] Updated reminder for Task ${id}`);
    } catch (reError: any) {
      console.error(
        `⚠️ [Reminder Error] Task ${id} saved but failed to update reminder:`,
        reError.message,
      );
    }

    try {
      for (const [key, value] of Object.entries(data)) {
        const oldValue = existingTask[key as keyof typeof existingTask];
        if (oldValue !== value) {
          await this.logTaskHistory(
            id,
            userId,
            `UPDATED_${key.toUpperCase()}`,
            oldValue?.toString() ?? null,
            value?.toString() ?? null,
          );
        }
      }
    } catch (logError: any) {
      console.error(
        `⚠️ [Log Error] Không thể ghi lịch sử cho Task ${id}:`,
        logError.message,
      );
    }

    return task; 
  }

  async deleteTask(id: number, userId: number) {
    try {
      const task = await this.getTaskById(id, userId);
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      await prisma.task.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      try {
        await reminderService.clearRemindersForTask(id);
        await this.logTaskHistory(id, userId, "DELETED", null, null);
      } catch (sideError) {
        console.warn("⚠️ [Side Task Error]:", sideError.message);
      }

      return { success: true };
    } catch (error) {
      console.error(`❌ [deleteTask Error] ID: ${id}:`, error.message);
      throw error;
    }
  }

  async getTaskHistory(taskId: number, userId: number) {
    const task = await this.getTaskById(taskId, userId);
    if (!task) throw new Error("Task not found");

    return prisma.taskHistory.findMany({
      where: { taskId },
      orderBy: { changedAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  private async logTaskHistory(
    taskId: number,
    userId: number,
    action: string,
    oldValue?: string | null,
    newValue?: string | null,
  ) {
    await prisma.taskHistory.create({
      data: {
        taskId,
        userId,
        action,
        oldValue: oldValue ?? null,
        newValue: newValue ?? null,
      },
    });
  }
}

export default new TaskService();
