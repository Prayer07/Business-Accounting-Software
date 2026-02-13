import type { Request, Response } from "express"
import prisma from "../common/prisma.js"

// CREATE EXTERNAL INVOICE
export const createExternalInvoice = async (req: Request, res: Response) => {
  try {
    const { customerName, items } = req.body

    // ✅ Validation
    if (!customerName?.trim()) {
      return res.status(400).json({ error: "Customer name is required" })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" })
    }

    // ✅ Validate each item
    for (const item of items) {
      if (!item.name?.trim()) {
        return res.status(400).json({ error: "Item name is required" })
      }
      if (!item.price || item.price <= 0) {
        return res.status(400).json({ error: "Item price must be greater than 0" })
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: "Item quantity must be greater than 0" })
      }
    }

    // ✅ Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    )

    const invoice = await prisma.externalInvoice.create({
      data: {
        businessId: req.user.businessId!,
        customerName: customerName.trim(),
        total,
        createdById: req.user.id,
        items: {
          create: items.map((item: any) => ({
            name: item.name.trim(),
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: {
        items: true,
        createdBy: {
          select: { fullName: true },
        },
      },
    })

    res.status(201).json(invoice)
  } catch (error) {
    console.error("Create invoice error:", error)
    res.status(500).json({ error: "Failed to create invoice" })
  }
}

// GET SINGLE INVOICE
export const getExternalInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.id)

    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice ID" })
    }

    const invoice = await prisma.externalInvoice.findFirst({
      where: {
        id: invoiceId,
        businessId: req.user.businessId!,
      },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
        createdBy: {
          select: { fullName: true },
        },
      },
    })

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" })
    }

    res.json(invoice)
  } catch (error) {
    console.error("Get invoice error:", error)
    res.status(500).json({ error: "Failed to fetch invoice" })
  }
}

// GET ALL INVOICES
export const getExternalInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.externalInvoice.findMany({
      where: {
        businessId: req.user.businessId!,
      },
      include: {
        createdBy: {
          select: { fullName: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(invoices)
  } catch (error) {
    console.error("Get invoices error:", error)
    res.status(500).json({ error: "Failed to fetch invoices" })
  }
}

// DELETE INVOICE (Optional - Add if needed)
export const deleteExternalInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.id)

    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice ID" })
    }

    const invoice = await prisma.externalInvoice.findFirst({
      where: {
        id: invoiceId,
        businessId: req.user.businessId!,
      },
      select: { id: true },
    })

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" })
    }

    await prisma.externalInvoice.delete({
      where: { id: invoice.id },
    })

    res.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Delete invoice error:", error)
    res.status(500).json({ error: "Failed to delete invoice" })
  }
}