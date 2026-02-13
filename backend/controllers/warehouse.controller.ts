import type { Request, Response } from "express"
import prisma from "../common/prisma.js"

// ✅ Helper to validate business ownership
async function validateWarehouseOwnership(
  warehouseId: number,
  businessId: number
) {
  return await prisma.warehouse.findFirst({
    where: {
      id: warehouseId,
      businessId,
    },
  })
}

// CREATE WAREHOUSE
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body

    // ✅ Validation
    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({ error: "Name and location are required" })
    }

    const businessId = req.user.businessId!

    // ✅ Check for duplicate
    const exists = await prisma.warehouse.findFirst({
      where: {
        name: name.trim(),
        businessId,
      },
      select: { id: true },
    })

    if (exists) {
      return res.status(409).json({ error: "Warehouse already exists" })
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        businessId,
      },
    })

    res.status(201).json(warehouse)
  } catch (error) {
    console.error("Create warehouse error:", error)
    res.status(500).json({ error: "Failed to create warehouse" })
  }
}

// GET WAREHOUSES
export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { businessId: req.user.businessId! },
      include: {
        goods: {
          orderBy: { dateAdded: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    res.json(warehouses)
  } catch (error) {
    console.error("Get warehouses error:", error)
    res.status(500).json({ error: "Failed to fetch warehouses" })
  }
}

// UPDATE WAREHOUSE
export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, location } = req.body

    // ✅ Validation
    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({ error: "Name and location are required" })
    }

    const warehouseId = Number(id)
    if (isNaN(warehouseId)) {
      return res.status(400).json({ error: "Invalid warehouse ID" })
    }

    // ✅ Check ownership
    const warehouse = await validateWarehouseOwnership(
      warehouseId,
      req.user.businessId!
    )

    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" })
    }

    // ✅ Check for duplicate name (excluding current warehouse)
    const duplicate = await prisma.warehouse.findFirst({
      where: {
        name: name.trim(),
        businessId: req.user.businessId!,
        NOT: { id: warehouseId },
      },
      select: { id: true },
    })

    if (duplicate) {
      return res.status(409).json({ error: "Warehouse name already exists" })
    }

    const updated = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: {
        name: name.trim(),
        location: location.trim(),
      },
      include: { goods: true },
    })

    res.json(updated)
  } catch (error) {
    console.error("Update warehouse error:", error)
    res.status(500).json({ error: "Failed to update warehouse" })
  }
}

// DELETE WAREHOUSE
export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const warehouseId = Number(id)
    if (isNaN(warehouseId)) {
      return res.status(400).json({ error: "Invalid warehouse ID" })
    }

    // ✅ Check ownership
    const warehouse = await validateWarehouseOwnership(
      warehouseId,
      req.user.businessId!
    )

    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" })
    }

    // ✅ Check if warehouse has goods
    const goodsCount = await prisma.warehouseProduct.count({
      where: { warehouseId },
    })

    if (goodsCount > 0) {
      return res.status(400).json({
        error: `Cannot delete warehouse with ${goodsCount} item(s). Remove all goods first.`,
      })
    }

    await prisma.warehouse.delete({ where: { id: warehouseId } })

    res.json({ message: "Warehouse deleted successfully" })
  } catch (error) {
    console.error("Delete warehouse error:", error)
    res.status(500).json({ error: "Failed to delete warehouse" })
  }
}

// ADD GOODS
export const addGoods = async (req: Request, res: Response) => {
  try {
    const { name, quantity, costPrice, sellingPrice, warehouseId } = req.body

    // ✅ Validation
    if (!name?.trim()) {
      return res.status(400).json({ error: "Product name is required" })
    }

    if (!warehouseId || isNaN(Number(warehouseId))) {
      return res.status(400).json({ error: "Valid warehouse ID is required" })
    }

    if (quantity <= 0 || costPrice < 0 || sellingPrice < 0) {
      return res.status(400).json({ error: "Invalid quantity or prices" })
    }

    // ✅ Validate warehouse ownership
    const warehouse = await validateWarehouseOwnership(
      Number(warehouseId),
      req.user.businessId!
    )

    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" })
    }

    // ✅ Check for duplicate product in same warehouse
    const exists = await prisma.warehouseProduct.findFirst({
      where: {
        name: name.trim(),
        warehouseId: warehouse.id,
      },
      select: { id: true },
    })

    if (exists) {
      return res.status(409).json({
        error: "Product already exists in this warehouse. Update quantity instead.",
      })
    }

    const product = await prisma.warehouseProduct.create({
      data: {
        name: name.trim(),
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        warehouseId: warehouse.id,
      },
    })

    res.status(201).json(product)
  } catch (error) {
    console.error("Add goods error:", error)
    res.status(500).json({ error: "Failed to add goods" })
  }
}

// UPDATE GOODS
export const updateGoods = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, quantity, costPrice, sellingPrice } = req.body

    // ✅ Validation
    const goodsId = Number(id)
    if (isNaN(goodsId)) {
      return res.status(400).json({ error: "Invalid goods ID" })
    }

    if (!name?.trim()) {
      return res.status(400).json({ error: "Product name is required" })
    }

    if (quantity <= 0 || costPrice < 0 || sellingPrice < 0) {
      return res.status(400).json({ error: "Invalid quantity or prices" })
    }

    // ✅ Check ownership
    const goods = await prisma.warehouseProduct.findFirst({
      where: {
        id: goodsId,
        warehouse: { businessId: req.user.businessId! },
      },
    })

    if (!goods) {
      return res.status(404).json({ error: "Goods not found" })
    }

    // ✅ Check for duplicate name in same warehouse (excluding current item)
    const duplicate = await prisma.warehouseProduct.findFirst({
      where: {
        name: name.trim(),
        warehouseId: goods.warehouseId,
        NOT: { id: goodsId },
      },
      select: { id: true },
    })

    if (duplicate) {
      return res.status(409).json({ error: "Product name already exists in this warehouse" })
    }

    const updated = await prisma.warehouseProduct.update({
      where: { id: goodsId },
      data: {
        name: name.trim(),
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
      },
    })

    res.json(updated)
  } catch (error) {
    console.error("Update goods error:", error)
    res.status(500).json({ error: "Failed to update goods" })
  }
}

// DELETE GOODS
export const deleteGoods = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const goodsId = Number(id)
    if (isNaN(goodsId)) {
      return res.status(400).json({ error: "Invalid goods ID" })
    }

    // ✅ Check ownership
    const goods = await prisma.warehouseProduct.findFirst({
      where: {
        id: goodsId,
        warehouse: { businessId: req.user.businessId! },
      },
    })

    if (!goods) {
      return res.status(404).json({ error: "Goods not found" })
    }

    await prisma.warehouseProduct.delete({ where: { id: goodsId } })

    res.json({ message: "Goods deleted successfully" })
  } catch (error) {
    console.error("Delete goods error:", error)
    res.status(500).json({ error: "Failed to delete goods" })
  }
}