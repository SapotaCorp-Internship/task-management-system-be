import { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function error(res: Response, message: string, status = 500) {
  return res.status(status).json({ success: false, error: message });
}
