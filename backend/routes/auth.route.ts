import { Router } from "express"
import { changePassword, createClient, deleteClient, getClients, login, logout, me } from "../controllers/auth.controller.js"
import { authorize, requireAuth } from "../middleware/auth.js"

const router = Router()

// REGISTER
// router.post("/register", register)

router.post("/login", login)

router.post("/logout", logout)

router.get("/me", requireAuth, me)

router.post(
  "/create-client",
  requireAuth,
  authorize("SUPERADMIN"),
  createClient
)

router.put(
  "/change-password",
  requireAuth,
  authorize("SUPERADMIN"),
  changePassword
)

router.get("/clients", requireAuth, getClients)

router.delete("/clients/:id", requireAuth, deleteClient)

export default router