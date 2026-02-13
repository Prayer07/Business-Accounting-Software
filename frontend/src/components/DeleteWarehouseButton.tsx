import { useState } from "react"
import { api } from "../lib/api"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Loader2, Trash2 } from "lucide-react"

interface Props {
  warehouseId: number
  onDeleted: () => void
}

export default function DeleteWarehouseButton({
  warehouseId,
  onDeleted,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return

    try {
      setIsDeleting(true)
      await api.delete(`/warehouse/${warehouseId}`)
      toast.success("Warehouse deleted successfully")
      onDeleted()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to delete warehouse"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </>
      )}
    </Button>
  )
}