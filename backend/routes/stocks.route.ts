import { Router } from "express"
import {
  searchStoreGoods,
  searchWarehouseGoods,
} from "../controllers/stocks.controller.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.use(requireAuth)

router.get("/store/search", searchStoreGoods)
router.get("/warehouse/search", searchWarehouseGoods)

export default router