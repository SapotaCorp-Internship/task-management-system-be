import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"]
  const bearerToken = authHeader?.split(" ")[1]
  const cookieToken = req.cookies?.token 

  const token = bearerToken || cookieToken

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = {
      id: decoded.userId,
      ...decoded,
    }
    next()
  })
}