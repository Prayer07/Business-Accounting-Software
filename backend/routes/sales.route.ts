import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { getSales } from "../controllers/sales.controller.js"

const router = Router()

router.get("/", requireAuth, getSales)

export default router