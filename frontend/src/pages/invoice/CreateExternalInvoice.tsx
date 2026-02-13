import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card } from "../../components/ui/card"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"

export default function CreateExternalInvoice() {
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState([{ name: "", price: "", quantity: "1" }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateItem = (index: number, key: string, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [key]: value }
    setItems(updated)
  }

  const addItem = () => {
    setItems([...items, { name: "", price: "", quantity: "1" }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error("Invoice must have at least one item")
      return
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = Number(item.quantity) || 0
      return sum + price * quantity
    }, 0)
  }

  const validate = () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required")
      return false
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.name.trim()) {
        toast.error(`Item ${i + 1}: Name is required`)
        return false
      }
      if (!item.price || Number(item.price) <= 0) {
        toast.error(`Item ${i + 1}: Valid price is required`)
        return false
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        toast.error(`Item ${i + 1}: Valid quantity is required`)
        return false
      }
    }

    return true
  }

  const submit = async () => {
    if (!validate()) return
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      const payload = {
        customerName: customerName.trim(),
        items: items.map((item) => ({
          name: item.name.trim(),
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
      }

      const res = await api.post("/external-invoice", payload)
      toast.success("Invoice created successfully!")
      navigate(`/external-invoice/${res.data.id}`, { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to create invoice"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#3e2f25]">
          Create External Invoice
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate an invoice for an external customer
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Customer Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer Name</label>
          <Input
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Items</label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <Card key={index} className="p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Product name"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  disabled={isSubmitting}
                />

                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  disabled={isSubmitting}
                />

                <Input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Subtotal */}
              {item.price && item.quantity && (
                <p className="text-sm text-muted-foreground text-right">
                  Subtotal: ₦
                  {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* Total */}
        <div className="bg-[#f5f1ec] p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-[#6f4e37]">
              ₦{calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={submit}
          disabled={isSubmitting}
          className="w-full bg-[#6f4e37] hover:bg-[#5c402d] h-12"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Invoice...
            </>
          ) : (
            "Create Invoice"
          )}
        </Button>
      </Card>
    </div>
  )
}