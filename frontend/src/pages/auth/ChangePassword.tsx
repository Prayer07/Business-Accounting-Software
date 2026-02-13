import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

// ✅ Validation schema
const changePasswordSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Business name must be at least 2 characters"),
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "New password must be different from old password",
  path: ["newPassword"],
})

type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export default function ChangePassword() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(data: ChangePasswordInput) {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await api.put("/auth/change-password", data)
      toast.success("Credentials updated successfully!")
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Update failed"
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
            Update Credentials
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
                placeholder="Business name"
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Old Password"
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                autoComplete="current-password"
                disabled={isSubmitting}
                {...register("oldPassword")}
              />
              {errors.oldPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                placeholder="New Password"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6f4e37] hover:bg-[#5c402d] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Credentials"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}