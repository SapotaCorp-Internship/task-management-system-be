export type TaskStatus = "TODO" | "DOING" | "DONE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"
export type SortOrder = "asc" | "desc"
export type TaskSortBy = "createdAt" | "deadline" | "priority"

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string      
  categoryId?: number
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string | null
  categoryId?: number | null
}

export interface TaskQueryDto {
  status?: TaskStatus
  priority?: TaskPriority
  categoryId?: number
  search?: string
  sortBy?: TaskSortBy
  sortOrder?: SortOrder
  page?: number
  limit?: number
}

export interface TaskResponse {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  deadline?: Date
  completedAt?: Date
  userId: number
  categoryId?: number
  category?: {
    id: number
    name: string
    color?: string
  }
  createdAt: Date
  updatedAt: Date
}