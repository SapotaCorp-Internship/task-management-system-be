export interface CreateReminderDto {
  taskId: number
  deadline: Date | string | null
}

export interface ReminderStatusResponse {
  isSent: boolean
  remindAt: Date | null
  taskId: number
}