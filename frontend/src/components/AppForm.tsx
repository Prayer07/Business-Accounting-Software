interface AppFormProps {
  onSubmit: () => void
  children: React.ReactNode
  className?: string
}

export function AppForm({ onSubmit, children }: AppFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {children}
    </form>
  )
}