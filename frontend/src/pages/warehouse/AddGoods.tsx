import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { useNavigate } from "react-router-dom"
import { addGoodsSchema, type AddGoodsInput } from "../../schema/goods.schema"
import { Loader2 } from "lucide-react"

interface Warehouse {
  id: number
  name: string
  location: string
}

export default function AddGoods() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loadingWarehouses, setLoadingWarehouses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AddGoodsInput>({
    resolver: zodResolver(addGoodsSchema),
  })

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await api.get("/warehouse")
        setWarehouses(res.data)
      } catch (err) {
        toast.error("Failed to load warehouses")
      } finally {
        setLoadingWarehouses(false)
      }
    }

    fetchWarehouses()
  }, [])

  const onSubmit = async (data: AddGoodsInput) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.post("/warehouse/goods", data)
      toast.success("Goods added successfully!")
      reset()
      navigate("/warehouse", { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to add goods"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-md p-6 border-[#e5ddd5]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold text-[#3e2f25]">Add Goods</h2>

        {/* Product name */}
        <div className="space-y-1">
          <Input
            placeholder="Product name"
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <Input
            type="number"
            placeholder="Quantity"
            disabled={isSubmitting}
            {...register("quantity", { valueAsNumber: true })}
          />
          {errors.quantity && (
            <p className="text-xs text-red-500">{errors.quantity.message}</p>
          )}
        </div>

        {/* Cost price */}
        <div className="space-y-1">
          <Input
            type="number"
            step="0.01"
            placeholder="Cost price"
            disabled={isSubmitting}
            {...register("costPrice", { valueAsNumber: true })}
          />
          {errors.costPrice && (
            <p className="text-xs text-red-500">{errors.costPrice.message}</p>
          )}
        </div>

        {/* Selling price */}
        <div className="space-y-1">
          <Input
            type="number"
            step="0.01"
            placeholder="Selling price"
            disabled={isSubmitting}
            {...register("sellingPrice", { valueAsNumber: true })}
          />
          {errors.sellingPrice && (
            <p className="text-xs text-red-500">{errors.sellingPrice.message}</p>
          )}
        </div>

        {/* Warehouse */}
        <div className="space-y-1">
          {loadingWarehouses ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading warehouses...
            </div>
          ) : (
            <select
              className="w-full border rounded px-3 py-2 disabled:opacity-50"
              disabled={isSubmitting || warehouses.length === 0}
              onChange={(e) => setValue("warehouseId", Number(e.target.value))}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} - {w.location}
                </option>
              ))}
            </select>
          )}

          {errors.warehouseId && (
            <p className="text-xs text-red-500">{errors.warehouseId.message}</p>
          )}

          {!loadingWarehouses && warehouses.length === 0 && (
            <p className="text-xs text-amber-600">
              No warehouses available. Please create one first.
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || warehouses.length === 0}
          className="w-full bg-[#6f4e37] hover:bg-[#5c402d]"
        >
          {isSubmitting ? "Adding..." : "Add Goods"}
        </Button>
      </form>
    </Card>
  )
}