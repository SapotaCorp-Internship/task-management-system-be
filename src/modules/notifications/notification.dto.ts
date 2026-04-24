export interface CreateNotificationDto {
  taskId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
}

export interface NotificationResponseDto {
  id: number;
  taskId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  task?: {
    id: number;
    title: string;
    deadline?: Date;
  };
}
