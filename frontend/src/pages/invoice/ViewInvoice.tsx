import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { Loader2, FileText, Plus } from "lucide-react"
import { toast } from "sonner"

function createDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ViewInvoice() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/external-invoice")
      setData(res.data)
    } catch (err) {
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const filteredInvoices = data.filter((inv) =>
    inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#f5f1ec] border border-[#e5ddd5] rounded-lg p-4">
        <div>
          <h2 className="text-xl font-semibold text-[#3e2f25]">
            External Invoices
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage invoices for external customers
          </p>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
          <Link to="/create/external-invoice">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No invoices yet</p>
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to="/create/external-invoice">Create Your First Invoice</Link>
          </Button>
        </Card>
      )}

      {/* No Search Results */}
      {filteredInvoices.length === 0 && searchQuery && data.length > 0 && (
        <p className="text-center text-muted-foreground">
          No invoices found for "{searchQuery}"
        </p>
      )}

      {/* Table */}
      <div className="border border-[#e5ddd5] rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f1ec] border-b border-[#e5ddd5]">
              <tr className="text-left text-[#3e2f25]">
                <th className="px-4 py-3 font-medium">Customer Name</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Created By</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b last:border-b-0 hover:bg-[#faf8f6] transition"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`/external-invoice/${inv.id}`}
                      className="text-[#6f4e37] hover:underline"
                    >
                      {inv.customerName}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-xs">{createDate(inv.createdAt)}</td>

                  <td className="px-4 py-3">{inv.createdBy?.fullName || "—"}</td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {inv._count?.items || 0} items
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-[#6f4e37]">
                    ₦{inv.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}