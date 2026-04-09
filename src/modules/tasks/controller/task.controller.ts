import { Request, Response } from "express";
import taskService from "../service/task.service.js";
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from "../dto/task.dto.js";
import { success, error } from "@/utils/response.js";

interface AuthRequest extends Request {
  user?: any;
}

export class TaskController {
  async getTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const query: TaskQueryDto = req.query;
      const result = await taskService.getTasks(userId, query);
      success(res, {
        tasks: result.tasks,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      error(res, "Failed to fetch tasks");
    }
  }

  async getTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const taskId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      const task = await taskService.getTaskById(taskId, userId);
      if (!task) {
        return error(res, "Task not found", 404);
      }
      success(res, task);
    } catch (err) {
      error(res, "Failed to fetch task");
    }
  }

  async createTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const data: CreateTaskDto = req.body;
      const task = await taskService.createTask(userId, data);
      success(res, task, 201);
    } catch (err) {
      error(res, "Failed to create task");
    }
  }

  async updateTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const taskId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      const data: UpdateTaskDto = req.body;
      const task = await taskService.updateTask(taskId, userId, data);
      success(res, task);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      if (message === "Task not found") {
        return error(res, message, 404);
      }
      error(res, "Failed to update task");
    }
  }

  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const taskId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      await taskService.deleteTask(taskId, userId);
      success(res, { message: "Task deleted successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      if (message === "Task not found") {
        return error(res, message, 404);
      }
      error(res, "Failed to delete task");
    }
  }

  async getTaskHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const taskId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      const history = await taskService.getTaskHistory(taskId, userId);
      success(res, history);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      if (message === "Task not found") {
        return error(res, message, 404);
      }
      error(res, "Failed to fetch task history");
    }
  }
}

export default new TaskController();
