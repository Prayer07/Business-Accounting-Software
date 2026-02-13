import type { Request, Response } from "express"
import prisma from "../common/prisma.js"
import admin from "../lib/firebaseAdmin.js"

// SEARCH STORE GOODS
export const searchStoreGoods = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim()

    if (!query) {
      return res.json([])
    }

    const goods = await prisma.storeProduct.findMany({
      where: {
        quantity: { gt: 0 },
        store: { businessId: req.user.businessId! },
        name: { contains: query, mode: "insensitive" },
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

    if (!query) {
      return res.json([])
    }

    const goods = await prisma.warehouseProduct.findMany({
      where: {
        quantity: { gt: 0 },
        warehouse: { businessId: req.user.businessId! },
        name: { contains: query, mode: "insensitive" },
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

// GET RECEIPT
export const getReceipt = async (req: Request, res: Response) => {
  try {
    const saleId = Number(req.params.saleId)

    if (isNaN(saleId)) {
      return res.status(400).json({ error: "Invalid receipt ID" })
    }

    const sale = await prisma.sale.findFirst({
      where: {
        id: saleId,
        store: {
          businessId: req.user.businessId!,
        },
      },
      include: {
        store: {
          select: { name: true },
        },
        soldBy: {
          select: { fullName: true },
        },
        items: {
          include: {
            storeProduct: {
              select: { name: true },
            },
          },
        },
        customer: {
          include: {
            debts: {
              where: { isCleared: false },
            },
          },
        },
      },
    })

    if (!sale) {
      return res.status(404).json({ error: "Receipt not found" })
    }

    // ✅ Calculate total debt (not including this sale)
    const totalDebt =
      sale.customer?.debts.reduce((sum, d) => sum + d.balance, 0) || 0

    const amountPaid = sale.amountPaid ?? sale.total
    const balance = sale.balance ?? 0
    const previousDebt = Math.max(0, totalDebt - balance)

    res.json({
      id: sale.id,
      store: sale.store.name,
      soldBy: sale.soldBy.fullName,
      createdAt: sale.createdAt,
      customerName: sale.customerName,
      items: sale.items.map((i) => ({
        name: i.name || i.storeProduct.name,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.quantity * i.price,
      })),
      total: sale.total,
      amountPaid,
      balance,
      previousDebt,
      totalDebt,
    })
  } catch (error) {
    console.error("Get receipt error:", error)
    res.status(500).json({ error: "Failed to fetch receipt" })
  }
}

// SEARCH CUSTOMERS
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim()

    if (!query) {
      return res.json([])
    }

    const customers = await prisma.customer.findMany({
      where: {
        businessId: req.user.businessId!,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        debts: {
          where: { isCleared: false },
        },
      },
      take: 10,
      orderBy: { fullName: "asc" },
    })

    res.json(
      customers.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        totalDebt: c.debts.reduce((sum, d) => sum + d.balance, 0),
      }))
    )
  } catch (error) {
    console.error("Search customers error:", error)
    res.status(500).json({ error: "Failed to search customers" })
  }
}

// SELL GOODS (multi-item cart: store + warehouse + outside goods)
// Note: Keeps legacy single-item payload working for existing clients.
export const sellGoods = async (req: Request, res: Response) => {
  const businessId = req.user.businessId
  if (!businessId) {
    return res.status(400).json({ error: "User has no business" })
  }

  const httpError = (status: number, message: string) => {
    const err: any = new Error(message)
    err.status = status
    return err
  }

  const toInt = (value: any, field: string) => {
    const num = Number(value)
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      throw httpError(400, `${field} must be a whole number`)
    }
    return num
  }

  try {
    const isCartPayload =
      req.body?.storeId != null ||
      Array.isArray(req.body?.storeItems) ||
      Array.isArray(req.body?.warehouseItems) ||
      Array.isArray(req.body?.outsideItems)

    // --------------------
    // Legacy single-item payload support
    // --------------------
    if (!isCartPayload) {
      const {
        storeProductId,
        quantity,
        price,
        customerId,
        customerName,
        paymentStatus,
      } = req.body

      const storeProductIdNum = toInt(storeProductId, "storeProductId")
      const qty = toInt(quantity, "quantity")
      const unitPrice = toInt(price, "price")

      if (qty <= 0 || unitPrice <= 0) {
        return res.status(400).json({ error: "Invalid sale data" })
      }

      if (paymentStatus === "credit" && !customerId) {
        return res
          .status(400)
          .json({ error: "Customer ID required for credit sales" })
      }

      const storeProduct = await prisma.storeProduct.findFirst({
        where: {
          id: storeProductIdNum,
          store: { businessId },
        },
        include: {
          store: {
            select: { id: true },
          },
        },
      })

      if (!storeProduct) {
        return res.status(404).json({ error: "Product not found" })
      }

      if (qty > storeProduct.quantity) {
        return res.status(400).json({
          error: "Not enough stock",
          available: storeProduct.quantity,
        })
      }

      const total = qty * unitPrice
      const amountPaid = paymentStatus === "credit" ? 0 : total
      const balance = total - amountPaid

      const { sale, updatedProduct } = await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            storeId: storeProduct.store.id,
            soldById: req.user.id,
            customerId: customerId || null,
            customerName: customerName?.trim() || null,
            total,
            amountPaid,
            balance,
          },
        })

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            storeProductId: storeProduct.id,
            name: storeProduct.name,
            quantity: qty,
            price: unitPrice,
          },
        })

        if (customerId && paymentStatus === "credit") {
          const customer = await tx.customer.findFirst({
            where: { id: Number(customerId), businessId },
            select: { id: true },
          })

          if (!customer) {
            throw httpError(404, "Customer not found")
          }

          const existingDebt = await tx.debt.findFirst({
            where: {
              customerId: customer.id,
              businessId,
              isCleared: false,
            },
          })

          if (existingDebt) {
            await tx.debt.update({
              where: { id: existingDebt.id },
              data: {
                totalAmount: { increment: balance },
                balance: { increment: balance },
              },
            })
          } else {
            await tx.debt.create({
              data: {
                customerId: customer.id,
                businessId,
                totalAmount: balance,
                balance,
                amountPaid: 0,
              },
            })
          }
        }

        const updatedProduct = await tx.storeProduct.update({
          where: { id: storeProduct.id },
          data: { quantity: { decrement: qty } },
          select: { id: true, name: true, quantity: true },
        })

        return { sale, updatedProduct }
      })

      sendLowStockNotification(updatedProduct, businessId).catch((err) => {
        console.error("Low stock notification failed:", err)
      })

      return res.status(201).json({
        saleId: sale.id,
        total,
        paid: amountPaid,
        balance,
      })
    }

    // --------------------
    // Cart payload
    // --------------------
    const storeId = toInt(req.body.storeId, "storeId")
    if (storeId <= 0) {
      throw httpError(400, "Invalid storeId")
    }

    const storeItems = Array.isArray(req.body.storeItems) ? req.body.storeItems : []
    const warehouseItems = Array.isArray(req.body.warehouseItems)
      ? req.body.warehouseItems
      : []
    const outsideItems = Array.isArray(req.body.outsideItems)
      ? req.body.outsideItems
      : []

    if (
      storeItems.length === 0 &&
      warehouseItems.length === 0 &&
      outsideItems.length === 0
    ) {
      throw httpError(400, "No items to sell")
    }

    const storeExists = await prisma.store.findFirst({
      where: { id: storeId, businessId },
      select: { id: true },
    })

    if (!storeExists) {
      throw httpError(404, "Store not found")
    }

    const normalizedStoreItems = storeItems.map((item: any, index: number) => {
      const storeProductId = toInt(
        item?.storeProductId,
        `Store item ${index + 1}: storeProductId`
      )
      const qty = toInt(item?.quantity, `Store item ${index + 1}: quantity`)
      const price = toInt(item?.price, `Store item ${index + 1}: price`)

      if (qty <= 0 || price <= 0) {
        throw httpError(400, `Store item ${index + 1}: Invalid quantity or price`)
      }

      return { storeProductId, quantity: qty, price }
    })

    const normalizedWarehouseItems = warehouseItems.map(
      (item: any, index: number) => {
        const warehouseProductId = toInt(
          item?.warehouseProductId,
          `Warehouse item ${index + 1}: warehouseProductId`
        )
        const qty = toInt(item?.quantity, `Warehouse item ${index + 1}: quantity`)
        const price = toInt(item?.price, `Warehouse item ${index + 1}: price`)

        if (qty <= 0 || price <= 0) {
          throw httpError(
            400,
            `Warehouse item ${index + 1}: Invalid quantity or price`
          )
        }

        return { warehouseProductId, quantity: qty, price }
      }
    )

    const normalizedOutsideItems = outsideItems.map((item: any, index: number) => {
      const name = String(item?.name ?? "").trim()
      if (!name) {
        throw httpError(400, `Outside item ${index + 1}: Name is required`)
      }

      const qty = toInt(item?.quantity, `Outside item ${index + 1}: quantity`)
      const price = toInt(item?.price, `Outside item ${index + 1}: price`)

      if (qty <= 0 || price <= 0) {
        throw httpError(
          400,
          `Outside item ${index + 1}: Invalid quantity or price`
        )
      }

      return { name, quantity: qty, price }
    })

    const total = [
      ...normalizedStoreItems.map((i: any) => i.quantity * i.price),
      ...normalizedWarehouseItems.map((i: any) => i.quantity * i.price),
      ...normalizedOutsideItems.map((i: any) => i.quantity * i.price),
    ].reduce((sum, v) => sum + v, 0)

    const paidInput = req.body.amountPaid
    const amountPaid =
      paidInput === undefined || paidInput === null || paidInput === ""
        ? total
        : toInt(paidInput, "amountPaid")

    if (amountPaid < 0) {
      throw httpError(400, "amountPaid cannot be negative")
    }

    if (amountPaid > total) {
      throw httpError(400, "amountPaid cannot exceed total")
    }

    const balance = total - amountPaid

    const customerIdRaw = req.body.customerId
    const customerId = customerIdRaw ? toInt(customerIdRaw, "customerId") : null
    const customerName = String(req.body.customerName ?? "").trim() || null

    if (balance > 0 && !customerId) {
      throw httpError(400, "Customer required for part payment")
    }

    const { sale, updatedStoreProducts } = await prisma.$transaction(
      async (tx) => {
        if (customerId) {
          const customer = await tx.customer.findFirst({
            where: { id: customerId, businessId },
            select: { id: true },
          })

          if (!customer) {
            throw httpError(404, "Customer not found")
          }
        }

        const sale = await tx.sale.create({
          data: {
            storeId,
            soldById: req.user.id,
            customerId: customerId || null,
            customerName,
            total,
            amountPaid,
            balance,
          },
        })

        let miscStoreProductId: number | null = null

        if (normalizedOutsideItems.length > 0 || normalizedWarehouseItems.length > 0) {
          const misc = await tx.storeProduct.upsert({
            where: {
              name_storeId: {
                name: "__POS_MISC__",
                storeId,
              },
            },
            update: {},
            create: {
              name: "__POS_MISC__",
              quantity: 0,
              price: 0,
              storeId,
              businessId,
            },
            select: { id: true },
          })

          miscStoreProductId = misc.id
        }

        const updatedStoreProducts: Array<{
          id: number
          name: string
          quantity: number
        }> = []

        for (const item of normalizedStoreItems) {
          const product = await tx.storeProduct.findFirst({
            where: {
              id: item.storeProductId,
              store: { businessId },
            },
            select: { id: true, name: true, quantity: true },
          })

          if (!product) {
            throw httpError(404, "Product not found")
          }

          if (product.quantity < item.quantity) {
            throw httpError(400, `Insufficient stock for ${product.name}`)
          }

          const updated = await tx.storeProduct.update({
            where: { id: product.id },
            data: { quantity: { decrement: item.quantity } },
            select: { id: true, name: true, quantity: true },
          })

          updatedStoreProducts.push(updated)

          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              storeProductId: product.id,
              name: product.name,
              quantity: item.quantity,
              price: item.price,
            },
          })
        }

        for (const item of normalizedWarehouseItems) {
          const product = await tx.warehouseProduct.findFirst({
            where: {
              id: item.warehouseProductId,
              warehouse: { businessId },
            },
            select: { id: true, name: true, quantity: true },
          })

          if (!product) {
            throw httpError(404, "Warehouse product not found")
          }

          if (product.quantity < item.quantity) {
            throw httpError(400, `Insufficient warehouse stock for ${product.name}`)
          }

          await tx.warehouseProduct.update({
            where: { id: product.id },
            data: { quantity: { decrement: item.quantity } },
          })

          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              storeProductId: miscStoreProductId!,
              name: product.name,
              quantity: item.quantity,
              price: item.price,
            },
          })
        }

        for (const item of normalizedOutsideItems) {
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              storeProductId: miscStoreProductId!,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            },
          })
        }

        if (balance > 0) {
          const existingDebt = await tx.debt.findFirst({
            where: {
              customerId: customerId!,
              businessId,
              isCleared: false,
            },
          })

          if (existingDebt) {
            await tx.debt.update({
              where: { id: existingDebt.id },
              data: {
                totalAmount: { increment: balance },
                balance: { increment: balance },
              },
            })
          } else {
            await tx.debt.create({
              data: {
                customerId: customerId!,
                businessId,
                totalAmount: balance,
                balance,
                amountPaid: 0,
              },
            })
          }
        }

        return { sale, updatedStoreProducts }
      }
    )

    for (const product of updatedStoreProducts) {
      sendLowStockNotification(product, businessId).catch((err) => {
        console.error("Low stock notification failed:", err)
      })
    }

    return res.status(201).json({
      message: "Sale completed",
      saleId: sale.id,
      total,
      paid: amountPaid,
      balance,
    })
  } catch (err: any) {
    console.error("Sell goods error:", err)
    return res.status(Number(err?.status) || 500).json({
      error: err?.message || "Failed to complete sale",
    })
  }
}

// ✅ Separate function for sending low stock notifications
async function sendLowStockNotification(
  product: { id: number; name: string; quantity: number },
  businessId: number
) {
  // Only notify when quantity is low (2 or below)
  if (product.quantity > 2) return

  try {
    // Find superadmin
    const superAdmin = await prisma.user.findFirst({
      where: {
        businessId,
        role: "SUPERADMIN",
      },
      select: { id: true, fullName: true },
    })

    if (!superAdmin) {
      console.log("⚠️ No superadmin found for business")
      return
    }

    // Get push token
    const pushToken = await prisma.pushToken.findUnique({
      where: { userId: superAdmin.id },
      select: { token: true },
    })

    if (!pushToken) {
      console.log("⚠️ No push token found for superadmin")
      return
    }

    // Send notification
    await admin.messaging().send({
      token: pushToken.token,
      notification: {
        title: "⚠️ Low Stock Alert",
        body: `${product.name} is down to ${product.quantity} unit(s)!`,
      },
      data: {
        type: "LOW_STOCK",
        productId: String(product.id),
        productName: product.name,
        quantity: String(product.quantity),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
      },
    })

    console.log(`✅ Low stock notification sent for: ${product.name}`)
  } catch (error) {
    console.error("❌ Failed to send notification:", error)
    throw error
  }
}


export const getAllSales = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim()

    const sales = await prisma.sale.findMany({
      where: {
        store: {
          businessId: req.user.businessId!,
        },
        ...(query && {
          OR: [
            {
              customerName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              customer: {
                fullName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          ],
        }),
      },
      include: {
        store: { select: { name: true } },
        soldBy: { select: { fullName: true } },
        customer: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(sales)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales" })
  }
}