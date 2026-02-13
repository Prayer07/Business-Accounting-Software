import { Router } from "express"
import {
  addStore,
  updateStore,
  deleteStore,
  getStores,
  transferToStore,
  getTransferHistory,
  getStoreProducts,
} from "../controllers/store.controller.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.use(requireAuth)

router.post("/", addStore)
router.get("/", getStores)
router.put("/:id", updateStore)
router.delete("/:id", deleteStore)
router.get("/:id/products", getStoreProducts)

router.post("/transfer", transferToStore)
router.get("/transfer-history", getTransferHistory)
// router.get("/reports/transfer", getTransferByDate)
// router.get("/report/transfer-summary", getTransferSummary)

export default router