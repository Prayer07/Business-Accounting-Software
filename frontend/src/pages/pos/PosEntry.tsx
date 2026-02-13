import { Loader2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import PosList from "./PosList"
import PosSuperAdmin from "./PosSuperAdmin"

export default function PosEntry() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  if (user?.role === "SUPERADMIN") {
    return <PosSuperAdmin />
  }

  return <PosList />
}

