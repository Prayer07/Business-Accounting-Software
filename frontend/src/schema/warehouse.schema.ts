import { z } from "zod"

export const addWarehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name is required"),
  location: z.string().min(2, "Location is required"),
})

export type AddWarehouseInput = z.infer<typeof addWarehouseSchema>