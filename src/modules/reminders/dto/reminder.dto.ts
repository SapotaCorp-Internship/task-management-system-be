export interface CreateReminderDto {
  taskId: number;
  userId: number;
  deadline: Date | string | null;
}