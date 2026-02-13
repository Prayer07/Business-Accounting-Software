import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { api } from "../lib/api"

type User = {
  id: number
  email: string
  role: "SUPERADMIN" | "CLIENT"
  fullName: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me")
      setUser(res.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
    }
  }, [])

  const refetchUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}