import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import warehouseRoutes from "./routes/warehouse.route.js"
import authRoutes from "./routes/auth.route.js"
import dashboardRoutes from "./routes/dashboard.route.js"
import storeRoutes from "./routes/store.route.js"
import posRoutes from "./routes/pos.routes.js"
import debtorRoutes from "./routes/debtor.route.js"
import invoiceRoutes from "./routes/externalInvoice.route.js"
import pushRoutes from "./routes/push.route.js"
import salesRoutes from "./routes/sales.route.js"
import stockRoutes from "./routes/stocks.route.js"

const app = express()
const PORT = process.env.PORT || 5000

// ✅ Centralized allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://everkel.vercel.app",
  "https://www.everkelglobalventures.com"
]

// ✅ CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      } else {
        return callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
)

// ✅ Middleware
app.use(express.json({ limit: "10mb" })) // Prevent large payloads
app.use(cookieParser())

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// ✅ Routes
app.use("/auth", authRoutes)
app.use("/warehouse", warehouseRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/store", storeRoutes)
app.use("/pos", posRoutes)
app.use("/debtors", debtorRoutes)
app.use("/external-invoice", invoiceRoutes)
app.use("/push", pushRoutes)
app.use("/sales", salesRoutes)
app.use("/stocks", stockRoutes)


// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// ✅ Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error:", err)
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
})