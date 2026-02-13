import { useState, useEffect } from "react"
import { api } from "../../lib/api"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { toast } from "sonner"
import { X, User, Package, Receipt, Loader2 } from "lucide-react"

export default function POS() {
  const [query, setQuery] = useState("")
  const [goods, setGoods] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [price, setPrice] = useState("")
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selling, setSelling] = useState(false)

  const [customerQuery, setCustomerQuery] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "credit">("paid")

  // Search goods with debounce
  useEffect(() => {
    if (!query) {
      setGoods([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        const res = await api.get("/pos/search", {
          params: { q: query },
        })
        setGoods(res.data)
      } catch (err) {
        toast.error("Failed to search products")
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  // Search customers with debounce
  useEffect(() => {
    if (!customerQuery) {
      setCustomers([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/pos/customers/search", {
          params: { q: customerQuery },
        })
        setCustomers(res.data)
      } catch (err) {
        toast.error("Failed to search customers")
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [customerQuery])

  const sell = async () => {
    if (selling) return

    const qty = Number(quantity)
    const unitPrice = Number(price)

    // Validation
    if (!selected) {
      toast.error("Please select a product")
      return
    }

    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    if (!unitPrice || unitPrice <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    if (qty > selected.quantity) {
      toast.error(`Only ${selected.quantity} units available`)
      return
    }

    if (paymentStatus === "credit" && !selectedCustomer) {
      toast.error("Please select a customer for credit sales")
      return
    }

    // Get final customer name
    const finalCustomerName =
      customerName.trim() || selectedCustomer?.fullName || null

    try {
      setSelling(true)

      const res = await api.post("/pos/sell", {
        storeProductId: selected.storeProductId,
        quantity: qty,
        price: unitPrice,
        customerId: selectedCustomer?.id || null,
        customerName: finalCustomerName,
        paymentStatus,
      })

      toast.success("Sale completed successfully!")
      setReceiptId(res.data.saleId)

      // Reset form
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Sale failed"
      toast.error(errorMessage)
    } finally {
      setSelling(false)
    }
  }

  const resetForm = () => {
    setSelected(null)
    setQuantity("1")
    setPrice("")
    setQuery("")
    setGoods([])
    setSelectedCustomer(null)
    setCustomerQuery("")
    setCustomerName("")
    setPaymentStatus("paid")
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Receipt className="w-8 h-8 text-[#6f4e37]" />
        <h1 className="text-2xl font-bold">Point of Sale</h1>
      </div>

      {/* Customer Section */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <User className="w-4 h-4" />
          <span>Customer Details</span>
        </div>

        {/* Manual Customer Name Input */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Customer Name (Optional)
          </label>
          <Input
            placeholder="Enter customer name..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={!!selectedCustomer || selling}
          />
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 border-t" />
          <span>OR</span>
          <div className="flex-1 border-t" />
        </div>

        {/* Search Registered Customer */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Search Registered Customer
          </label>
          <Input
            placeholder="Search by name or phone..."
            value={customerQuery}
            onChange={(e) => setCustomerQuery(e.target.value)}
            disabled={!!selectedCustomer || selling}
          />
        </div>

        {/* Customer Search Results */}
        {customers.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {customers.map((c) => (
              <Card
                key={c.id}
                className="p-3 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => {
                  setSelectedCustomer(c)
                  setCustomerName(c.fullName)
                  setCustomerQuery("")
                  setCustomers([])
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{c.fullName}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  {c.totalDebt > 0 && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                      Owes ₦{c.totalDebt.toLocaleString()}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Selected Customer */}
        {selectedCustomer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  Selected: {selectedCustomer.fullName}
                </p>
                {selectedCustomer.phone && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer.phone}
                  </p>
                )}
                {selectedCustomer.totalDebt > 0 && (
                  <p className="text-xs font-semibold text-red-600">
                    Outstanding Debt: ₦
                    {selectedCustomer.totalDebt.toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={selling}
                onClick={() => {
                  setSelectedCustomer(null)
                  setCustomerName("")
                  setCustomerQuery("")
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Product Search */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Package className="w-4 h-4" />
          <span>Search Product</span>
        </div>

        <Input
          placeholder="Search goods by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={selling}
        />

        {loading && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Searching products...
          </p>
        )}

        {/* Product Search Results */}
        {goods.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {goods.map((g) => (
              <Card
                key={g.storeProductId}
                className="p-3 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => {
                  setSelected(g)
                  setPrice(String(g.price))
                  setQuery("")
                  setGoods([])
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.storeName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#6f4e37]">
                      ₦{g.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {g.quantity}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Selected Product */}
      {selected && (
        <Card className="p-4 space-y-4 border-2 border-[#6f4e37]">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-lg">{selected.name}</p>
              <p className="text-sm text-muted-foreground">
                {selected.storeName} • Available: {selected.quantity}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={selling}
              onClick={() => {
                setSelected(null)
                setQuantity("1")
                setPrice("")
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Quantity</label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={selected.quantity}
                disabled={selling}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Unit Price (₦)</label>
              <Input
                type="number"
                inputMode="numeric"
                step="0.01"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                disabled={selling}
              />
            </div>
          </div>

          {/* Total Display */}
          {quantity && price && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-[#6f4e37]">
                  ₦{(Number(quantity) * Number(price)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={paymentStatus === "paid" ? "default" : "outline"}
                className={
                  paymentStatus === "paid"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                onClick={() => setPaymentStatus("paid")}
                disabled={selling}
              >
                Cash
              </Button>
              <Button
                type="button"
                variant={paymentStatus === "credit" ? "default" : "outline"}
                className={
                  paymentStatus === "credit"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : ""
                }
                onClick={() => setPaymentStatus("credit")}
                disabled={!selectedCustomer || selling}
              >
                Credit
              </Button>
            </div>
            {paymentStatus === "credit" && !selectedCustomer && (
              <p className="text-xs text-red-600">
                * Select a registered customer for credit sales
              </p>
            )}
          </div>

          {/* Sell Button */}
          <Button
            type="button"
            className="w-full bg-[#6f4e37] hover:bg-[#5c402d] h-12 text-lg font-semibold"
            onClick={sell}
            disabled={selling || !quantity || !price}
          >
            {selling ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "COMPLETE SALE"
            )}
          </Button>
        </Card>
      )}

      {/* Receipt Link */}
      {receiptId && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">
                Sale Completed!
              </span>
            </div>

            
            <a href={`/receipt/${receiptId}`}
              className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
            >
              View Receipt →
            </a>
          </div>
        </Card>
      )}
    </div>
  )
}