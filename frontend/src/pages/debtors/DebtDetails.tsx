import { useEffect, useState, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Plus } from "lucide-react"

export default function DebtDetails() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<any>(null)
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [processingDebtId, setProcessingDebtId] = useState<number | null>(null)

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/debtors/${customerId}`)
      setCustomer(res.data)
    } catch (err) {
      toast.error("Failed to load customer")
      navigate("/debtors", { replace: true })
    } finally {
      setLoading(false)
    }
  }, [customerId, navigate])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  async function payDebt(debtId: number) {
    const amount = Number(amounts[debtId])

    // Validation
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }

    const debt = customer.debts.find((d: any) => d.id === debtId)
    if (amount > debt.balance) {
      toast.error(`Payment cannot exceed balance of ₦${debt.balance}`)
      return
    }

    try {
      setProcessingDebtId(debtId)
      await api.put(`/debtors/debt/${debtId}/pay`, { amount })
      toast.success("Payment recorded successfully!")
      setAmounts((prev) => ({ ...prev, [debtId]: "" }))
      await fetchCustomer()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to record payment"
      toast.error(errorMessage)
    } finally {
      setProcessingDebtId(null)
    }
  }

  async function clearDebt(debtId: number) {
    if (!confirm("Are you sure you want to clear this debt completely?")) {
      return
    }

    try {
      setProcessingDebtId(debtId)
      await api.put(`/debtors/debt/${debtId}/clear`)
      toast.success("Debt cleared successfully!")
      await fetchCustomer()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to clear debt"
      toast.error(errorMessage)
    } finally {
      setProcessingDebtId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  if (!customer) {
    return null
  }

  const totalDebt = customer.debts.reduce(
    (sum: number, d: any) => sum + d.totalAmount,
    0
  )
  const totalPaid = customer.debts.reduce(
    (sum: number, d: any) => sum + d.amountPaid,
    0
  )
  const totalBalance = customer.debts.reduce(
    (sum: number, d: any) => sum + d.balance,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-[#f5f1ec] border border-[#e5ddd5] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/debtors")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-[#3e2f25]">
              {customer.fullName}
            </h2>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
            {customer.address && (
              <p className="text-xs text-muted-foreground">{customer.address}</p>
            )}
          </div>
        </div>

        <Button
          asChild
          className="bg-[#6f4e37] hover:bg-[#5c402d]"
          size="sm"
        >
          <Link to={`/debtors/add-debt/${customer.id}`}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Debt
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-[#e5ddd5]">
          <p className="text-xs text-muted-foreground mb-1">Total Debt</p>
          <p className="text-xl font-bold text-[#3e2f25]">
            ₦{totalDebt.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-[#e5ddd5]">
          <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
          <p className="text-xl font-bold text-green-600">
            ₦{totalPaid.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-[#e5ddd5]">
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className="text-xl font-bold text-[#6f4e37]">
            ₦{totalBalance.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Empty State */}
      {customer.debts.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No debts recorded yet</p>
          <Button asChild className="bg-[#6f4e37] hover:bg-[#5c402d]">
            <Link to={`/debtors/add-debt/${customer.id}`}>
              Add First Debt
            </Link>
          </Button>
        </Card>
      )}

      {/* Debts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customer.debts.map((d: any) => (
          <Card
            key={d.id}
            className={`p-4 space-y-3 border-[#e5ddd5] ${
              d.isCleared ? "bg-green-50 border-green-200" : "bg-white"
            }`}
          >
            {/* Status Badge */}
            {d.isCleared && (
              <div className="flex justify-end">
                <span className="inline-block text-[10px] px-2 py-1 rounded bg-green-600 text-white font-semibold">
                  CLEARED
                </span>
              </div>
            )}

            {/* Amounts */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="font-medium">₦{d.totalAmount.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Paid</p>
                <p className="font-medium text-green-600">
                  ₦{d.amountPaid.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Balance</p>
                <p className="font-semibold text-[#6f4e37]">
                  ₦{d.balance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Date */}
            <p className="text-xs text-muted-foreground border-t pt-2">
              Created: {new Date(d.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>

            {/* Payment Actions */}
            {!d.isCleared && (
              <>
                <div className="space-y-1">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Payment amount"
                    value={amounts[d.id] || ""}
                    disabled={processingDebtId === d.id}
                    onChange={(e) =>
                      setAmounts((prev) => ({
                        ...prev,
                        [d.id]: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Max: ₦{d.balance.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#6f4e37] hover:bg-[#5c402d]"
                    onClick={() => payDebt(d.id)}
                    disabled={processingDebtId === d.id}
                  >
                    {processingDebtId === d.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Pay"
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                    onClick={() => clearDebt(d.id)}
                    disabled={processingDebtId === d.id}
                  >
                    {processingDebtId === d.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Clear"
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}