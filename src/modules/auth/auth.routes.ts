import { authenticateToken } from '@/middleware/auth.middleware.js';
import { Router } from "express";
import passport from "@/config/auth.js";
import authController from "@/modules/auth/auth.controller.js";

const router = Router();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     description: Redirects to Google for authentication
 *     tags: ['Authentication']
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles the callback from Google OAuth and returns JWT token
 *     tags: ['Authentication']
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${frontendUrl}/login?error=google_login_failed`,
  }),
  authController.googleCallback,
);

router.get("/me", authenticateToken, (req, res) => {
  return res.json({
    user: (req as any).user,
  });
}
);

router.post("/logout", authenticateToken, authController.logout);

export default router;
