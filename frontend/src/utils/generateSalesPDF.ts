// utils/generateSalesPDF.ts
import { jsPDF } from "jspdf"

export function generateSalesPDF(sales: any[], totalRevenue: number) {
  const pdf = new jsPDF()
  let y = 20

  // ===== HEADER =====
  pdf.setFontSize(20)
  pdf.setTextColor(111, 78, 55) // coffee brown
  pdf.text("Sales Report", 105, y, { align: "center" })

  y += 8
  pdf.setDrawColor(111, 78, 55)
  pdf.setLineWidth(1.5)
  pdf.line(20, y, 190, y)

  y += 10

  // ===== SALES LIST =====
  sales.forEach((sale) => {
    if (y > 260) {
      pdf.addPage()
      y = 20
    }

    // Sale header
    pdf.setFontSize(11)
    pdf.setTextColor(62, 44, 35) // dark coffee
    pdf.text(`Sale #${sale.id}`, 20, y)
    y += 5

    pdf.setFontSize(10)
    pdf.setTextColor(120, 90, 70) // muted brown
    pdf.text(
      new Date(sale.createdAt).toLocaleString(),
      20,
      y
    )
    y += 6

    // Items
    sale.items.forEach((item: any) => {
      pdf.setTextColor(62, 44, 35)
      pdf.text(
        `${item.storeProduct.name} x${item.quantity}`,
        25,
        y
      )

      pdf.setTextColor(111, 78, 55)
      pdf.text(
        `NGN${(item.price * item.quantity).toLocaleString()}`,
        190,
        y,
        { align: "right" }
      )
      y += 5
    })

    y += 3
    pdf.setFontSize(11)
    pdf.setTextColor(6, 95, 70) // green accent (revenue)
    pdf.text(
      `Total: NGN${sale.total.toLocaleString()}`,
      190,
      y,
      { align: "right" }
    )

    y += 10
  })

  // ===== GRAND TOTAL PAGE =====
  pdf.addPage()

  pdf.setFontSize(18)
  pdf.setTextColor(111, 78, 55)
  pdf.text("Grand Total", 105, 40, { align: "center" })

  pdf.setFontSize(22)
  pdf.setTextColor(6, 95, 70)
  pdf.text(
    `NGN${totalRevenue.toLocaleString()}`,
    105,
    60,
    { align: "center" }
  )

  // Footer
  pdf.setFontSize(10)
  pdf.setTextColor(150, 150, 150)
  pdf.text(
    "Generated from Sales Report",
    105,
    285,
    { align: "center" }
  )

  pdf.save("sales-report.pdf")
}