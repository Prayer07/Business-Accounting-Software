interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyText?: string
}

export function DataTable<T>({
  data,
  columns,
  emptyText = "No data found",
}: DataTableProps<T>) {
  return (
    <div className="border border-[#e5ddd5] rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f1ec] border-b border-[#e5ddd5]">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-[#3e2f25]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  {emptyText}
                </td>
              </tr>
            )}

            {data.map((row: any) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0 hover:bg-[#faf8f6]"
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render
                      ? col.render(row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}