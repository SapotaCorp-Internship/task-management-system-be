export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse extends ApiResponse<null> {
  success: false;
  error: string;
}
