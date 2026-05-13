import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDb from "./config/db.config";

import authRoutes from "./routes/auth.routes";
import steelRoutes from "./routes/steel.routes";

import { getCorsOptions } from "./config/cors.config";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors(getCorsOptions()));
app.use(cookieParser());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Test Route
app.get("/", (_, res) => {
  res.send("OK");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/steel", steelRoutes);

// 404 Handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start Server
const startServer = async () => {
  try {
    console.log("Trying to connect DB...");

    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
  }
};

startServer();