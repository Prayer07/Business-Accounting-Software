import { z } from "zod"

export const addStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  location: z.string().min(1, "Location is required"),
})
export type AddStoreInput = z.infer<typeof addStoreSchema>


export const transferGoodsSchema = z.object({
  warehouseProductId: z
  .number(),

  storeId: z
  .number(),

  quantity: z
  .number()
  .min(1, "Quantity must be at least 1"),

  price: z
  .number()
  .min(1, "Price cant b smaller than 0")
})
export type TransferGoodsInput = z.infer<typeof transferGoodsSchema>