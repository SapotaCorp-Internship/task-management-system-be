export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
