import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { useNavigate } from "react-router-dom"
import { addWarehouseSchema, type AddWarehouseInput } from "../../schema/warehouse.schema"
import { useState } from "react"

export default function AddWarehouse() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddWarehouseInput>({
    resolver: zodResolver(addWarehouseSchema),
  })

  const onSubmit = async (data: AddWarehouseInput) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.post("/warehouse", data)
      toast.success("Warehouse added successfully!")
      reset()
      navigate("/warehouse", { replace: true })
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Failed to add warehouse"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-md p-6 border-[#e5ddd5]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold text-[#3e2f25]">
          Add Warehouse
        </h2>

        <div>
          <Input
            placeholder="Warehouse name"
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Input
            placeholder="Location"
            disabled={isSubmitting}
            {...register("location")}
          />
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#6f4e37] hover:bg-[#5c402d]"
        >
          {isSubmitting ? "Adding..." : "Add Warehouse"}
        </Button>
      </form>
    </Card>
  )
}