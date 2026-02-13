import type { Request, Response } from "express"
import prisma from "../common/prisma.js"

export const registerPushToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    // ✅ Validation
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Valid token required" })
    }

    // ✅ Upsert token
    await prisma.pushToken.upsert({
      where: { userId: req.user.id },
      update: {
        token,
        updatedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        token,
      },
    })

    console.log(`✅ Push token registered for user ${req.user.id}`)
    res.json({ success: true, message: "Push token registered" })
  } catch (error) {
    console.error("Push token registration error:", error)
    res.status(500).json({ error: "Failed to register push token" })
  }
}

// ✅ Optional: Remove token on logout
export const removePushToken = async (req: Request, res: Response) => {
  try {
    await prisma.pushToken.deleteMany({
      where: { userId: req.user.id },
    })

    res.json({ success: true, message: "Push token removed" })
  } catch (error) {
    console.error("Push token removal error:", error)
    res.status(500).json({ error: "Failed to remove push token" })
  }
}





// import type { Request, Response } from "express"
// import prisma from "../common/prisma.js"

// export const registerPushToken = async (req: Request, res: Response) => {
//   const { token } = req.body

//   if (!token) {
//     return res.status(400).json({ error: "Token required" })
//   }

//   await prisma.pushToken.upsert({
//     where: { userId: req.user.id },
//     update: { token },
//     create: {
//       userId: req.user.id,
//       token,
//     },
//   })

//   res.json({ success: true })
// }
