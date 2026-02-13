import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { api } from "../../lib/api"
import { type AddStoreInput, addStoreSchema } from "../../schema/store.schema"

export default function AddStore() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddStoreInput>({
    resolver: zodResolver(addStoreSchema),
  })

  async function onSubmit(data: AddStoreInput) {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.post("/store", data)
      toast.success("Store created successfully!")
      reset()
      navigate("/store", { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to create store"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 space-y-6 border-[#e5ddd5]">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[#3e2f25]">
            Add New Store
          </h2>
          <p className="text-sm text-muted-foreground">
            Create a new store location
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Input
              placeholder="Store name"
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              placeholder="Location"
              disabled={isSubmitting}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-red-500">{errors.location.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#6f4e37] hover:bg-[#5c402d]"
          >
            {isSubmitting ? "Creating..." : "Create Store"}
          </Button>
        </form>
      </Card>
    </div>
  )
}