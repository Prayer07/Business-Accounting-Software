import type { Request, Response } from "express"
import prisma from "../common/prisma.js"

// ADD CUSTOMER
export const addCustomer = async (req: Request, res: Response) => {
  try {
    const { fullName, phone, address } = req.body

    // ✅ Validation
    if (!fullName?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: "Full name and phone are required" })
    }

    // ✅ Check for duplicate phone number
    const exists = await prisma.customer.findFirst({
      where: {
        phone: phone.trim(),
        businessId: req.user.businessId!,
      },
      select: { id: true },
    })

    if (exists) {
      return res.status(409).json({ error: "Customer with this phone already exists" })
    }

    const customer = await prisma.customer.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        businessId: req.user.businessId!,
      },
    })

    res.status(201).json(customer)
  } catch (error) {
    console.error("Add customer error:", error)
    res.status(500).json({ error: "Failed to add customer" })
  }
}

// GET DEBTORS
export const getDebtors = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        businessId: req.user.businessId!,
      },
      include: {
        debts: {
          where: { isCleared: false },
          select: {
            id: true,
            totalAmount: true,
            balance: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(customers)
  } catch (error) {
    console.error("Get debtors error:", error)
    res.status(500).json({ error: "Failed to fetch debtors" })
  }
}

// GET CUSTOMER DEBTS
export const getCustomerDebts = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.customerId)

    if (isNaN(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID" })
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId: req.user.businessId!,
      },
      include: {
        debts: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    res.json(customer)
  } catch (error) {
    console.error("Get customer debts error:", error)
    res.status(500).json({ error: "Failed to fetch customer debts" })
  }
}

// ADD DEBT
export const addDebt = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.customerId)
    const { totalAmount } = req.body

    // ✅ Validation
    if (isNaN(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID" })
    }

    const amount = Number(totalAmount)
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be greater than 0" })
    }

    // ✅ Verify customer exists and belongs to business
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId: req.user.businessId!,
      },
      select: { id: true },
    })

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    const debt = await prisma.debt.create({
      data: {
        customerId,
        totalAmount: amount,
        amountPaid: 0,
        balance: amount,
        businessId: req.user.businessId!,
      },
    })

    res.status(201).json(debt)
  } catch (error) {
    console.error("Add debt error:", error)
    res.status(500).json({ error: "Failed to add debt" })
  }
}

// ADD PAYMENT
export const addPayment = async (req: Request, res: Response) => {
  try {
    const debtId = Number(req.params.id)
    const { amount } = req.body

    // ✅ Validation
    if (isNaN(debtId)) {
      return res.status(400).json({ error: "Invalid debt ID" })
    }

    const paymentAmount = Number(amount)
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" })
    }

    // ✅ Verify debt exists and belongs to business
    const debt = await prisma.debt.findFirst({
      where: {
        id: debtId,
        businessId: req.user.businessId!,
      },
    })

    if (!debt) {
      return res.status(404).json({ error: "Debt not found" })
    }

    if (debt.isCleared) {
      return res.status(400).json({ error: "Debt is already cleared" })
    }

    // ✅ Calculate new amounts
    const newAmountPaid = debt.amountPaid + paymentAmount
    const newBalance = debt.totalAmount - newAmountPaid

    if (newBalance < 0) {
      return res.status(400).json({
        error: "Payment exceeds debt",
        maxPayment: debt.balance,
      })
    }

    const updated = await prisma.debt.update({
      where: { id: debt.id },
      data: {
        amountPaid: newAmountPaid,
        balance: newBalance,
        isCleared: newBalance === 0,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error("Add payment error:", error)
    res.status(500).json({ error: "Failed to record payment" })
  }
}

// CLEAR DEBT
export const clearDebt = async (req: Request, res: Response) => {
  try {
    const debtId = Number(req.params.id)

    if (isNaN(debtId)) {
      return res.status(400).json({ error: "Invalid debt ID" })
    }

    const debt = await prisma.debt.findFirst({
      where: {
        id: debtId,
        businessId: req.user.businessId!,
      },
    })

    if (!debt) {
      return res.status(404).json({ error: "Debt not found" })
    }

    if (debt.isCleared) {
      return res.status(400).json({ error: "Debt is already cleared" })
    }

    const clearedDebt = await prisma.debt.update({
      where: { id: debt.id },
      data: {
        balance: 0,
        amountPaid: debt.totalAmount,
        isCleared: true,
      },
    })

    res.json(clearedDebt)
  } catch (error) {
    console.error("Clear debt error:", error)
    res.status(500).json({ error: "Failed to clear debt" })
  }
}