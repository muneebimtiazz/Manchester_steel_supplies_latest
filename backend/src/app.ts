import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { getCorsOptions } from "./config/cors_config";
import authRoutes from "./routes/auth.routes"

dotenv.config();

const app = express();

// middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// cors
app.use(cors(getCorsOptions()));

// test route
app.get("/", (req, res) => {
  res.send("Test Route Working Great 😁");
});

// routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

export default app;