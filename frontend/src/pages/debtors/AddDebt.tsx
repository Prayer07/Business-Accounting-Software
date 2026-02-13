import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { Loader2 } from "lucide-react"

// ✅ Validation schema
const debtSchema = z.object({
  totalAmount: z.number().min(1, "Amount must be greater than 0"),
})

type DebtInput = z.infer<typeof debtSchema>

export default function AddDebt() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DebtInput>({
    resolver: zodResolver(debtSchema),
  })

  async function onSubmit(data: DebtInput) {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.post(`/debtors/${customerId}/debt`, {
        totalAmount: data.totalAmount,
      })
      toast.success("Debt added successfully!")
      navigate(`/debtors/${customerId}`, { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to add debt"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-6 space-y-4 bg-white border-[#e5ddd5]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#3e2f25]">Add Debt</h2>
          <p className="text-sm text-muted-foreground">
            Record a new debt for this customer
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Input
              type="number"
              step="0.01"
              placeholder="Total amount"
              disabled={isSubmitting}
              {...register("totalAmount", { valueAsNumber: true })}
            />
            {errors.totalAmount && (
              <p className="text-xs text-red-500">
                {errors.totalAmount.message}
              </p>
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
                Adding Debt...
              </>
            ) : (
              "Add Debt"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}