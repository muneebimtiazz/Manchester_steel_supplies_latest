import express from "express";
import { uploadMiddleware } from "../middleware/multer.middleware";
import { uploadController,streamController } from "../controllers/steel.controller"

const router = express.Router();

router.post("/upload", uploadMiddleware.single("file"), uploadController );
router.get("/stream/:jobId", streamController);

export default router;