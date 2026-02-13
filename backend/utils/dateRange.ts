// utils/dateRange.ts
export function resolveDateRange(period?: string) {
  const now = new Date()

  switch (period) {
    case "today": {
      const from = new Date()
      from.setHours(0, 0, 0, 0)
      return { from, to: now }
    }

    case "yesterday": {
      const from = new Date()
      from.setDate(from.getDate() - 1)
      from.setHours(0, 0, 0, 0)

      const to = new Date(from)
      to.setHours(23, 59, 59, 999)
      return { from, to }
    }

    case "week": {
      const from = new Date()
      from.setDate(from.getDate() - 7)
      return { from, to: now }
    }

    case "month": {
      const from = new Date()
      from.setMonth(from.getMonth() - 1)
      return { from, to: now }
    }

    default:
      return {}
  }
}