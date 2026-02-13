import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ViewStoreProducts() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [store, setStore] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/store/${id}/products`)
      setStore(res.data)
    } catch (err) {
      toast.error("Failed to load store")
      navigate("/store", { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchStore()
  }, [fetchStore])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  if (!store) {
    return null
  }

  const filteredGoods = store.products.filter((p: any) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#f5f1ec] border border-[#e5ddd5] rounded-lg p-4">
        <div>
          <h2 className="text-xl font-semibold text-[#3e2f25]">
            {store.name} Stock
          </h2>
          <p className="text-sm text-muted-foreground">{store.location}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {store.products.length} product(s)
          </p>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Empty State */}
      {store.products.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No products in this store yet</p>
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to="/store/transfer">Transfer Goods</Link>
          </Button>
        </Card>
      )}

      {/* No Search Results */}
      {filteredGoods.length === 0 && query && (
        <p className="text-muted-foreground text-center">
          No products found for "{query}"
        </p>
      )}

      {/* Products Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGoods.map((p: any) => (
          <Card key={p.id} className="p-4 space-y-3 border-[#e5ddd5]">
            <div>
              <p className="font-medium text-[#3e2f25]">{p.name}</p>
              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                <p>
                  Quantity: <span className="font-medium">{p.quantity}</span>
                </p>
                <p>
                  Price:{" "}
                  <span className="font-medium">₦{p.price.toLocaleString()}</span>
                </p>
                <p className="text-xs pt-1">
                  Added: {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Optional: Add edit/delete if needed */}
            {/* <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline">Edit</Button>
              <Button size="sm" variant="destructive">Delete</Button>
            </div> */}
          </Card>
        ))}
      </div>
    </div>
  )
}