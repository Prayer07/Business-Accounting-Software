import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  editGoodsSchema,
  type EditGoodsSchema,
} from "../schema/goods.schema"
import { AppDialog } from "./AppDialog"
import { FormField } from "./FormField"
import { AppForm } from "./AppForm"

interface Props {
  goods: any
  onUpdated: (updatedItem: any) => void
}

export default function EditGoodsDialog({ goods, onUpdated }: Props) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditGoodsSchema>({
    resolver: zodResolver(editGoodsSchema),
    mode: "onChange",
    defaultValues: {
      name: goods.name,
      quantity: goods.quantity,
      costPrice: goods.costPrice,
      sellingPrice: goods.sellingPrice,
    },
  })

  // ✅ Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: goods.name,
        quantity: goods.quantity,
        costPrice: goods.costPrice,
        sellingPrice: goods.sellingPrice,
      })
    }
  }, [open, goods, form])

  const onSubmit = async (values: EditGoodsSchema) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      const res = await api.put(`/warehouse/goods/${goods.id}`, values)

      onUpdated(res.data)
      toast.success("Item updated successfully")
      setOpen(false)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to update item"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppDialog
      title="Edit Goods"
      triggerText="Edit"
      open={open}
      onOpenChange={setOpen}
    >
      <AppForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* PRODUCT NAME */}
        <div className="space-y-1">
          <FormField
            placeholder="Product Name"
            disabled={isSubmitting}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* QUANTITY */}
        <div className="space-y-1">
          <FormField
            type="number"
            placeholder="Quantity"
            disabled={isSubmitting}
            {...form.register("quantity", { valueAsNumber: true })}
          />
          {form.formState.errors.quantity && (
            <p className="text-xs text-red-500">
              {form.formState.errors.quantity.message}
            </p>
          )}
        </div>

        {/* COST PRICE */}
        <div className="space-y-1">
          <FormField
            type="number"
            placeholder="Cost Price"
            step="0.01"
            disabled={isSubmitting}
            {...form.register("costPrice", { valueAsNumber: true })}
          />
          {form.formState.errors.costPrice && (
            <p className="text-xs text-red-500">
              {form.formState.errors.costPrice.message}
            </p>
          )}
        </div>

        {/* SELLING PRICE */}
        <div className="space-y-1">
          <FormField
            placeholder="Selling Price"
            step="0.01"
            type="number"
            disabled={isSubmitting}
            {...form.register("sellingPrice", { valueAsNumber: true })}
          />
          {form.formState.errors.sellingPrice && (
            <p className="text-xs text-red-500">
              {form.formState.errors.sellingPrice.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isValid}
          className="w-full bg-[#6f4e37] hover:bg-[#5c402d]"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </AppForm>
    </AppDialog>
  )
}