// src/modules/tasks/task.controller.ts
import { Request, Response } from "express"
import taskService, { TaskError } from "./task.service.js"
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from "./task.dto.js"
import { success, error } from "@/utils/response.js"

// Xóa toàn bộ declare global ở đây

function parseId(param: string | string[] | undefined): number | null {
  const value = Array.isArray(param) ? param[0] : param
  if (!value) return null
  const id = parseInt(value, 10)
  return isNaN(id) || id <= 0 ? null : id
}

function handleTaskError(err: unknown, res: Response) {
  if (err instanceof TaskError) {
    const status = err.code === "NOT_FOUND" ? 404 : 403
    return error(res, err.message, status)
  }
  return error(res, "Internal server error", 500)
}

function parseQuery(query: Request["query"]): TaskQueryDto {
  const result: TaskQueryDto = {}

  const status = query.status as string | undefined
  if (status === "TODO" || status === "DOING" || status === "DONE")
    result.status = status

  const priority = query.priority as string | undefined
  if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH")
    result.priority = priority

  const sortBy = query.sortBy as string | undefined
  if (sortBy === "createdAt" || sortBy === "deadline" || sortBy === "priority")
    result.sortBy = sortBy

  const sortOrder = query.sortOrder as string | undefined
  if (sortOrder === "asc" || sortOrder === "desc")
    result.sortOrder = sortOrder

  if (query.categoryId !== undefined)
    result.categoryId = Number(query.categoryId)
  if (query.search !== undefined)
    result.search = query.search as string
  if (query.page !== undefined)
    result.page = Number(query.page)
  if (query.limit !== undefined)
    result.limit = Number(query.limit)

  return result
}

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const userId = (req.user as { id: number }).id
      const query = parseQuery(req.query)
      const result = await taskService.getTasks(userId, query)
      return success(res, {
        tasks: result.tasks,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      })
    } catch (err) {
      return handleTaskError(err, res)
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const userId = (req.user as { id: number }).id
      const taskId = parseId(req.params.id)
      if (!taskId) return error(res, "Invalid task id", 400)
      const task = await taskService.getTaskById(taskId, userId)
      if (!task) return error(res, "Task not found", 404)
      return success(res, task)
    } catch (err) {
      return handleTaskError(err, res)
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const userId = (req.user as { id: number }).id
      const data: CreateTaskDto = req.body
      const task = await taskService.createTask(userId, data)
      return success(res, task, 201)
    } catch (err) {
      return handleTaskError(err, res)
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const userId = (req.user as { id: number }).id
      const taskId = parseId(req.params.id)
      if (!taskId) return error(res, "Invalid task id", 400)
      const data: UpdateTaskDto = req.body
      const task = await taskService.updateTask(taskId, userId, data)
      return success(res, task)
    } catch (err) {
      return handleTaskError(err, res)
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const userId = (req.user as { id: number }).id
      const taskId = parseId(req.params.id)
      if (!taskId) return error(res, "Invalid task id", 400)
      await taskService.deleteTask(taskId, userId)
      return success(res, { message: "Task deleted successfully" })
    } catch (err) {
      return handleTaskError(err, res)
    }
  }

  async getTaskHistory(req: Request, res: Response) {
    try {
      const userId = (req.user as { id: number }).id
      const taskId = parseId(req.params.id)
      if (!taskId) return error(res, "Invalid task id", 400)
      const history = await taskService.getTaskHistory(taskId, userId)
      return success(res, history)
    } catch (err) {
      return handleTaskError(err, res)
    }
  }
}

export default new TaskController()