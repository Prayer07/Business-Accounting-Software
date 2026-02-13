import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ec]">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#6f4e37] mx-auto" />
        <p className="text-[#3e2f25]">{message}</p>
      </div>
    </div>
  )
}