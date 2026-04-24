import { Request, Response } from "express"
import categoryService, { CategoryError } from "./category.service.js"
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto.js"
import { success, error } from "@/utils/response.js"

interface AuthRequest extends Request {
  user?: { id: number }
}

function parseId(param: string | string[] | undefined): number | null {
  const value = Array.isArray(param) ? param[0] : param
  if (!value) return null
  const id = parseInt(value, 10)
  return isNaN(id) || id <= 0 ? null : id
}

function handleCategoryError(err: unknown, res: Response) {
  if (err instanceof CategoryError) {
    const status = err.code === "NOT_FOUND" ? 404 : 400
    return error(res, err.message, status)
  }
  return error(res, "Internal server error", 500)
}

export class CategoryController {
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const categories = await categoryService.getCategories(userId)
      return success(res, categories)
    } catch (err) {
      return handleCategoryError(err, res)
    }
  }

  async getCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id

      const categoryId = parseId(req.params.id)
      if (!categoryId) {
        return error(res, "Invalid category id", 400)
      }

      const category = await categoryService.getCategoryById(categoryId, userId)
      if (!category) {
        return error(res, "Category not found", 404)
      }

      return success(res, category)
    } catch (err) {
      return handleCategoryError(err, res)
    }
  }

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id  
      const data: CreateCategoryDto = req.body
      const category = await categoryService.createCategory(userId, data)
      return success(res, category, 201)
    } catch (err) {
      return handleCategoryError(err, res)
    }
  }

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const categoryId = parseId(req.params.id)
      if (!categoryId) {
        return error(res, "Invalid category id", 400)
      }

      const data: UpdateCategoryDto = req.body
      await categoryService.updateCategory(categoryId, userId, data)
      return success(res, { message: "Category updated successfully" })
    } catch (err) {
      return handleCategoryError(err, res)
    }
  }

  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const categoryId = parseId(req.params.id)
      if (!categoryId) {
        return error(res, "Invalid category id", 400)
      }

      await categoryService.deleteCategory(categoryId, userId)
      return success(res, { message: "Category deleted successfully" })
    } catch (err) {
      return handleCategoryError(err, res)
    }
  }
}

export default new CategoryController()