import dotenv from "dotenv";
import passport from "./auth.js";

dotenv.config();

export const swaggerSpecs = {
  openapi: "3.0.0",
  info: {
    title: "Task Management System API",
    version: "1.0.0",
    description:
      "Task Management System backend documentation with authentication, task, and category APIs.",
    contact: {
      name: "Task Management Team",
      email: "support@example.com",
    },
  },
  servers: [
    {
      url: process.env.APP_URL,
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Authentication", description: "Google OAuth login endpoints" },
    { name: "Categories", description: "Task category CRUD endpoints" },
    {
      name: "Tasks",
      description: "Task CRUD, filtering, sorting, and history",
    },
    {
      name: "Notifications",
      description: "Notification retrieval and read status endpoints",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          color: { type: "string", nullable: true },
          userId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["TODO", "DOING", "DONE"] },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          deadline: { type: "string", format: "date-time", nullable: true },
          completedAt: { type: "string", format: "date-time", nullable: true },
          userId: { type: "integer" },
          categoryId: { type: "integer", nullable: true },
          category: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              color: { type: "string", nullable: true },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TaskHistory: {
        type: "object",
        properties: {
          id: { type: "integer" },
          taskId: { type: "integer" },
          userId: { type: "integer" },
          action: { type: "string" },
          oldValue: { type: "string", nullable: true },
          newValue: { type: "string", nullable: true },
          changedAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "integer" },
          taskId: { type: "integer" },
          userId: { type: "integer" },
          title: { type: "string" },
          message: { type: "string" },
          type: { type: "string" },
          isRead: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          task: {
            type: "object",
            properties: {
              id: { type: "integer" },
              title: { type: "string" },
              deadline: { type: "string", format: "date-time", nullable: true },
            },
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              email: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/api/auth/google": {
      get: {
        tags: ["Authentication"],
        summary: "Initiate Google OAuth login",
        description: "Redirect users to Google to start authentication.",
        responses: {
          "302": { description: "Redirect to Google authentication page" },
        },
      },
    },
    "/api/auth/google/callback": {
      get: {
        tags: ["Authentication"],
        summary: "Google OAuth callback",
        description: "Handle Google callback and return JWT token.",
        responses: {
          "200": {
            description: "Successful login",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": { description: "Authentication failed" },
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        description: "Retrieve all categories for the authenticated user.",
        responses: {
          "200": {
            description: "List of categories",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        description: "Create a new category for the authenticated user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  color: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Category created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
              },
            },
          },
        },
      },
    },
    "/api/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get category",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Category details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
              },
            },
          },
          "404": { description: "Category not found" },
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Update category",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  color: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Category updated" },
          "404": { description: "Category not found" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete category",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Category deleted" },
          "400": { description: "Cannot delete category with existing tasks" },
          "404": { description: "Category not found" },
        },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        description:
          "Retrieve tasks with optional filtering, search, and sorting.",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["TODO", "DOING", "DONE"] },
          },
          {
            name: "priority",
            in: "query",
            schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          },
          { name: "categoryId", in: "query", schema: { type: "integer" } },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "deadline", "priority"],
            },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Paginated task list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: {
                    type: "string",
                    enum: ["TODO", "DOING", "DONE"],
                    default: "TODO",
                  },
                  priority: {
                    type: "string",
                    enum: ["LOW", "MEDIUM", "HIGH"],
                    default: "MEDIUM",
                  },
                  deadline: { type: "string", format: "date-time" },
                  categoryId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
              },
            },
          },
        },
      },
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Task details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
              },
            },
          },
          "404": { description: "Task not found" },
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Update task",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["TODO", "DOING", "DONE"] },
                  priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                  deadline: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  categoryId: { type: "integer", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Task updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
              },
            },
          },
          "404": { description: "Task not found" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Task deleted" },
          "404": { description: "Task not found" },
        },
      },
    },
    "/api/tasks/{id}/history": {
      get: {
        tags: ["Tasks"],
        summary: "Get task history",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Task history",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TaskHistory" },
                },
              },
            },
          },
          "404": { description: "Task not found" },
        },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications",
        description: "Retrieve notifications for the authenticated user.",
        responses: {
          "200": {
            description: "User notifications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Notification" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/notifications/{id}/read": {
      put: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Notification marked as read",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid notification ID" },
          "404": { description: "Notification not found" },
        },
      },
    },
  },
};
