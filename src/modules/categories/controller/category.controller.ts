import { Request, Response } from "express";
import categoryService from "../service/category.service.js";
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto.js";
import { success, error } from "@/utils/response.js";

interface AuthRequest extends Request {
  user?: any;
}

export class CategoryController {
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const categories = await categoryService.getCategories(userId);
      success(res, categories);
    } catch (err) {
      error(res, "Failed to fetch categories");
    }
  }

  async getCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      const category = await categoryService.getCategoryById(
        categoryId,
        userId,
      );
      if (!category) {
        return error(res, "Category not found", 404);
      }
      success(res, category);
    } catch (err) {
      error(res, "Failed to fetch category");
    }
  }

  async createCategory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.userId;
    const data: CreateCategoryDto = req.body;

    const category = await categoryService.createCategory(userId, data);

    success(res, category, 201);
  } catch (err) {
    console.error(err);
    error(res, "Failed to create category");
  }
}

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      const data: UpdateCategoryDto = req.body;
      const result = await categoryService.updateCategory(
        categoryId,
        userId,
        data,
      );
      if (result.count === 0) {
        return error(res, "Category not found", 404);
      }
      success(res, { message: "Category updated successfully" });
    } catch (err) {
      error(res, "Failed to update category");
    }
  }

  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(
        typeof req.params.id === "string" ? req.params.id : "",
        10,
      );
      await categoryService.deleteCategory(categoryId, userId);
      success(res, { message: "Category deleted successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message === "Cannot delete category with existing tasks") {
        return error(res, message, 400);
      }
      error(res, "Failed to delete category");
    }
  }
}

export default new CategoryController();
