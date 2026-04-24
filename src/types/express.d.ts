export {}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        name: string
        googleId: string
        avatar?: string | undefined
      }
    }
  }
}