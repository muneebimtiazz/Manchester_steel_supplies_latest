import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { getCorsOptions } from "./config/cors.config";

dotenv.config();

const app = express();

// 1. CORS (USE YOUR CONFIG FILE)
app.use(cors(getCorsOptions()));

// 2. PARSERS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. COOKIES
app.use(cookieParser());

// test
app.get("/", (req, res) => {
  res.send("OK");
});

// routes
app.use("/api/auth", authRoutes);

export default app;