// pages/SalesReport.tsx
import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { api } from "../../lib/api"
import { generateSalesPDF } from "../../utils/generateSalesPDF"

export default function SalesReport() {
  const [sales, setSales] = useState<any[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [period, setPeriod] = useState("today")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [loading, setLoading] = useState(false)

  async function fetchSales(params: any) {
    setLoading(true)
    const res = await api.get("/sales", { params })
    setSales(res.data.sales)
    setTotalRevenue(res.data.totalRevenue)
    setLoading(false)
  }

  useEffect(() => {
    fetchSales({ period })
  }, [period])

  function applyCustomRange() {
    fetchSales({ from, to })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-[#FAF7F2]">
      <h1 className="text-2xl font-bold text-[#3E2C23]">
        Sales Report
      </h1>

      {/* FILTERS */}
      <Card className="p-4 flex gap-2 flex-wrap bg-white border-[#E6DED6]">
        {["today", "yesterday", "week", "month"].map(p => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            onClick={() => setPeriod(p)}
            className={
              period === p
                ? "bg-[#6F4E37] text-white hover:bg-[#5c3f2c]"
                : "border-[#E6DED6] text-[#3E2C23] hover:bg-[#FAF7F2]"
            }
          >
            {p.toUpperCase()}
          </Button>
        ))}
      </Card>

      {/* CUSTOM RANGE */}
      <Card className="p-4 flex gap-2 bg-white border-[#E6DED6]">
        <Input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
        />
        <Input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
        />
        <Button
          onClick={applyCustomRange}
          className="bg-[#6F4E37] text-white hover:bg-[#5c3f2c]"
        >
          Apply
        </Button>
      </Card>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="border-[#E6DED6] text-[#3E2C23] hover:bg-[#FAF7F2]"
        >
          Print
        </Button>

        <Button
          className="bg-[#6F4E37] text-white hover:bg-[#5c3f2c]"
          onClick={() => generateSalesPDF(sales, totalRevenue)}
        >
          Download PDF
        </Button>
      </div>

      {/* SUMMARY */}
      <Card className="p-4 bg-[#EAF5EF] border-[#D1E7DD]">
        <p className="text-sm text-[#065F46]">
          Total Revenue
        </p>
        <p className="text-2xl font-bold text-[#065F46]">
          ₦{totalRevenue.toLocaleString()}
        </p>
      </Card>

      {/* SALES */}
      {loading && (
        <p className="text-sm text-gray-500">
          Loading…
        </p>
      )}

      {sales.map(sale => (
        <Card
          key={sale.id}
          className="p-4 bg-white border-[#E6DED6]"
        >
          <p className="font-medium text-[#3E2C23]">
            {new Date(sale.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Sold by: {sale.soldBy.fullName}
          </p>
          <p className="font-bold text-[#3E2C23]">
            ₦{sale.total}
          </p>
        </Card>
      ))}
    </div>
  )
}









// // pages/SalesReport.tsx
// import { useEffect, useState } from "react"
// import { Button } from "../../components/ui/button"
// import { Card } from "../../components/ui/card"
// import { Input } from "../../components/ui/input"
// import { api } from "../../lib/api"
// import { generateSalesPDF } from "../../utils/generateSalesPDF"

// export default function SalesReport() {
//   const [sales, setSales] = useState<any[]>([])
//   const [totalRevenue, setTotalRevenue] = useState(0)
//   const [period, setPeriod] = useState("today")
//   const [from, setFrom] = useState("")
//   const [to, setTo] = useState("")
//   const [loading, setLoading] = useState(false)

//   async function fetchSales(params: any) {
//     setLoading(true)
//     const res = await api.get("/sales", { params })
//     setSales(res.data.sales)
//     setTotalRevenue(res.data.totalRevenue)
//     setLoading(false)
//   }

//   useEffect(() => {
//     fetchSales({ period })
//   }, [period])

//   function applyCustomRange() {
//     fetchSales({ from, to })
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Sales Report</h1>

//       {/* FILTERS */}
//       <Card className="p-4 flex gap-2 flex-wrap">
//         {["today", "yesterday", "week", "month"].map(p => (
//           <Button
//             key={p}
//             variant={period === p ? "default" : "outline"}
//             onClick={() => setPeriod(p)}
//           >
//             {p.toUpperCase()}
//           </Button>
//         ))}
//       </Card>

//       {/* CUSTOM RANGE */}
//       <Card className="p-4 flex gap-2">
//         <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
//         <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
//         <Button onClick={applyCustomRange}>Apply</Button>
//       </Card>

//       {/* ACTIONS */}
//       <div className="flex gap-2">
//         <Button onClick={() => window.print()}>Print</Button>
//         <Button
//           className="bg-[#6f4e37]"
//           onClick={() => generateSalesPDF(sales, totalRevenue)}
//         >
//           Download PDF
//         </Button>
//       </div>

//       {/* SUMMARY */}
//       <Card className="p-4 bg-green-50">
//         <p>Total Revenue</p>
//         <p className="text-2xl font-bold">
//           ₦{totalRevenue.toLocaleString()}
//         </p>
//       </Card>

//       {/* SALES */}
//       {loading && <p>Loading…</p>}

//       {sales.map(sale => (
//         <Card key={sale.id} className="p-4">
//           <p className="font-medium">
//             {new Date(sale.createdAt).toLocaleString()}
//           </p>
//           <p>Sold by: {sale.soldBy.fullName}</p>
//           <p className="font-bold">₦{sale.total}</p>
//         </Card>
//       ))}
//     </div>
//   )
// }