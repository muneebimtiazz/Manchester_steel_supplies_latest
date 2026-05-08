import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

import authRoutes from "./routes/auth.routes"
import steelRoutes from "./routes/steel.routes"
import { getCorsOptions } from "./config/cors.config"

dotenv.config()
const app = express()

app.use(cors(getCorsOptions()))
app.use(express.json({limit: "10mb",}))
app.use(express.urlencoded({ extended: true, limit: "10mb",}))
app.use(cookieParser())

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("OK")
})

// ROUTES
app.use("/api/auth", authRoutes)
app.use("/api/steel", steelRoutes)

export default app