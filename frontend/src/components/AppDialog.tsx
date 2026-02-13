import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"

interface AppDialogProps {
  title: string
  triggerText: string
  children: React.ReactNode
  open?: boolean // ✅ Add this
  onOpenChange?: (open: boolean) => void // ✅ Add this
}

export function AppDialog({
  title,
  triggerText,
  children,
  open,
  onOpenChange,
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}> {/* ✅ Pass props */}
      <DialogTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </DialogTrigger>

      <DialogContent className="bg-[#f5f1ec] border-[#e5ddd5]">
        <DialogHeader>
          <DialogTitle className="text-[#3e2f25]">
            {title}
          </DialogTitle>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  )
}