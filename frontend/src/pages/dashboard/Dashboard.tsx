import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import StatCard from "../../components/StatCard"

type DashboardStats = {
  warehouses: number
  stores: number
  storeProducts: number
  debtors: number
  outstandingDebt: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/dashboard")
      .then(res => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) 
    return <p style={{
      height:"100dvh", 
      display:"flex", 
      justifyContent:"center", 
      alignItems:"center",
      color:"#3e2f25"
    }}>Loading...</p>

  if (!stats) {
    return <p className="text-red-500">Failed to load dashboard</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#3e2f25]">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Warehouses" value={stats.warehouses} />
        <StatCard label="Stores" value={stats.stores} />
        <StatCard label="Products" value={stats.storeProducts} />
        <StatCard label="Debtors" value={stats.debtors} />
        <StatCard label="Debts" value={stats.outstandingDebt} />
        {/* <StatCard label="Today's Sales" value={stats.todaySales} /> */}
      </div>
    </div>
  )
}