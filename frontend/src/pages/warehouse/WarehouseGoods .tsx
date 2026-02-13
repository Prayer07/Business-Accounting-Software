import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import EditGoodsDialog from "../../components/EditGoodsDialog"
import DeleteGoodsButton from "../../components/DeleteGoodsButton"

export default function WarehouseGoods() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [warehouse, setWarehouse] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  const fetchWarehouse = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/warehouse")
      const found = res.data.find((w: any) => w.id === Number(id))

      if (!found) {
        toast.error("Warehouse not found")
        navigate("/warehouse", { replace: true })
        return
      }

      setWarehouse(found)
    } catch (err) {
      toast.error("Failed to load warehouse")
      navigate("/warehouse", { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchWarehouse()
  }, [fetchWarehouse])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  if (!warehouse) {
    return null
  }

  const filteredGoods = warehouse.goods.filter((g: any) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#f5f1ec] border border-[#e5ddd5] rounded-lg p-4">
        <div>
          <h2 className="text-xl font-semibold text-[#3e2f25]">
            {warehouse.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {warehouse.location}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {warehouse.goods.length} item(s)
          </p>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search goods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {warehouse.goods.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No goods in this warehouse yet
          </p>
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to="/warehouse/add-goods">Add Goods</Link>
          </Button>
        </Card>
      )}

      {filteredGoods.length === 0 && query && (
        <p className="text-muted-foreground text-center">
          No goods found for "{query}"
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGoods.map((g: any) => (
          <Card key={g.id} className="p-4 space-y-3 border-[#e5ddd5]">
            <div>
              <p className="font-medium text-[#3e2f25]">{g.name}</p>
              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                <p>
                  Quantity: <span className="font-medium">{g.quantity}</span>
                </p>
                <p>
                  Cost:{" "}
                  <span className="font-medium">
                    ₦{g.costPrice.toLocaleString()}
                  </span>
                </p>
                <p>
                  Selling:{" "}
                  <span className="font-medium">
                    ₦{g.sellingPrice.toLocaleString()}
                  </span>
                </p>
                <p className="text-xs pt-1">
                  Added: {new Date(g.dateAdded).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <EditGoodsDialog
                goods={g}
                onUpdated={(updatedItem) => {
                  setWarehouse((prev: any) => ({
                    ...prev,
                    goods: prev.goods.map((x: any) =>
                      x.id === updatedItem.id ? updatedItem : x
                    ),
                  }))
                  toast.success("Item updated successfully")
                }}
              />

              <DeleteGoodsButton
                goodsId={g.id}
                onDeleted={() => {
                  setWarehouse((prev: any) => ({
                    ...prev,
                    goods: prev.goods.filter((x: any) => x.id !== g.id),
                  }))
                  toast.success("Item deleted successfully")
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}