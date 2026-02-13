import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "../../schema/auth.schema"
import { api } from "../../lib/api"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../context/AuthContext"
import { useState } from "react"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    if (isLoggingIn) return // Prevent double submission

    try {
      setIsLoggingIn(true)
      await api.post("/auth/login", data)
      await login()
      toast.success("Welcome back!")
      
      // ✅ Direct navigation without delay
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Login failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ec] px-4">
      <Card className="w-full max-w-md shadow-lg border border-[#e5ddd5]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3e2f25] text-center">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                placeholder="Email"
                autoComplete="email"
                disabled={isLoggingIn}
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
                className="h-11 border-[#d6cfc7] focus:border-[#6f4e37] focus:ring-[#6f4e37]"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                disabled={isLoggingIn}
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
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}