import { Router, Request, Response } from "express"
import categoryController from "./category.controller.js"
import { authenticateToken } from "@/middleware/auth.middleware.js"

const router = Router()

router.use(authenticateToken)

// Cast về RequestHandler để TypeScript chấp nhận AuthRequest
router.get("/", (req, res) => categoryController.getCategories(req as any, res))
router.get("/:id", (req, res) => categoryController.getCategory(req as any, res))
router.post("/", (req, res) => categoryController.createCategory(req as any, res))
router.put("/:id", (req, res) => categoryController.updateCategory(req as any, res))
router.delete("/:id", (req, res) => categoryController.deleteCategory(req as any, res))

export default router