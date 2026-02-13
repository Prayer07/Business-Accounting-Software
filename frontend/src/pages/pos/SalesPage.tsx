import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSales = async () => {
      const res = await api.get("/pos/sales", {
        params: { q: query },
      })
      setSales(res.data)
    }

    const delay = setTimeout(fetchSales, 400)
    return () => clearTimeout(delay)
  }, [query])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-[#FAF7F2] min-h-screen">
      <h2 className="text-2xl font-bold text-[#3E2C23]">
        All Sales
      </h2>

      {/* 🔎 Search */}
      <Input
        placeholder="Search by customer name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border-[#E6DED6] focus-visible:ring-[#6F4E37]"
      />

      {/* SALES LIST */}
      <div className="space-y-3">
        {sales.map((sale) => (
          <Card
            key={sale.id}
            onClick={() => navigate(`/receipt/${sale.id}`)}
            className="p-4 cursor-pointer border-[#E6DED6] hover:bg-[#F3ECE6] transition"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-[#3E2C23]">
                Sale #{sale.id}
              </p>

              <p className="font-bold text-[#6F4E37]">
                ₦{sale.total.toLocaleString()}
              </p>
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              Customer:{" "}
              {sale.customer?.fullName ||
                sale.customerName ||
                "Walk-in"}
            </div>

            <div className="text-sm text-[#7C5E4A]">
              Store: {sale.store.name}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}