import prisma from "@/config/database.js"
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto.js"

export class CategoryError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "HAS_TASKS"
  ) {
    super(message)
    this.name = "CategoryError"
  }
}

export class CategoryService {

  async getCategories(userId: number) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }

  async getCategoryById(id: number, userId: number) {
    return prisma.category.findFirst({
      where: { id, userId },
    })
  }

  async createCategory(userId: number, data: CreateCategoryDto) {
    return prisma.category.create({
      data: { ...data, userId },
    })
  }

  async updateCategory(id: number, userId: number, data: UpdateCategoryDto) {
    const result = await prisma.category.updateMany({
      where: { id, userId },
      data,
    })

    if (result.count === 0) {
      throw new CategoryError("Category not found", "NOT_FOUND")
    }

    return result
  }

  async deleteCategory(id: number, userId: number) {
    const taskCount = await prisma.task.count({
      where: { categoryId: id, userId },
    })

    if (taskCount > 0) {
      throw new CategoryError(
        `Cannot delete category with ${taskCount} existing tasks`,
        "HAS_TASKS"
      )
    }

    const result = await prisma.category.deleteMany({
      where: { id, userId },
    })

    if (result.count === 0) {
      throw new CategoryError("Category not found", "NOT_FOUND")
    }

    return result
  }
}

export default new CategoryService()