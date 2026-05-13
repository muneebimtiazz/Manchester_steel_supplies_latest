import express from "express";
import { uploadMiddleware } from "../middleware/multer.middleware";
import {
  uploadController,
  streamController,
  pageImageController,
  feedbackController,
} from "../controllers/steel.controller";

const router = express.Router();

router.post("/upload", uploadMiddleware.single("file"), uploadController);
router.get("/stream/:jobId", streamController);
router.get("/page-image/:jobId/:pageNum", pageImageController);
router.post("/feedback", feedbackController);

export default router;