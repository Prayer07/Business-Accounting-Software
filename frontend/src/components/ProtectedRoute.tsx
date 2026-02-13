import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  roles?: string[]
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f1ec]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#6f4e37] mx-auto" />
          <p className="text-[#3e2f25]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/pos" replace />
  }

  return <Outlet />
}