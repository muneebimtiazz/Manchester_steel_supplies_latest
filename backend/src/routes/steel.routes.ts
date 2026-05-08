import express from "express";
import { upload } from "../middleware/multer.middleware";

import {
  uploadDrawing,
  streamLabels,
  stopJob,
  submitFeedback,
  getPageImage,
  downloadLabeledPdf,
} from "../controllers/steel.controller";

const router = express.Router();

// Upload PDF
router.post(
  "/upload",
  upload.single("file"),
  uploadDrawing
);

// SSE stream
router.get(
  "/stream/:jobId",
  streamLabels
);

// Stop job
router.post(
  "/job/:jobId/stop",
  stopJob
);

// Feedback
router.post("/feedback", submitFeedback);

// Page image
router.get(
  "/page-image/:jobId/:pageNum",
  getPageImage
);

// Download PDF
router.post(
  "/download/:jobId",
  downloadLabeledPdf
);

export default router;