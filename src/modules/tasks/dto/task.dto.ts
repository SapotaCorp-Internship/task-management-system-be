export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: "TODO" | "DOING" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  deadline?: string;
  categoryId?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: "TODO" | "DOING" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  deadline?: string | null;
  categoryId?: number | null;
}

export interface TaskQueryDto {
  status?: "TODO" | "DOING" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  categoryId?: number;
  search?: string; 
  sortBy?: "createdAt" | "deadline" | "priority";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  status: "TODO" | "DOING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline?: Date;
  completedAt?: Date;
  userId: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    color?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
