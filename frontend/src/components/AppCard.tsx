import { cn } from "../lib/utils"
import { Card } from "./ui/card"

interface AppCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AppCard({
  title,
  description,
  children,
  className,
}: AppCardProps) {
  return (
    <Card className={cn("p-4 border-[#e5ddd5] space-y-3", className)}>
      {title && (
        <div>
          <h3 className="font-medium text-[#3e2f25]">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </Card>
  )
}