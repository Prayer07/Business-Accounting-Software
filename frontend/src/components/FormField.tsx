import { Input } from "./ui/input";


export function FormField({
  error,
  ...props
}: any) {
  return (
    <div className="space-y-1">
      <Input {...props} />
      {error && (
        <p className="text-xs text-red-500">
          {error.message}
        </p>
      )}
    </div>
  )
}