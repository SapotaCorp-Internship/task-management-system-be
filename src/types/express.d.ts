import { User } from "@prisma/client"

declare global {
  namespace Express {
    interface Request {
      user?: User  // dùng Prisma User type, optional để thống nhất
    }
  }
}