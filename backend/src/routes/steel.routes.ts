import express from "express";
import { upload,stream } from "../controllers/steel.controller";
import { uploadMiddleware } from "../middleware/multer.middleware";

const router = express.Router();

// "file" must match frontend FormData key
router.post("/upload", uploadMiddleware.single("file"), upload);
router.get("/stream/:jobId", stream);

export default router;