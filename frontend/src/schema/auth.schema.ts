import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  name: z.string().min(2,"Name too short"),
  oldPassword: z.string().min(6, "Password too short"),
  newPassword: z.string().min(6, "Password too short"),
  password: z.string().min(6, "Password too short"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>