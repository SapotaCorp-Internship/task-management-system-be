import prisma from "@/config/database.js";
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto.js";

export class CategoryService {
  async getCategories(userId: number) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCategoryById(id: number, userId: number) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  }

  async createCategory(userId: number, data: CreateCategoryDto) {
    return prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateCategory(id: number, userId: number, data: UpdateCategoryDto) {
    return prisma.category.updateMany({
      where: { id, userId },
      data,
    });
  }

  async deleteCategory(id: number, userId: number) {
    const taskCount = await prisma.task.count({
      where: { categoryId: id, userId },
    });

    if (taskCount > 0) {
      throw new Error("Cannot delete category with existing tasks");
    }

    return prisma.category.deleteMany({
      where: { id, userId },
    });
  }
}

export default new CategoryService();
