import { Router } from "express"
import {
  registerPushToken,
  removePushToken,
} from "../controllers/push.controller.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.post("/register", requireAuth, registerPushToken)
router.delete("/remove", requireAuth, removePushToken)

export default router