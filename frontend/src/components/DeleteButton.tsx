import { toast } from "sonner"
import { Button } from "./ui/button"

interface DeleteButtonProps {
  onDelete: () => Promise<void>
  confirmText?: string
}

export function DeleteButton({
  onDelete,
  confirmText = "Are you sure?",
}: DeleteButtonProps) {
  return (
    <Button
      variant="destructive"
      onClick={async () => {
        if (!confirm(confirmText)) return
        await onDelete()
        toast.success("Deleted successfully")
      }}
    >
      Delete
    </Button>
  )
}