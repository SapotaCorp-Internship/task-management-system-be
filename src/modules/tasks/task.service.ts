import prisma from "@/config/database.js"
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, TaskSortBy } from "./task.dto.js"
import reminderService from "@/modules/reminders/reminder.service.js"
import { Prisma } from "@prisma/client"

export class TaskError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "UNAUTHORIZED"
  ) {
    super(message)
    this.name = "TaskError"
  }
}

const TRACKED_FIELDS: (keyof UpdateTaskDto)[] = [
  "title", "description", "status", "priority", "deadline", "categoryId"
]

export class TaskService {

  private async logTaskHistory(
    taskId: number,
    userId: number,
    action: string,
    oldValue?: string | null,
    newValue?: string | null
  ) {
    await prisma.taskHistory.create({
      data: {
        taskId,
        userId,
        action,
        oldValue: oldValue ?? null,
        newValue: newValue ?? null,
      },
    })
  }

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
    } = query

    const where: Prisma.TaskWhereInput = {
      userId,
      deletedAt: null,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = this.buildOrderBy(sortBy, sortOrder)

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    return { tasks, total, page, limit }
  }

  private buildOrderBy(
    sortBy: TaskSortBy,
    sortOrder: "asc" | "desc"
  ): Prisma.TaskOrderByWithRelationInput {
    switch (sortBy) {
      case "priority":
        return { priority: sortOrder }
      case "deadline":
        return { deadline: sortOrder }
      default:
        return { createdAt: sortOrder }
    }
  }

  async getTaskById(id: number, userId: number) {
    return prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    })
  }

  async createTask(userId: number, data: CreateTaskDto) {
    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: { category: { select: { id: true, name: true } } },
    })

    await this.logTaskHistory(task.id, userId, "CREATED", null, JSON.stringify(task))
      .catch(err => console.error(`[Log Error] Create task ${task.id}:`, err))

    await reminderService.scheduleReminder(task.id, task.deadline)
      .catch(err => console.error(`[Reminder Error] Task ${task.id}:`, err))

    return task
  }

  async updateTask(id: number, userId: number, data: UpdateTaskDto) {
    const existingTask = await this.getTaskById(id, userId)
    if (!existingTask) throw new TaskError("Task not found", "NOT_FOUND")

    const updateData: Prisma.TaskUpdateInput = { ...data }

    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null
    }

    if (data.status === "DONE" && existingTask.status !== "DONE") {
      updateData.completedAt = new Date()
    } else if (data.status && data.status !== "DONE") {
      updateData.completedAt = null      
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { category: { select: { id: true, name: true, color: true } } },
    })

    await (task.status === "DONE" || !task.deadline
      ? reminderService.clearRemindersForTask(task.id)
      : reminderService.scheduleReminder(task.id, task.deadline)
    ).catch(err => console.error(`[Reminder Error] Update task ${id}:`, err))

    await this.logChangedFields(id, userId, existingTask, data)
      .catch(err => console.error(`[Log Error] Update task ${id}:`, err))

    return task
  }

  private async logChangedFields(
    taskId: number,
    userId: number,
    existingTask: Awaited<ReturnType<typeof this.getTaskById>>,
    data: UpdateTaskDto
  ) {
    if (!existingTask) return

    const changes = TRACKED_FIELDS.filter(key => {
      return key in data && existingTask[key as keyof typeof existingTask] !== data[key]
    })

    await Promise.all(
      changes.map(key =>
        this.logTaskHistory(
          taskId,
          userId,
          `UPDATED_${key.toUpperCase()}`,
          existingTask[key as keyof typeof existingTask]?.toString() ?? null,
          data[key]?.toString() ?? null
        )
      )
    )
  }

  async deleteTask(id: number, userId: number) {
    const task = await this.getTaskById(id, userId)
    if (!task) throw new TaskError("Task not found", "NOT_FOUND")

    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await Promise.allSettled([
      reminderService.clearRemindersForTask(id),
      this.logTaskHistory(id, userId, "DELETED"),
    ])

    return { success: true }
  }

  async getTaskHistory(taskId: number, userId: number) {
    const task = await this.getTaskById(taskId, userId)
    if (!task) throw new TaskError("Task not found", "NOT_FOUND")

    return prisma.taskHistory.findMany({
      where: { taskId },
      orderBy: { changedAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
  }
}

export default new TaskService()