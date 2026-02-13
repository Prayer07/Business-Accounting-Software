import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Loader2, Trash2 } from "lucide-react"

interface Client {
  id: number
  fullName: string
  email: string
  role: string
  createdAt: string
}

export default function ViewClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/auth/clients")
      setClients(res.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to load cashiers"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const deleteClient = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      setDeletingId(id)
      await api.delete(`/auth/clients/${id}`)
      toast.success("Cashier deleted successfully")
      setClients((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to delete cashier"
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6f4e37]" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cashiers</h1>
        <p className="text-sm text-muted-foreground">
          Total: {clients.length}
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f1ec]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No cashiers found
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{client.fullName}</td>
                    <td className="px-4 py-3">{client.email}</td>
                    <td className="px-4 py-3">
                      {new Date(client.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteClient(client.id, client.fullName)}
                        disabled={deletingId === client.id}
                      >
                        {deletingId === client.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}