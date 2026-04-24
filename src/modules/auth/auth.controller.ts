import { Request, Response } from "express"
import jwt from "jsonwebtoken"

const COOKIE_OPTIONS = {
  httpOnly: true,                    // JS phía client không đọc được → chống XSS
  secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS trên production
  sameSite: "lax" as const,          // Bảo vệ khỏi CSRF, vẫn cho phép OAuth redirect
} as const

const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const TOKEN_EXPIRES_IN = "7d"

class AuthController {

  googleCallback(req: Request, res: Response) {
    const user = (req as any).user

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_login_failed`
      )
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: TOKEN_EXPIRES_IN }
    )

    res.cookie("token", token, {
      ...COOKIE_OPTIONS,
      maxAge: TOKEN_MAX_AGE_MS,
    })

    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?login=success`)
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie("token", COOKIE_OPTIONS)
    return res.json({ success: true })
  }
}

export default new AuthController()