import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

// ===== CONTROLLER =====
export const upload = async (req: Request, res: Response) => {
  console.log("route HIT")
  try {
    // file from multer
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // fields from frontend
    const { paper_size, scale_ratio, pipeline_type, dpi } = req.body;

    // ===== create FormData for FastAPI =====
    const formData = new FormData();

    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    formData.append("paper_size", paper_size || "A3");
    formData.append("scale_ratio", scale_ratio || "50");
    formData.append("pipeline_type", pipeline_type || "auto_label");
    formData.append("dpi", dpi || "300");

    // ===== call FastAPI =====
    const response = await axios.post(
      "https://man-steel-api-1.onrender.com/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // ===== send response back to frontend =====
    return res.status(200).json(response.data);

  } catch (error: any) {
    console.error("Upload error:", error?.response?.data || error.message);

    return res.status(500).json({
      message: "Upload failed",
      error: error?.response?.data || error.message,
    });
  }
};
