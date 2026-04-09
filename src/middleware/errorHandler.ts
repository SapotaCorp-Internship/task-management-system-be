import { Request, Response, NextFunction } from "express";
import { error } from "@/utils/response.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);
  error(res, "Something went wrong!");
};
