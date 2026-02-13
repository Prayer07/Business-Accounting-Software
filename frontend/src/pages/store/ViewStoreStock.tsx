import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Loader2 } from "lucide-react"
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

function formatDate(dateString: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  )

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds)
    if (count >= 1)
      return `Updated ${count} ${i.label}${count > 1 ? "s" : ""} ago`
  }

  return "Updated just now"
}

export default function ViewStoreStock() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [storeQuery, setStoreQuery] = useState("")

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/store")
      setData(res.data)
    } catch (err) {
      toast.error("Failed to load stores")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const filteredStores = data.filter(
    (w) =>
      w.name.toLowerCase().includes(storeQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(storeQuery.toLowerCase())
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
          <h2 className="text-xl font-semibold text-[#3e2f25]">Store Stock</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all stores
          </p>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search by name or location..."
            value={storeQuery}
            onChange={(e) => setStoreQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to="/store/add">Add Store</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/store/transfer">Transfer Goods</Link>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No stores yet</p>
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to="/store/add">Create Your First Store</Link>
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {filteredStores.length === 0 && storeQuery && (
        <p className="text-center text-muted-foreground">
          No stores found for "{storeQuery}"
        </p>
      )}

      {/* Table */}
      <div className="border border-[#e5ddd5] rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f1ec] border-b border-[#e5ddd5]">
              <tr className="text-left text-[#3e2f25]">
                <th className="px-4 py-3 font-medium">Store Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredStores.map((w) => (
                <tr
                  key={w.id}
                  className="border-b last:border-b-0 hover:bg-[#faf8f6] transition"
                >
                  <td className="px-4 py-3 font-medium text-[#3e2f25]">
                    <Link
                      to={`/store/${w.id}`}
                      className="underline hover:text-[#6f4e37]"
                    >
                      {w.name}
                    </Link>
                  </td>

                  <td className="px-4 py-3">{w.location}</td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {w.products?.length || 0} items
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs">
                    {createDate(w.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-xs">{formatDate(w.updatedAt)}</td>

                  <td className="px-4 py-3">
                    {w.updatedAt !== w.createdAt ? (
                      <span className="inline-block text-[11px] px-2 py-[2px] rounded bg-[#f5f1ec] text-[#6f4e37] border border-[#e5ddd5]">
                        Edited
                      </span>
                    ) : (
                      <span className="inline-block text-[11px] px-2 py-[2px] rounded bg-green-50 text-green-700 border border-green-200">
                        New
                      </span>
                    )}
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