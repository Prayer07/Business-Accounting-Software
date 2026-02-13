import type { Request, Response } from "express"
import prisma from "../common/prisma.js"
import { resolveDateRange } from "../utils/dateRange.js"

export const getSales = async (req: Request, res: Response) => {
  if (!req.user.businessId) {
    return res.status(400).json({ error: "User has no business" })
  }

  const { period, from, to } = req.query

  let dateFilter: any = {}

  // Period shortcut
  if (period) {
    const range = resolveDateRange(String(period))
    if (range.from && range.to) {
      dateFilter.createdAt = {
        gte: range.from,
        lte: range.to,
      }
    }
  }

  // Custom range overrides
  if (from || to) {
    dateFilter.createdAt = {
      ...(from && { gte: new Date(String(from)) }),
      ...(to && { lte: new Date(String(to)) }),
    }
  }

  const sales = await prisma.sale.findMany({
    where: {
      store: { businessId: req.user.businessId },
      ...dateFilter,
    },
    include: {
      soldBy: { select: { fullName: true } },
      items: {
        include: {
          storeProduct: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)

  res.json({
    sales,
    totalRevenue,
    count: sales.length,
  })
}