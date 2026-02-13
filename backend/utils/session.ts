import prisma from "../common/prisma.js"
import { randomUUID } from "crypto"

const SESSION_DURATION_HOURS = 24
const SESSION_CLEANUP_THRESHOLD = 100 // Clean every 100 sessions

let sessionCreateCount = 0

// ✅ Cleanup expired sessions periodically
async function cleanupExpiredSessions() {
  try {
    const deleted = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
    if (deleted.count > 0) {
      console.log(`🧹 Cleaned up ${deleted.count} expired sessions`)
    }
  } catch (error) {
    console.error("Session cleanup error:", error)
  }
}

export async function createSession(userId: number) {
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  })

  // ✅ Trigger cleanup periodically
  sessionCreateCount++
  if (sessionCreateCount >= SESSION_CLEANUP_THRESHOLD) {
    sessionCreateCount = 0
    cleanupExpiredSessions().catch(console.error) // Fire and forget
  }

  return { sessionId, expiresAt }
}

export async function getUserFromSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          businessId: true,
          password: true, // Needed for changePassword validation
          createdAt: true
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
    }
    return null
  }

  return session.user
}

// ✅ Logout from all devices
export async function deleteAllUserSessions(userId: number) {
  await prisma.session.deleteMany({
    where: { userId },
  })
}