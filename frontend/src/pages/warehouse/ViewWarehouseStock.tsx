import { useEffect, useState, useCallback } from "react"
import { api } from "../../lib/api"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import EditGoodsDialog from "../../components/EditGoodsDialog"
import DeleteGoodsButton from "../../components/DeleteGoodsButton"
import EditWarehouseDialog from "../../components/EditWarehouseDialog"
import DeleteWarehouseButton from "../../components/DeleteWarehouseButton"

function formatDate(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)

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

function createDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function ViewWarehouseStock() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [warehouseQuery, setWarehouseQuery] = useState("")

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/warehouse")
      setData(res.data)
    } catch (err) {
      toast.error("Failed to load warehouses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWarehouses()
  }, [fetchWarehouses])

  const filteredWarehouses = data.filter(
    (w) =>
      w.name.toLowerCase().includes(warehouseQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(warehouseQuery.toLowerCase())
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
        {/* Left – Title */}
        <div>
          <h2 className="text-xl font-semibold text-[#3e2f25]">
            Warehouse Stock
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage warehouses and goods
          </p>
        </div>

        {/* Middle – Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search by name or location..."
            value={warehouseQuery}
            onChange={(e) => setWarehouseQuery(e.target.value)}
          />
        </div>

        {/* Right – Actions */}
        <div className="flex gap-2">
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to="/warehouse/add">Add Warehouse</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/warehouse/add-goods">Add Goods</Link>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No warehouses yet</p>
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to="/warehouse/add">Create Your First Warehouse</Link>
          </Button>
        </Card>
      )}

      {/* No Search Results */}
      {filteredWarehouses.length === 0 && warehouseQuery && (
        <p className="text-muted-foreground text-center">
          No warehouses found for "{warehouseQuery}"
        </p>
      )}

      {/* Warehouses Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWarehouses.map((w) => (
          <Card key={w.id} className="p-4 border-[#e5ddd5] space-y-3">
            <div>
              <h3 className="font-medium text-[#3e2f25]">{w.name}</h3>
              <p className="text-sm text-muted-foreground">{w.location}</p>
            </div>

            <div className="flex gap-2">
              <EditWarehouseDialog
                warehouse={w}
                onUpdated={(updatedWarehouse) => {
                  setData((prev) =>
                    prev
                      .map((x) => (x.id === w.id ? updatedWarehouse : x))
                      .sort(
                        (a, b) =>
                          new Date(b.updatedAt).getTime() -
                          new Date(a.updatedAt).getTime()
                      )
                  )
                }}
              />

              <DeleteWarehouseButton
                warehouseId={w.id}
                onDeleted={() => {
                  setData((prev) => prev.filter((x) => x.id !== w.id))
                }}
              />
            </div>

            <div className="space-y-1 text-sm">
              {w.goods.length === 0 && (
                <p className="text-muted-foreground">No goods</p>
              )}

              {w.goods.length > 0 && (
                <>
                  {(w.goods.length >= 2 ? [w.goods[0]] : w.goods).map(
                    (g: any) => (
                      <div key={g.id} className="border rounded p-2 text-sm">
                        <p className="font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {g.quantity} • ₦{g.sellingPrice.toLocaleString()}
                        </p>

                        <div className="flex gap-2 mt-2">
                          <EditGoodsDialog
                            goods={g}
                            onUpdated={(updatedItem) => {
                              setData((prev) =>
                                prev
                                  .map((wh) =>
                                    wh.id === updatedItem.warehouseId
                                      ? {
                                          ...wh,
                                          goods: wh.goods.map((item: any) =>
                                            item.id === updatedItem.id
                                              ? updatedItem
                                              : item
                                          ),
                                          updatedAt: new Date().toISOString(),
                                        }
                                      : wh
                                  )
                                  .sort(
                                    (a, b) =>
                                      new Date(b.updatedAt).getTime() -
                                      new Date(a.updatedAt).getTime()
                                  )
                              )
                            }}
                          />

                          <DeleteGoodsButton
                            goodsId={g.id}
                            onDeleted={() => {
                              setData((prev) =>
                                prev.map((wh) =>
                                  wh.id === g.warehouseId
                                    ? {
                                        ...wh,
                                        goods: wh.goods.filter(
                                          (x: any) => x.id !== g.id
                                        ),
                                      }
                                    : wh
                                )
                              )
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}

                  {w.goods.length >= 2 && (
                    <Link
                      to={`/warehouse/${w.id}/goods`}
                      className="text-xs text-[#6f4e37] underline hover:opacity-80 block mt-2"
                    >
                      View all {w.goods.length} goods →
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>Created: {createDate(w.createdAt)}</p>
              <p>{formatDate(w.updatedAt)}</p>

              {w.updatedAt !== w.createdAt && (
                <span className="inline-block text-[10px] px-2 py-[2px] rounded bg-[#f5f1ec] text-[#6f4e37] border border-[#e5ddd5]">
                  Edited
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}