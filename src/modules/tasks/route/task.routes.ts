import { Router } from "express";
import taskController from "../controller/task.controller.js";
import { authenticateToken } from "@/middleware/auth.middleware.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks with filtering, search and sorting
 *     security:
 *       - bearerAuth: []
 *     tags: ['Tasks']
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, DOING, DONE]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, deadline, priority]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 */
router.get("/", taskController.getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     security:
 *       - bearerAuth: []
 *     tags: ['Tasks']
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get("/:id", taskController.getTask);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     tags: ['Tasks']
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, DOING, DONE]
 *                 default: TODO
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created
 */
router.post("/", taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     tags: ['Tasks']
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, DOING, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               categoryId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
router.put("/:id", taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task (soft delete)
 *     security:
 *       - bearerAuth: []
 *     tags: ['Tasks']
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete("/:id", taskController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/history:
 *   get:
 *     summary: Get task history
 *     security:
 *       - bearerAuth: []
 *     tags: ['Tasks']
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task history
 *       404:
 *         description: Task not found
 */
router.get("/:id/history", taskController.getTaskHistory);

export default router;
