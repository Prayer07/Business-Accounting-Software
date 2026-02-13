import { useState } from "react"
import { api } from "../lib/api"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Loader2, Trash2 } from "lucide-react"

interface Props {
  goodsId: number
  onDeleted: () => void
}

export default function DeleteGoodsButton({ goodsId, onDeleted }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      setIsDeleting(true)
      await api.delete(`/warehouse/goods/${goodsId}`)
      toast.success("Item deleted successfully")
      onDeleted()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to delete item"
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