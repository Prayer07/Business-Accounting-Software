import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"

type StoreProduct = {
  storeProductId: number
  name: string
  storeName: string
  price: number
  quantity: number
}

type WarehouseProduct = {
  warehouseProductId: number
  name: string
  warehouseName: string
  price: number
  quantity: number
}

export default function Stocks() {
  const [query, setQuery] = useState("")
  const [storeGoods, setStoreGoods] = useState<StoreProduct[]>([])
  const [warehouseGoods, setWarehouseGoods] = useState<WarehouseProduct[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProducts = async (search = "") => {
    try {
      setLoading(true)

      const [storeRes, warehouseRes] = await Promise.all([
        api.get(`/stocks/store/search?q=${search}`),
        api.get(`/stocks/warehouse/search?q=${search}`),
      ])

      setStoreGoods(storeRes.data)
      setWarehouseGoods(warehouseRes.data)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts("")
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(query)
    }, 400)

    return () => clearTimeout(delay)
  }, [query])

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#3E2C23]">
          Stocks
        </h1>

        <Input
          type="text"
          placeholder="Search product by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md border-[#E6DED6] focus-visible:ring-[#6F4E37]"
        />

        {loading && (
          <p className="text-[#6F4E37] animate-pulse">
            Loading inventory...
          </p>
        )}

        {/* WAREHOUSE SECTION */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#6F4E37]">
            Warehouse Products
          </h2>

          {warehouseGoods.length === 0 ? (
            <p className="text-muted-foreground">
              No warehouse products found
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {warehouseGoods.map((product) => (
                <Card
                  key={product.warehouseProductId}
                  className="p-4 border-[#E6DED6] hover:bg-[#F3ECE6] transition"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-[#3E2C23]">
                      {product.name}
                    </strong>

                    <Badge className="bg-[#6F4E37] text-white">
                      ₦{product.price.toLocaleString()}
                    </Badge>
                  </div>

                  <div className="text-sm mt-2 text-[#7C5E4A]">
                    Warehouse: {product.warehouseName}
                  </div>

                  <div className="text-sm mt-1">
                    Quantity Left:{" "}
                    <span className="font-semibold text-[#3E2C23]">
                      {product.quantity}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* STORE SECTION */}
        <div className="space-y-4 pt-6 border-t border-[#E6DED6]">
          <h2 className="text-xl font-semibold text-[#6F4E37]">
            Store Products
          </h2>

          {storeGoods.length === 0 ? (
            <p className="text-muted-foreground">
              No store products found
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {storeGoods.map((product) => (
                <Card
                  key={product.storeProductId}
                  className="p-4 border-[#E6DED6] hover:bg-[#F3ECE6] transition"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-[#3E2C23]">
                      {product.name}
                    </strong>

                    <Badge className="bg-[#6F4E37] text-white">
                      ₦{product.price.toLocaleString()}
                    </Badge>
                  </div>

                  <div className="text-sm mt-2 text-[#7C5E4A]">
                    Store: {product.storeName}
                  </div>

                  <div className="text-sm mt-1">
                    Quantity Left:{" "}
                    <span className="font-semibold text-[#3E2C23]">
                      {product.quantity}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}