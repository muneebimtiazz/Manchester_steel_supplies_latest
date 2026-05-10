import express from "express";
import { uploadMiddleware } from "../middleware/multer.middleware";
import { upload } from "../controllers/steel.controller"

const router = express.Router();

router.post("/upload", uploadMiddleware.single("file"), upload);

export default router;