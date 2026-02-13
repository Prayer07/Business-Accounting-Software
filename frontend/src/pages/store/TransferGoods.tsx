import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { api } from "../../lib/api"
import { Loader2 } from "lucide-react"
import {
  type TransferGoodsInput,
  transferGoodsSchema,
} from "../../schema/store.schema"

export default function TransferGoods() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [goodsSearch, setGoodsSearch] = useState("")
  const [storeSearch, setStoreSearch] = useState("")

  const [showGoodsList, setShowGoodsList] = useState(false)
  const [showStoreList, setShowStoreList] = useState(false)
  const [selectedGoods, setSelectedGoods] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TransferGoodsInput>({
    resolver: zodResolver(transferGoodsSchema),
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehouseRes, storeRes] = await Promise.all([
          api.get("/warehouse"),
          api.get("/store"),
        ])
        setWarehouses(warehouseRes.data)
        setStores(storeRes.data)
      } catch (err) {
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredGoods = useMemo(() => {
    return warehouses.flatMap((w) =>
      w.goods
        .filter(
          (g: any) =>
            g.quantity > 0 &&
            `${w.name} ${g.name}`
              .toLowerCase()
              .includes(goodsSearch.toLowerCase())
        )
        .map((g: any) => ({
          ...g,
          warehouseName: w.name,
        }))
    )
  }, [warehouses, goodsSearch])

  const filteredStores = useMemo(() => {
    return stores.filter((s) =>
      s.name.toLowerCase().includes(storeSearch.toLowerCase())
    )
  }, [stores, storeSearch])

  async function onSubmit(data: TransferGoodsInput) {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.post("/store/transfer", data)
      toast.success("Goods transferred successfully!")
      navigate("/transfer-history", { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Transfer failed"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-xl bg-white border border-[#e5ddd5] rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#3e2f25]">
            Transfer Goods
          </h2>
          <p className="text-sm text-muted-foreground">
            Move goods from warehouse to store
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Search Warehouse Goods */}
          <div className="relative">
            <label className="text-sm font-medium text-[#3e2f25] mb-1 block">
              Select Product from Warehouse
            </label>
            <Input
              placeholder="Search warehouse goods..."
              value={goodsSearch}
              disabled={isSubmitting}
              onChange={(e) => {
                setGoodsSearch(e.target.value)
                setShowGoodsList(true)
              }}
              onFocus={() => setShowGoodsList(true)}
            />

            {showGoodsList && filteredGoods.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                {filteredGoods.map((g) => (
                  <div
                    key={g.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                    onClick={() => {
                      setValue("warehouseProductId", g.id)
                      setGoodsSearch(`${g.warehouseName} — ${g.name}`)
                      setSelectedGoods(g)
                      setShowGoodsList(false)
                    }}
                  >
                    <p className="text-sm font-medium">
                      {g.warehouseName} — {g.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Available: {g.quantity} • Selling Price: ₦
                      {g.sellingPrice.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {errors.warehouseProductId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.warehouseProductId.message}
              </p>
            )}
          </div>

          {/* Selected Goods Info */}
          {selectedGoods && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <p className="text-sm font-medium">Selected Product</p>
              <p className="text-xs text-muted-foreground">
                {selectedGoods.name} • Available: {selectedGoods.quantity} units
              </p>
            </Card>
          )}

          {/* Search Store */}
          <div className="relative">
            <label className="text-sm font-medium text-[#3e2f25] mb-1 block">
              Select Destination Store
            </label>
            <Input
              placeholder="Search store..."
              value={storeSearch}
              disabled={isSubmitting}
              onChange={(e) => {
                setStoreSearch(e.target.value)
                setShowStoreList(true)
              }}
              onFocus={() => setShowStoreList(true)}
            />

            {showStoreList && filteredStores.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                {filteredStores.map((s) => (
                  <div
                    key={s.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                    onClick={() => {
                      setValue("storeId", s.id)
                      setStoreSearch(`${s.name} (${s.location})`)
                      setShowStoreList(false)
                    }}
                  >
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </div>
                ))}
              </div>
            )}

            {errors.storeId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.storeId.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-[#3e2f25] mb-1 block">
              Quantity to Transfer
            </label>
            <Input
              type="number"
              placeholder="Enter quantity"
              disabled={isSubmitting}
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1">
                {errors.quantity.message}
              </p>
            )}
            {selectedGoods && (
              <p className="text-xs text-muted-foreground mt-1">
                Max available: {selectedGoods.quantity}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium text-[#3e2f25] mb-1 block">
              Selling Price per Unit
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter price"
              disabled={isSubmitting}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
            )}
            {selectedGoods && (
              <p className="text-xs text-muted-foreground mt-1">
                Suggested: ₦{selectedGoods.sellingPrice.toLocaleString()}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#6f4e37] hover:bg-[#5c402d]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer Goods"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}