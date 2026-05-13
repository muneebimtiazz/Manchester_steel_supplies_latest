import { CorsOptions } from "cors";

export const getCorsOptions = (): CorsOptions => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://manchester-steel-web.vercel.app"
  ];

  return {
    origin: (origin, callback) => {
      // allow mobile apps, postman, server-to-server
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };
};