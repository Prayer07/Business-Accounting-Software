import { Router } from "express"
import {
  getAllSales,
  getReceipt,
  searchCustomers,
  searchStoreGoods,
  searchWarehouseGoods,
  sellGoods,
} from "../controllers/pos.controller.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.use(requireAuth)

router.get("/search", searchStoreGoods)
router.get("/warehouse/search", searchWarehouseGoods)
router.post("/sell", sellGoods)
router.get("/receipt/:saleId", getReceipt)
router.get("/customers/search", searchCustomers)
router.get("/sales", getAllSales)

export default router