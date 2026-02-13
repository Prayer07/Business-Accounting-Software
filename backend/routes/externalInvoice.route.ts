// routes/externalInvoice.routes.ts
import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import {
  createExternalInvoice,
  getExternalInvoice,
  getExternalInvoices,
} from "../controllers/externalInvoice.controller.js"

const router = Router()

router.use(requireAuth)

router.post("/", createExternalInvoice)
router.get("/", getExternalInvoices)
router.get("/:id", getExternalInvoice)

export default router