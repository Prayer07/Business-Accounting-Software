import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import prisma from "../common/prisma.js"
import { createSession } from "../utils/session.js"

// ✅ Constants for configuration
const BCRYPT_ROUNDS = 12
const MIN_PASSWORD_LENGTH = 6

// ✅ Helper functions (DRY principle)
const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS)

const setCookie = (res: Response, sessionId: string, expiresAt: Date) => {
  const isProduction = process.env.NODE_ENV === "production"
  return res.cookie("session_id", sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: expiresAt,
  })
}

const formatUserResponse = (user: any) => ({
  id: user.id,
  role: user.role,
  fullName: user.fullName,
  email: user.email,
})

// ✅ Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }
  return null
}

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        fullName: true,
        businessId: true,
      },
    })

    // ✅ Generic error message to prevent user enumeration
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const { sessionId, expiresAt } = await createSession(user.id)

    setCookie(res, sessionId, expiresAt).json(formatUserResponse(user))
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed. Please try again." })
  }
}

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.session_id

    if (sessionId) {
      await prisma.session.deleteMany({
        where: { id: sessionId },
      })
    }

    const isProduction = process.env.NODE_ENV === "production"
    res.clearCookie("session_id", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    })

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Logout failed" })
  }
}

// ME
export const me = async (req: Request, res: Response) => {
  try {
    res.json({ user: formatUserResponse(req.user) })
  } catch (error) {
    console.error("Me error:", error)
    res.status(500).json({ error: "Failed to fetch user data" })
  }
}

// CREATE CLIENT
export const createClient = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body

    // ✅ Validation
    if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return res.status(400).json({ error: passwordError })
    }

    // ✅ Check existing email
    const exists = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    })

    if (exists) {
      return res.status(409).json({ error: "Email already exists" })
    }

    const hashed = await hashPassword(password)

    const client = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
        role: "CLIENT",
        businessId: req.user.businessId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        createdAt: true,
      },
    })

    res.status(201).json(client)
  } catch (error) {
    console.error("Create client error:", error)
    res.status(500).json({ error: "Failed to create cashier" })
  }
}

// CHANGE PASSWORD
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { fullName, email, name, oldPassword, newPassword } = req.body

    // ✅ Validation
    if (!fullName?.trim() || !email?.trim() || !name?.trim() || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      return res.status(400).json({ error: passwordError })
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different" })
    }

    // ✅ Check email uniqueness
    const emailExists = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        NOT: { id: req.user.id },
      },
      select: { id: true },
    })

    if (emailExists) {
      return res.status(409).json({ error: "Email already exists" })
    }

    // ✅ Verify old password
    const match = await bcrypt.compare(oldPassword, req.user.password)
    if (!match) {
      return res.status(401).json({ error: "Incorrect old password" })
    }

    const hashed = await hashPassword(newPassword)

    // ✅ Use transaction for atomic updates
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: hashed,
        },
      }),
      prisma.business.update({
        where: { id: req.user.businessId! },
        data: { name: name.trim() },
      }),
    ])

    res.json({ message: "Credentials updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Failed to update credentials" })
  }
}

// GET CLIENTS
export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        businessId: req.user.businessId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(clients)
  } catch (error) {
    console.error("Get clients error:", error)
    res.status(500).json({ error: "Failed to fetch cashiers" })
  }
}

// DELETE CLIENT
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id)

    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid cashier ID" })
    }

    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        role: "CLIENT",
        businessId: req.user.businessId,
      },
      select: { id: true },
    })

    if (!client) {
      return res.status(404).json({ error: "Cashier not found" })
    }

    // ✅ Use transaction for atomic deletion
    await prisma.$transaction([
      prisma.session.deleteMany({
        where: { userId: client.id },
      }),
      prisma.user.delete({
        where: { id: client.id },
      }),
    ])

    res.json({ message: "Cashier deleted successfully" })
  } catch (error) {
    console.error("Delete client error:", error)
    res.status(500).json({ error: "Failed to delete cashier" })
  }
}