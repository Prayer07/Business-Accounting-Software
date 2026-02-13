import type { Request, Response } from "express"
import prisma from "../common/prisma.js"

// SEARCH STORE GOODS
export const searchStoreGoods = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim()

    const goods = await prisma.storeProduct.findMany({
      where: {
        quantity: { gt: 0 },
        store: { businessId: req.user.businessId! },
        ...(query && {
          name: { contains: query, mode: "insensitive" },
        })
      },
      include: {
        store: {
          select: { name: true },
        },
      },
      take: 20,
      orderBy: { name: "asc" },
    })

    res.json(
      goods.map((g) => ({
        storeProductId: g.id,
        name: g.name,
        storeName: g.store.name,
        price: g.price,
        quantity: g.quantity,
      }))
    )
  } catch (error) {
    console.error("Search goods error:", error)
    res.status(500).json({ error: "Failed to search products" })
  }
}

// SEARCH WAREHOUSE GOODS
export const searchWarehouseGoods = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim()

    const goods = await prisma.warehouseProduct.findMany({
      where: {
        quantity: { gt: 0 },
        warehouse: { businessId: req.user.businessId! },
        ...(query && {
          name: { contains: query, mode: "insensitive" },
        })
      },
      include: {
        warehouse: {
          select: { name: true },
        },
      },
      take: 20,
      orderBy: { name: "asc" },
    })

    res.json(
      goods.map((g) => ({
        warehouseProductId: g.id,
        name: g.name,
        warehouseName: g.warehouse.name,
        price: g.sellingPrice,
        quantity: g.quantity,
      }))
    )
  } catch (error) {
    console.error("Search warehouse goods error:", error)
    res.status(500).json({ error: "Failed to search warehouse products" })
  }
}