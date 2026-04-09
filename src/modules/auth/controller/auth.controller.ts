import { Request, Response } from "express";
import jwt from "jsonwebtoken";

class AuthController {
  googleCallback(req: Request, res: Response) {
    const user = (req as any).user;

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_login_failed`
      );
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?login=success`
    );
  }
}

export default new AuthController();