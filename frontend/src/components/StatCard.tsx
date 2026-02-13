import { Card, CardContent } from "./ui/card"

interface StatCardProps {
  label: string
  value: number
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="border-[#e5ddd5] bg-[#f5f1ec]">
      <CardContent className="p-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-[#3e2f25]">{value}</p>
      </CardContent>
    </Card>
  )
}