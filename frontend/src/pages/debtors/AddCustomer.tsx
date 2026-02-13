import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { Loader2 } from "lucide-react"

// ✅ Validation schema
const customerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().optional(),
})

type CustomerInput = z.infer<typeof customerSchema>

export default function AddCustomer() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
  })

  async function onSubmit(data: CustomerInput) {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.post("/debtors/customer", data)
      toast.success("Customer added successfully!")
      reset()
      navigate("/debtors", { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to add customer"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-6 space-y-4 bg-white border-[#e5ddd5]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#3e2f25]">Add Customer</h2>
          <p className="text-sm text-muted-foreground">
            Register a new customer/debtor
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Input
              placeholder="Full name"
              disabled={isSubmitting}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              placeholder="Phone number"
              disabled={isSubmitting}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              placeholder="Address (optional)"
              disabled={isSubmitting}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#6f4e37] hover:bg-[#5c402d]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Customer...
              </>
            ) : (
              "Add Customer"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}