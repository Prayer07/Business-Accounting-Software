import { Router } from "express"
import { 
  addGoods, 
  createWarehouse,
  deleteGoods,
  deleteWarehouse,
  getWarehouses,
  updateGoods,
  updateWarehouse, 
} from "../controllers/warehouse.controller.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.post("/", requireAuth, createWarehouse)

router.get("/", requireAuth, getWarehouses)

router.put("/:id", requireAuth, updateWarehouse)

router.delete("/:id", requireAuth, deleteWarehouse)

router.post("/goods", requireAuth, addGoods)

router.put("/goods/:id", requireAuth, updateGoods)

router.delete("/goods/:id", requireAuth, deleteGoods)

export default router