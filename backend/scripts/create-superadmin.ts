import bcrypt from "bcrypt"
import prisma from "../common/prisma.js"

const BCRYPT_ROUNDS = 12

async function createSuperAdmin() {
  try {
    const email = process.env.SUPERADMIN_EMAIL
    const password = process.env.SUPERADMIN_PASSWORD
    const fullName = process.env.SUPERADMIN_NAME || "Super Admin"
    const businessName = process.env.BUSINESS_NAME || "My Business"

    if (!email || !password) {
      throw new Error("Missing SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD in .env")
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // ✅ Use transaction for atomic operation
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: email.toLowerCase() },
        update: {
          role: "SUPERADMIN",
          password: hashed,
        },
        create: {
          fullName,
          email: email.toLowerCase(),
          password: hashed,
          role: "SUPERADMIN",
        },
      })

      const business = await tx.business.upsert({
        where: { ownerId: user.id },
        update: { name: businessName },
        create: {
          name: businessName,
          ownerId: user.id,
        },
      })

      if (user.businessId !== business.id) {
        await tx.user.update({
          where: { id: user.id },
          data: { businessId: business.id },
        })
      }

      return { user, business }
    })

    console.log("✅ SUPERADMIN READY")
    console.log("📧 Email:", email)
    console.log("👤 Name:", result.user.fullName)
    console.log("🔑 Role:", result.user.role)
    console.log("🏢 Business:", result.business.name)
    console.log("⚠️  Change password after first login!")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    throw error
  }
}

createSuperAdmin()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })