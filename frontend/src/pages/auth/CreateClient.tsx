import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"

// ✅ Validation schema
const createClientSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type CreateClientInput = z.infer<typeof createClientSchema>

export default function CreateClient() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
  })

  async function onSubmit(data: CreateClientInput) {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.post("/auth/create-client", data)
      toast.success("Cashier created successfully!")
      reset()
      navigate("/cashier", { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to create cashier"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ec] px-4">
      <Card className="w-full max-w-md shadow-lg border border-[#e5ddd5]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3e2f25] text-center">
            Create Cashier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                placeholder="Full name"
                disabled={isSubmitting}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Input
                placeholder="Email"
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                placeholder="Password"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6f4e37] hover:bg-[#5c402d] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Cashier..." : "Create Cashier"}
            </Button>

            <Button
              className="w-full bg-[#6f4e37] hover:bg-[#5c402d] text-white"
              disabled={isSubmitting}
            >
              <Link to={"/cashier"}>
                View Cashier
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}