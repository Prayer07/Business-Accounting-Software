import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function Receipt() {
  const { saleId } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const fetchReceipt = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/pos/receipt/${saleId}`)
      setReceipt(res.data)
    } catch (err) {
      toast.error("Failed to load receipt")
      navigate("/pos", { replace: true })
    } finally {
      setLoading(false)
    }
  }, [saleId, navigate])

  useEffect(() => {
    fetchReceipt()
  }, [fetchReceipt])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (downloading) return

    try {
      setDownloading(true)

      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
      })

      let y = 20

      // Header with border
      pdf.setLineWidth(1)
      pdf.line(20, 15, 190, 15)

      // RECEIPT title
      y += 15
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text("RECEIPT", 20, y)
      y += 15

      // Company Info (left side)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "bold")
      pdf.text("BUSINESS ACCOUNTING SOFTWARE NIG.LTD", 20, y)
      y += 4
      pdf.text("08135672304", 20, y)
      y += 4
      pdf.text("09161083039", 20, y)

      // Date box (right side)
      const dateY = 35
      pdf.setFillColor(240, 240, 240)
      pdf.rect(140, dateY, 50, 12, "F")
      pdf.setFontSize(7)
      pdf.setTextColor(100)
      pdf.text("DATE", 165, dateY + 3, { align: "center" })
      pdf.setFontSize(9)
      pdf.setTextColor(0)
      pdf.setFont("helvetica", "bold")
      pdf.text(
        new Date(receipt.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        165,
        dateY + 9,
        { align: "center" }
      )

      // Receipt # box
      const receiptNoY = dateY + 15
      pdf.setFillColor(240, 240, 240)
      pdf.rect(140, receiptNoY, 50, 12, "F")
      pdf.setFontSize(7)
      pdf.setTextColor(100)
      pdf.text("RECEIPT #", 165, receiptNoY + 3, { align: "center" })
      pdf.setFontSize(9)
      pdf.setTextColor(0)
      pdf.setFont("helvetica", "bold")
      pdf.text(saleId?.slice(-8).toUpperCase() || "N/A", 165, receiptNoY + 9, { align: "center" })

      y += 15
      pdf.setDrawColor(0)
      pdf.line(20, y, 190, y)
      y += 10

      // BILL TO section
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(100)
      pdf.text("BILL TO", 20, y)
      pdf.text("SITE / LOCATION", 105, y)
      y += 8

      pdf.setFontSize(9)
      pdf.setTextColor(0)
      pdf.setFont("helvetica", "bold")
      pdf.text(receipt.customerName || "Walk-in Customer", 20, y)
      pdf.text(receipt.store, 105, y)
      y += 8
      pdf.setFont("helvetica", "normal")
      pdf.text(receipt.customerName ? "Customer" : "", 20, y)
      pdf.text("Store", 105, y)

      y += 16

      // Table Header
      pdf.setFillColor(200, 230, 255)
      pdf.rect(20, y - 5, 170, 8, "F")
      
      pdf.setDrawColor(100, 180, 255)
      pdf.setLineWidth(0.5)
      pdf.line(20, y - 5, 190, y - 5)
      pdf.line(20, y + 3, 190, y + 3)

      pdf.setFontSize(8)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(0)
      pdf.text("DESCRIPTION", 22, y)
      pdf.text("QTY / HR", 110, y, { align: "center" })
      pdf.text("UNIT PRICE / RATE", 145, y, { align: "center" })
      pdf.text("TOTAL", 185, y, { align: "right" })

      y += 16

      // Items
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setDrawColor(200)
      pdf.setLineWidth(0.3)

      receipt.items.forEach((item: any) => {
        pdf.text(item.name, 22, y)
        pdf.text(item.quantity.toString(), 110, y, { align: "center" })
        pdf.text(`NGN${item.price.toLocaleString()}`, 145, y, { align: "center" })
        pdf.setFont("helvetica", "bold")
        pdf.text(`NGN${item.subtotal.toLocaleString()}`, 185, y, { align: "right" })
        pdf.setFont("helvetica", "normal")
        y += 5
        pdf.line(20, y, 190, y)
        y += 8
      })

      y += 8

      // Summary section
      const summaryX = 120
      pdf.setFontSize(9)
      pdf.setTextColor(100)
      pdf.setFont("helvetica", "normal")

      const amountPaid = receipt.amountPaid ?? receipt.total
      const balance = receipt.balance ?? 0
      const totalDebt = receipt.totalDebt || 0
      const previousDebt = receipt.previousDebt ?? Math.max(0, totalDebt - balance)

      pdf.text("SUBTOTAL:", summaryX, y)
      pdf.setTextColor(0)
      pdf.setFont("helvetica", "bold")
      pdf.text(`NGN${receipt.total.toLocaleString()}`, 185, y, { align: "right" })
      y += 8

      if (totalDebt > 0 && previousDebt > 0) {
        pdf.setTextColor(220, 38, 38)
        pdf.setFont("helvetica", "normal")
        pdf.text("PREVIOUS DEBT:", summaryX, y)
        pdf.setFont("helvetica", "bold")
        pdf.text(`NGN${previousDebt.toLocaleString()}`, 185, y, { align: "right" })
        y += 8
      }

      pdf.setTextColor(100)
      pdf.setFont("helvetica", "normal")
      pdf.text("DISCOUNT:", summaryX, y)
      pdf.setTextColor(0)
      pdf.setFont("helvetica", "bold")
      pdf.text("NGN0.00", 185, y, { align: "right" })
      y += 8

      pdf.setTextColor(100)
      pdf.setFont("helvetica", "normal")
      pdf.text("AMOUNT PAID:", summaryX, y)
      pdf.setTextColor(0)
      pdf.setFont("helvetica", "bold")
      pdf.text(`NGN${amountPaid.toLocaleString()}`, 185, y, { align: "right" })
      y += 8

      if (totalDebt > 0) {
        pdf.setTextColor(220, 38, 38)
        pdf.setFont("helvetica", "bold")
        pdf.text("TOTAL DEBT:", summaryX, y)
        pdf.text(`NGN${totalDebt.toLocaleString()}`, 185, y, { align: "right" })
        y += 5
      }

      pdf.setDrawColor(150)
      pdf.setLineWidth(0.5)
      pdf.line(summaryX, y, 190, y)
      y += 8

      pdf.setFontSize(11)
      pdf.setTextColor(0)
      pdf.setFont("helvetica", "bold")
      pdf.text("Total Due:", summaryX, y)
      pdf.text(`NGN${balance.toLocaleString()}`, 185, y, { align: "right" })

      y += 15

      // Footer
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "italic")
      pdf.setTextColor(100)
      pdf.text(`Sold by ${receipt.soldBy}`, 105, y, { align: "center" })
      y += 4
      pdf.setFont("helvetica", "normal")
      pdf.text("Thank you for your purchase!", 105, y, { align: "center" })

      pdf.save(`receipt-${saleId}.pdf`)
      toast.success("Receipt downloaded!")
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

  if (!receipt) {
    return null
  }

  const amountPaid = receipt.amountPaid ?? receipt.total
  const balance = receipt.balance ?? 0
  const totalDebt = receipt.totalDebt || 0
  const previousDebt =
    receipt.previousDebt ?? Math.max(0, totalDebt - balance)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate("/pos")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to POS
      </Button>

      {/* Receipt Display */}
      <Card className="p-8 bg-white print:shadow-none border-2">
        {/* Header Section */}
        <div className="border-b-4 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-4">RECEIPT</h1>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Company Info */}
            <div className="text-sm space-y-1">
              <p className="font-bold">BUSINESS ACCOUNTING SOFTWARE NIG.LTD</p>
              <p>08135672304</p>
              <p>09161083039</p>
            </div>
            
            {/* Right Column - Receipt Details */}
            <div className="text-right text-sm space-y-2">
              <div className="bg-gray-100 px-3 py-2 inline-block">
                <p className="text-xs text-gray-600">DATE</p>
                <p className="font-medium">
                  {new Date(receipt.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-gray-100 px-3 py-2 inline-block mt-2">
                <p className="text-xs text-gray-600">RECEIPT #</p>
                <p className="font-medium">{saleId?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-6 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold text-gray-600 mb-2">BILL TO</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">{receipt.customerName || "Walk-in Customer"}</p>
              <p className="text-gray-600">{receipt.customerName ? "Customer" : ""}</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold text-gray-600 mb-2">SITE / LOCATION</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">{receipt.store}</p>
              <p className="text-gray-600">Store</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100 border-y-2 border-blue-300">
                <th className="text-left p-2 text-xs font-bold">DESCRIPTION</th>
                <th className="text-center p-2 text-xs font-bold">QTY / HR</th>
                <th className="text-right p-2 text-xs font-bold">UNIT PRICE / RATE</th>
                <th className="text-right p-2 text-xs font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="p-2 text-sm">{item.name}</td>
                  <td className="p-2 text-sm text-center">{item.quantity}</td>
                  <td className="p-2 text-sm text-right">NGN{item.price.toLocaleString()}</td>
                  <td className="p-2 text-sm text-right font-medium">NGN{item.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between pb-2">
              <span className="text-gray-600">SUBTOTAL:</span>
              <span className="font-medium">NGN{receipt.total.toLocaleString()}</span>
            </div>
            
            {totalDebt > 0 && previousDebt > 0 && (
              <div className="flex justify-between pb-2 text-red-600">
                <span>PREVIOUS DEBT:</span>
                <span className="font-medium">NGN{previousDebt.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between pb-2">
              <span className="text-gray-600">DISCOUNT:</span>
              <span className="font-medium">NGN0.00</span>
            </div>
            
            {/* <div className="flex justify-between pb-2">
              <span className="text-gray-600">TAX RATE:</span>
              <span className="font-medium">0.00%</span>
            </div>
            
            <div className="flex justify-between pb-2">
              <span className="text-gray-600">TAX:</span>
              <span className="font-medium">NGN0.00</span>
            </div> */}
            
            <div className="flex justify-between pb-2">
              <span className="text-gray-600">AMOUNT PAID:</span>
              <span className="font-medium">NGN{amountPaid.toLocaleString()}</span>
            </div>
            
            {totalDebt > 0 && (
              <div className="flex justify-between pb-2 text-red-600">
                <span className="font-bold">TOTAL DEBT:</span>
                <span className="font-bold">NGN{totalDebt.toLocaleString()}</span>
              </div>
            )}
            
            <div className="border-t-2 border-gray-300 pt-2 flex justify-between">
              <span className="font-bold text-base">Total Due:</span>
              <span className="font-bold text-base">NGN{balance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 space-y-1">
          <p className="italic">Sold by {receipt.soldBy}</p>
          <p>Thank you for your purchase!</p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 print:hidden">
        <Button
          onClick={handlePrint}
          className="bg-[#6f4e37] hover:bg-[#5c402d]"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>

        <Button
          onClick={handleDownloadPDF}
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







// import { useEffect, useState, useCallback } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import { api } from "../../lib/api"
// import { Button } from "../../components/ui/button"
// import { Card } from "../../components/ui/card"
// import { Loader2, Printer, Download, ArrowLeft } from "lucide-react"
// import { toast } from "sonner"

// export default function Receipt() {
//   const { saleId } = useParams()
//   const navigate = useNavigate()
//   const [receipt, setReceipt] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [downloading, setDownloading] = useState(false)

//   const fetchReceipt = useCallback(async () => {
//     try {
//       setLoading(true)
//       const res = await api.get(`/pos/receipt/${saleId}`)
//       setReceipt(res.data)
//     } catch (err) {
//       toast.error("Failed to load receipt")
//       navigate("/pos", { replace: true })
//     } finally {
//       setLoading(false)
//     }
//   }, [saleId, navigate])

//   useEffect(() => {
//     fetchReceipt()
//   }, [fetchReceipt])

//   const handlePrint = () => {
//     window.print()
//   }

//   const handleDownloadPDF = async () => {
//     if (downloading) return

//     try {
//       setDownloading(true)

//       const { jsPDF } = await import("jspdf")
//       const pdf = new jsPDF({
//         unit: "mm",
//         format: "a4",
//       })

//       let y = 20

//       // Business Name
//       pdf.setFont("helvetica", "bold")
//       pdf.text("EVERKEL GLOBAL VENTURES NIG.LTD", 105, y, { align: "center"})
//       y += 8

//       // Business Number
//       pdf.setFontSize(12)
//       pdf.setFont("helvetica", "bold")
//       pdf.text("08033967047 ... 08039561895", 105, y, { align: "center" })
//       y += 12

//       // ===== HEADER =====
//       pdf.setFontSize(18)
//       pdf.setFont("helvetica", "bold")
//       pdf.text(receipt.store, 105, y, { align: "center" })

//       y += 8
//       pdf.setFontSize(10)
//       pdf.setFont("helvetica", "normal")
//       pdf.text(
//         new Date(receipt.createdAt).toLocaleString("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         105,
//         y,
//         { align: "center" }
//       )

//       // ✅ Add customer name if available
//       if (receipt.customerName) {
//         y += 6
//         pdf.setFontSize(11)
//         pdf.setFont("helvetica", "bold")
//         pdf.text(`Customer: ${receipt.customerName}`, 105, y, {
//           align: "center",
//         })
//       }

//       y += 6
//       pdf.setDrawColor(0)
//       pdf.line(20, y, 190, y)

//       // ===== ITEMS HEADER =====
//       y += 8
//       pdf.setFontSize(12)
//       pdf.setFont("helvetica", "bold")
//       pdf.text("Items", 20, y)

//       y += 6
//       pdf.setFontSize(9)
//       pdf.setFont("helvetica", "normal")

//       // ===== ITEMS LIST =====
//       receipt.items.forEach((item: any) => {
//         // Item name
//         pdf.setFont("helvetica", "bold")
//         pdf.text(item.name, 20, y)
//         y += 4

//         // Quantity and price
//         pdf.setFont("helvetica", "normal")
//         pdf.text(`${item.quantity} × NGN${item.price.toLocaleString()}`, 20, y)

//         // Subtotal (right-aligned)
//         pdf.setFont("helvetica", "bold")
//         pdf.text(`NGN${item.subtotal.toLocaleString()}`, 190, y - 4, {
//           align: "right",
//         })

//         y += 4
//       })

//       // ===== SEPARATOR =====
//       y += 2
//       pdf.line(20, y, 190, y)
//       y += 6

//       const amountPaid = receipt.amountPaid ?? receipt.total
//       const balance = receipt.balance ?? 0
//       const previousDebt =
//         receipt.previousDebt ??
//         Math.max(0, (receipt.totalDebt || 0) - balance)

//       // ===== TOTALS =====
//       pdf.setFontSize(12)
//       pdf.setFont("helvetica", "bold")
//       pdf.text("Total", 20, y)
//       pdf.text(`NGN${receipt.total.toLocaleString()}`, 190, y, {
//         align: "right",
//       })

//       y += 6
//       pdf.setFontSize(10)
//       pdf.setFont("helvetica", "normal")
//       pdf.text("Amount Paid", 20, y)
//       pdf.text(`NGN${amountPaid.toLocaleString()}`, 190, y, {
//         align: "right",
//       })

//       y += 6
//       pdf.text("Balance", 20, y)
//       pdf.text(`NGN${balance.toLocaleString()}`, 190, y, {
//         align: "right",
//       })

//       y += 6
//       pdf.line(20, y, 190, y)

//       // ===== CUSTOMER DEBT (if any) =====
//       if (receipt.totalDebt > 0) {
//         y += 6
//         pdf.setFontSize(10)
//         pdf.setTextColor(220, 38, 38)
//         pdf.setFont("helvetica", "normal")

//         if (previousDebt > 0) {
//           pdf.text("Previous Debt", 20, y)
//           pdf.text(`NGN${previousDebt.toLocaleString()}`, 190, y, {
//             align: "right",
//           })
//           y += 6
//         }

//         pdf.text("Total Debt", 20, y)
//         pdf.text(`NGN${receipt.totalDebt.toLocaleString()}`, 190, y, {
//           align: "right",
//         })

//         y += 6
//         pdf.setDrawColor(220, 38, 38)
//         pdf.line(20, y, 190, y)
//         pdf.setDrawColor(0)
//         pdf.setTextColor(0)
//       }

//       // ===== BALANCE DUE =====
//       y += 10
//       pdf.setFontSize(14)
//       pdf.setFont("helvetica", "bold")
//       pdf.text("Balance Due", 20, y)
//       pdf.text(`NGN${balance.toLocaleString()}`, 190, y, {
//         align: "right",
//       })

//       y += 4
//       pdf.setLineWidth(0.5)
//       pdf.line(20, y, 190, y)

//       // ===== FOOTER =====
//       y += 12
//       pdf.setFontSize(10)
//       pdf.setFont("helvetica", "italic")
//       pdf.text(`Sold by ${receipt.soldBy}`, 105, y, { align: "center" })

//       y += 8
//       pdf.setTextColor(120)
//       pdf.setFont("helvetica", "normal")
//       pdf.text("Thank you for your purchase!", 105, y, { align: "center" })

//       // Save PDF
//       pdf.save(`receipt-${saleId}.pdf`)
//       toast.success("Receipt downloaded!")
//     } catch (err) {
//       console.error("PDF generation error:", err)
//       toast.error("Failed to generate PDF")
//     } finally {
//       setDownloading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
//       </div>
//     )
//   }

//   if (!receipt) {
//     return null
//   }

//   const amountPaid = receipt.amountPaid ?? receipt.total
//   const balance = receipt.balance ?? 0
//   const totalDebt = receipt.totalDebt || 0
//   const previousDebt =
//     receipt.previousDebt ?? Math.max(0, totalDebt - balance)

//   return (
//     <div className="max-w-md mx-auto p-4 space-y-4">
//       {/* Back Button */}
//       <Button
//         variant="outline"
//         onClick={() => navigate("/pos")}
//         className="mb-4"
//       >
//         <ArrowLeft className="w-4 h-4 mr-2" />
//         Back to POS
//       </Button>

//       {/* Receipt Display */}
//       <Card className="p-6 bg-white print:shadow-none">
//         {/* Business Name */}
//         <p className="text-xs text-center text-muted-foreground italic">
//           EVERKEL GLOBAL VENTURES NIG.LTD
//         </p>
//         <p className="text-xs text-center text-muted-foreground">
//           <strong>
//           08033967047 {" ... "}
//           08039561895
//           </strong>
//         </p>

//         {/* Store Name */}
//         <h1 className="text-center font-bold text-xl mb-2 text-[#3e2f25]">
//           {receipt.store}
//         </h1>

//         {/* Date */}
//         <p className="text-center text-xs text-muted-foreground mb-2">
//           {new Date(receipt.createdAt).toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//         </p>

//         {/* Customer Name */}
//         {receipt.customerName && (
//           <p className="text-center text-sm font-medium mb-3">
//             Customer: <strong>{receipt.customerName}</strong>
//           </p>
//         )}

//         <hr className="my-3" />

//         {/* Items */}
//         <div className="space-y-3">
//           {receipt.items.map((item: any, idx: number) => (
//             <div key={idx} className="flex justify-between items-start">
//               <div className="flex-1">
//                 <p className="font-medium text-sm">{item.name}</p>
//                 <p className="text-xs text-muted-foreground">
//                   {item.quantity} × NGN{item.price.toLocaleString()}
//                 </p>
//               </div>
//               <p className="font-semibold text-sm">
//                 NGN{item.subtotal.toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* <hr className="my-3" /> */}

//         {/* Total
//         <div className="flex justify-between items-center font-bold text-base">
//           <p>Total</p>
//           <p>NGN{receipt.total.toLocaleString()}</p>
//         </div> */}

//         {/* Customer Debt */}
//         {totalDebt > 0 && (
//           <>
//             <hr className="my-3 border-red-200" />
//             {previousDebt > 0 && (
//               <div className="flex justify-between items-center text-sm text-red-600">
//                 <p className="font-medium">Previous Debt</p>
//                 <p className="font-bold">NGN{previousDebt.toLocaleString()}</p>
//               </div>
//             )}
//             <div className="flex justify-between items-center text-sm text-red-600">
//               <p className="font-medium">Total Debt</p>
//               <p className="font-bold">NGN{totalDebt.toLocaleString()}</p>
//             </div>
//           </>
//         )}

//         {/* Totals */}
//         <hr className="my-3 border-2" />
//         <div className="flex justify-between items-center font-bold text-lg">
//           <p>Total</p>
//           <p className="text-[#6f4e37]">NGN{receipt.total.toLocaleString()}</p>
//         </div>

//         <div className="mt-2 space-y-1 text-sm">
//           <div className="flex justify-between items-center">
//             <p className="text-muted-foreground">Amount Paid</p>
//             <p className="font-medium">NGN{amountPaid.toLocaleString()}</p>
//           </div>
//           <div className="flex justify-between items-center">
//             <p className="text-muted-foreground">Balance</p>
//             <p className={balance > 0 ? "font-medium text-red-600" : "font-medium"}>
//               NGN{balance.toLocaleString()}
//             </p>
//           </div>
//         </div>

//         <hr className="my-3" />

//         {/* Footer */}
//         <p className="text-xs text-center text-muted-foreground italic">
//           Sold by {receipt.soldBy}
//         </p>
//         <p className="text-xs text-center text-muted-foreground mt-2">
//           Thank you for your purchase!
//         </p>
//       </Card>

//       {/* Action Buttons */}
//       <div className="grid grid-cols-2 gap-3 print:hidden">
//         <Button
//           onClick={handlePrint}
//           className="bg-[#6f4e37] hover:bg-[#5c402d]"
//         >
//           <Printer className="w-4 h-4 mr-2" />
//           Print Receipt
//         </Button>

//         <Button
//           onClick={handleDownloadPDF}
//           disabled={downloading}
//           className="bg-[#6f4e37] hover:bg-[#5c402d]"
//         >
//           {downloading ? (
//             <>
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               Downloading...
//             </>
//           ) : (
//             <>
//               <Download className="w-4 h-4 mr-2" />
//               Download PDF
//             </>
//           )}
//         </Button>
//       </div>

//       {/* Print Styles */}
//       <style>{`
//         @media print {
//           body * {
//             visibility: hidden;
//           }
//           .print\\:shadow-none,
//           .print\\:shadow-none * {
//             visibility: visible;
//           }
//           .print\\:shadow-none {
//             position: absolute;
//             left: 0;
//             top: 0;
//             width: 100%;
//           }
//           @page {
//             margin: 20mm;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }