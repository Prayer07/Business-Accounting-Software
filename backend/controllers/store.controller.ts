import type { Request, Response } from "express"
import prisma from "../common/prisma.js"

// ✅ Helper to validate store ownership
async function validateStoreOwnership(storeId: number, businessId: number) {
  return await prisma.store.findFirst({
    where: {
      id: storeId,
      businessId,
    },
  })
}

// ADD STORE
export const addStore = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body

    // ✅ Validation
    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({ error: "Name and location are required" })
    }

    const businessId = req.user.businessId!

    // ✅ Check for duplicate
    const exists = await prisma.store.findFirst({
      where: {
        name: name.trim(),
        businessId,
      },
      select: { id: true },
    })

    if (exists) {
      return res.status(409).json({ error: "Store already exists" })
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        businessId,
      },
    })

    res.status(201).json(store)
  } catch (error) {
    console.error("Add store error:", error)
    res.status(500).json({ error: "Failed to create store" })
  }
}

// GET STORES
export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      where: { businessId: req.user.businessId! },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    res.json(stores)
  } catch (error) {
    console.error("Get stores error:", error)
    res.status(500).json({ error: "Failed to fetch stores" })
  }
}

// UPDATE STORE
export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, location } = req.body

    // ✅ Validation
    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({ error: "Name and location are required" })
    }

    const storeId = Number(id)
    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID" })
    }

    // ✅ Check ownership
    const store = await validateStoreOwnership(storeId, req.user.businessId!)

    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    // ✅ Check for duplicate name
    const duplicate = await prisma.store.findFirst({
      where: {
        name: name.trim(),
        businessId: req.user.businessId!,
        NOT: { id: storeId },
      },
      select: { id: true },
    })

    if (duplicate) {
      return res.status(409).json({ error: "Store name already exists" })
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        name: name.trim(),
        location: location.trim(),
      },
      include: { products: true },
    })

    res.json(updated)
  } catch (error) {
    console.error("Update store error:", error)
    res.status(500).json({ error: "Failed to update store" })
  }
}

// DELETE STORE
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const storeId = Number(id)
    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID" })
    }

    // ✅ Check ownership
    const store = await validateStoreOwnership(storeId, req.user.businessId!)

    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    // ✅ Check if store has products
    const productsCount = await prisma.storeProduct.count({
      where: { storeId },
    })

    if (productsCount > 0) {
      return res.status(400).json({
        error: `Cannot delete store with ${productsCount} product(s). Remove all products first.`,
      })
    }

    await prisma.store.delete({ where: { id: storeId } })

    res.json({ message: "Store deleted successfully" })
  } catch (error) {
    console.error("Delete store error:", error)
    res.status(500).json({ error: "Failed to delete store" })
  }
}

// TRANSFER TO STORE
export const transferToStore = async (req: Request, res: Response) => {
  try {
    const { warehouseProductId, storeId, quantity, price } = req.body

    // ✅ Validation
    if (!warehouseProductId || !storeId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Missing or invalid fields" })
    }

    if (!price || price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" })
    }

    const qty = Number(quantity)
    const unitPrice = Number(price)
    const warehouseProductIdNum = Number(warehouseProductId)
    const storeIdNum = Number(storeId)

    // ✅ Validate warehouse product
    const warehouseProduct = await prisma.warehouseProduct.findFirst({
      where: {
        id: warehouseProductIdNum,
        warehouse: { businessId: req.user.businessId! },
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        warehouseId: true,
      },
    })

    if (!warehouseProduct) {
      return res.status(404).json({ error: "Warehouse product not found" })
    }

    if (warehouseProduct.quantity < qty) {
      return res.status(400).json({
        error: "Insufficient stock in warehouse",
        available: warehouseProduct.quantity,
      })
    }

    // ✅ Validate store
    const store = await validateStoreOwnership(storeIdNum, req.user.businessId!)

    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    // ✅ Transaction - atomic transfer
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Reduce warehouse stock
      await tx.warehouseProduct.update({
        where: { id: warehouseProduct.id },
        data: { quantity: { decrement: qty } },
      })

      // 2️⃣ Upsert store product (merge if exists)
      await tx.storeProduct.upsert({
        where: {
          name_storeId: {
            name: warehouseProduct.name,
            storeId: store.id,
          },
        },
        update: {
          quantity: { increment: qty },
          price: unitPrice,
        },
        create: {
          name: warehouseProduct.name,
          quantity: qty,
          price: unitPrice,
          storeId: store.id,
        },
      })

      // 3️⃣ Log transfer history
      await tx.transferHistory.create({
        data: {
          productName: warehouseProduct.name,
          quantity: qty,
          price: unitPrice,
          warehouseId: warehouseProduct.warehouseId,
          storeId: store.id,
          businessId: req.user.businessId!,
          transferredById: req.user.id,
        },
      })
    })

    res.json({ message: "Transfer completed successfully" })
  } catch (error) {
    console.error("Transfer error:", error)
    res.status(500).json({ error: "Failed to transfer goods" })
  }
}

// GET TRANSFER HISTORY
export const getTransferHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.transferHistory.findMany({
      where: {
        businessId: req.user.businessId!,
      },
      include: {
        warehouse: {
          select: { name: true },
        },
        store: {
          select: { name: true },
        },
        transferredBy: {
          select: { fullName: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(history)
  } catch (error) {
    console.error("Get transfer history error:", error)
    res.status(500).json({ error: "Failed to fetch transfer history" })
  }
}

// GET STORE PRODUCTS
export const getStoreProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const storeId = Number(id)
    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID" })
    }

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        businessId: req.user.businessId!,
      },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    res.json(store)
  } catch (error) {
    console.error("Get store products error:", error)
    res.status(500).json({ error: "Failed to fetch store products" })
  }
}