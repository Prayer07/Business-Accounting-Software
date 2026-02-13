import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ExternalInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/external-invoice/${id}`)
      setInvoice(res.data)
    } catch (err) {
      toast.error("Failed to load invoice")
      navigate("/external-invoice", { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  const handlePrint = () => {
    window.print()
  }

  const downloadPDF = async () => {
    if (downloading) return

    try {
      setDownloading(true)
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF()

      let y = 20

      // Header
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      pdf.text("INVOICE", 105, y, { align: "center" })

      y += 15
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Customer: ${invoice.customerName}`, 20, y)

      y += 7
      pdf.text(
        `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-GB")}`,
        20,
        y
      )

      y += 7
      pdf.text(`Created by: ${invoice.createdBy.fullName}`, 20, y)

      y += 10
      pdf.setDrawColor(0)
      pdf.line(20, y, 190, y)

      // Items Header
      y += 10
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("Items", 20, y)

      y += 8
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      // Items List
      invoice.items.forEach((item: any) => {
        pdf.setFont("helvetica", "bold")
        pdf.text(item.name, 20, y)
        y += 5

        pdf.setFont("helvetica", "normal")
        pdf.text(`${item.quantity} × NGN${item.price.toLocaleString()}`, 20, y)

        pdf.setFont("helvetica", "bold")
        pdf.text(
          `NGN${(item.quantity * item.price).toLocaleString()}`,
          190,
          y - 5,
          { align: "right" }
        )

        y += 10
      })

      // Total
      y += 5
      pdf.line(20, y, 190, y)
      y += 10

      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Total", 20, y)
      pdf.text(`NGN${invoice.total.toLocaleString()}`, 190, y, {
        align: "right",
      })

      // Footer
      y += 20
      pdf.setFontSize(10)
      pdf.setTextColor(120)
      pdf.setFont("helvetica", "italic")
      pdf.text("Thank you for your business", 105, y, { align: "center" })

      pdf.save(`invoice-${invoice.id}.pdf`)
      toast.success("PDF downloaded!")
    } catch (err) {
      console.error("PDF generation error:", err)
      toast.error("Failed to generate PDF")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate("/external-invoice")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Invoices
      </Button>

      {/* Invoice Display */}
      <Card className="p-8 bg-white print:shadow-none">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#3e2f25] mb-2">INVOICE</h1>
          <p className="text-sm text-muted-foreground">
            Invoice #{invoice.id}
          </p>
        </div>

        {/* Customer Info */}
        <div className="space-y-2 mb-6">
          <p className="text-sm">
            <strong>Customer:</strong> {invoice.customerName}
          </p>
          <p className="text-sm">
            <strong>Date:</strong>{" "}
            {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-sm">
            <strong>Created by:</strong> {invoice.createdBy.fullName}
          </p>
        </div>

        <hr className="my-6" />

        {/* Items */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-lg">Items</h3>
          {invoice.items.map((item: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-start py-2 border-b last:border-b-0"
            >
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} × NGN{item.price.toLocaleString()}
                </p>
              </div>
              <p className="font-semibold">
                NGN{(item.quantity * item.price).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <hr className="my-6 border-2" />

        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold">Total</span>
          <span className="text-2xl font-bold text-[#6f4e37]">
            NGN{invoice.total.toLocaleString()}
          </span>
        </div>

        <hr className="my-6" />

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground italic">
          Thank you for your business
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 print:hidden">
        <Button
          onClick={handlePrint}
          className="bg-[#6f4e37] hover:bg-[#5c402d]"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>

        <Button
          onClick={downloadPDF}
          disabled={downloading}
          className="bg-[#6f4e37] hover:bg-[#5c402d]"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  )
}