import { useEffect, useMemo, useState, useCallback } from "react"
import { api } from "../../lib/api"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type Transfer = {
  id: number
  productName: string
  quantity: number
  price: number
  createdAt: string
  warehouse: {
    name: string
  }
  store: {
    name: string
  }
  transferredBy: {
    fullName: string
  }
}

export default function TransferHistory() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [warehouseFilter, setWarehouseFilter] = useState("")
  const [storeFilter, setStoreFilter] = useState("")

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/store/transfer-history")
      setTransfers(res.data)
    } catch (err) {
      toast.error("Failed to load transfer history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const matchesSearch = t.productName
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesWarehouse =
        warehouseFilter === "" || t.warehouse.name === warehouseFilter

      const matchesStore = storeFilter === "" || t.store.name === storeFilter

      return matchesSearch && matchesWarehouse && matchesStore
    })
  }, [transfers, search, warehouseFilter, storeFilter])

  const warehouses = useMemo(
    () => [...new Set(transfers.map((t) => t.warehouse.name))],
    [transfers]
  )

  const stores = useMemo(
    () => [...new Set(transfers.map((t) => t.store.name))],
    [transfers]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#3e2f25]">
          Transfer History
        </h1>
        <p className="text-sm text-muted-foreground">
          All goods transferred from warehouses to stores
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
        >
          <option value="">All warehouses</option>
          {warehouses.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
        >
          <option value="">All stores</option>
          {stores.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Card>

      {/* Table */}
      <div className="overflow-x-auto border rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f1ec] text-left">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Quantity</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">From Warehouse</th>
              <th className="p-3 font-medium">To Store</th>
              <th className="p-3 font-medium">Transferred By</th>
              <th className="p-3 font-medium">Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransfers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  No transfers found
                </td>
              </tr>
            )}

            {filteredTransfers.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{t.productName}</td>
                <td className="p-3">{t.quantity}</td>
                <td className="p-3">₦{t.price.toLocaleString()}</td>
                <td className="p-3">{t.warehouse.name}</td>
                <td className="p-3">{t.store.name}</td>
                <td className="p-3">{t.transferredBy.fullName}</td>
                <td className="p-3 text-xs">
                  {new Date(t.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}