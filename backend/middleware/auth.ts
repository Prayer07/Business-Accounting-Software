import type { Request, Response, NextFunction } from "express"
import { getUserFromSession } from "../utils/session.js"

// ✅ Simple in-memory cache (optional, for high traffic)
const sessionCache = new Map<string, { user: any; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId = req.cookies.session_id

    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    // ✅ Check cache (optional optimization)
    const cached = sessionCache.get(sessionId)
    if (cached && cached.expiresAt > Date.now()) {
      req.user = cached.user
      return next()
    }

    const user = await getUserFromSession(sessionId)

    if (!user) {
      sessionCache.delete(sessionId)
      return res.status(401).json({ error: "Invalid or expired session" })
    }

    // ✅ Update cache
    sessionCache.set(sessionId, {
      user,
      expiresAt: Date.now() + CACHE_TTL,
    })

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}

// ✅ Cache cleanup (runs every 10 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (value.expiresAt < now) {
      sessionCache.delete(key)
    }
  }
}, 10 * 60 * 1000)