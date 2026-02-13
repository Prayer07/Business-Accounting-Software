import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { toast } from "sonner"
import { AppDialog } from "./AppDialog"
import { AppForm } from "./AppForm"
import { FormField } from "./FormField"
import { Button } from "./ui/button"
import {
  addWarehouseSchema,
  type AddWarehouseInput,
} from "../schema/warehouse.schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface Warehouse {
  id: number
  name: string
  location: string
}

interface Props {
  warehouse: Warehouse
  onUpdated: (updatedWarehouse: Warehouse) => void
}

export default function EditWarehouseDialog({ warehouse, onUpdated }: Props) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddWarehouseInput>({
    resolver: zodResolver(addWarehouseSchema),
    mode: "onChange",
    defaultValues: {
      name: warehouse.name,
      location: warehouse.location,
    },
  })

  // ✅ Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: warehouse.name,
        location: warehouse.location,
      })
    }
  }, [open, warehouse, form])

  const onSubmit = async (values: AddWarehouseInput) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      const res = await api.put(`/warehouse/${warehouse.id}`, values)

      onUpdated(res.data)
      toast.success("Warehouse updated successfully")
      setOpen(false)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to update warehouse"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppDialog
      title="Edit Warehouse"
      triggerText="Edit"
      open={open}
      onOpenChange={setOpen}
    >
      <AppForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1">
          <FormField
            placeholder="Warehouse Name"
            disabled={isSubmitting}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Location Field */}
        <div className="space-y-1">
          <FormField
            placeholder="Location"
            disabled={isSubmitting}
            {...form.register("location")}
          />
          {form.formState.errors.location && (
            <p className="text-xs text-red-500">
              {form.formState.errors.location.message}
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