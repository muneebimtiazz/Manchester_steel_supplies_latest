import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

const FASTAPI_BASE = process.env.FASTAPI_URL || "https://man-steel-api-1.onrender.com";

// ── Upload ─────────────────────────────────────────────────────────────────
export const uploadController = async (req: Request, res: Response) => {
  console.log("upload route HIT");
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "PDF file is required" });

    const { paper_size, scale_ratio, pipeline_type, dpi } = req.body;

    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    formData.append("paper_size", paper_size || "A3");
    formData.append("scale_ratio", scale_ratio || "50");
    formData.append("pipeline_type", pipeline_type || "auto_label");
    formData.append("dpi", dpi || "300");

    const response = await axios.post(`${FASTAPI_BASE}/upload`, formData, {
      headers: formData.getHeaders(),
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Upload error:", error?.response?.data || error.message);
    return res.status(500).json({
      message: "Upload failed",
      error: error?.response?.data || error.message,
    });
  }
};

// ── SSE Stream ─────────────────────────────────────────────────────────────
export const streamController = async (req: Request, res: Response) => {
  console.log("stream route HIT");
  const { jobId } = req.params;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const response = await axios.get(`${FASTAPI_BASE}/stream/${jobId}`, {
      responseType: "stream",
    });

    response.data.on("data", (chunk: Buffer) => {
      res.write(chunk.toString());
    });

    response.data.on("end", () => res.end());
    response.data.on("error", (err: any) => {
      console.error("Stream error:", err);
      res.end();
    });

    req.on("close", () => {
      response.data.destroy();
      res.end();
    });
  } catch (error: any) {
    console.error("Controller error:", error?.message);
    res.write(`data: ${JSON.stringify({ type: "error", message: "Stream failed" })}\n\n`);
    res.end();
  }
};

// ── Page Image Proxy ───────────────────────────────────────────────────────
export const pageImageController = async (req: Request, res: Response) => {
  const { jobId, pageNum } = req.params;
  const dpi = req.query.dpi || "150";

  try {
    const response = await axios.get(
      `${FASTAPI_BASE}/page-image/${jobId}/${pageNum}?dpi=${dpi}`,
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    response.data.pipe(res);

    response.data.on("error", (err: any) => {
      console.error("Page image stream error:", err);
      res.status(500).end();
    });
  } catch (error: any) {
    console.error("Page image error:", error?.message);
    res.status(500).json({ message: "Failed to fetch page image" });
  }
};

// ── Feedback ───────────────────────────────────────────────────────────────
export const feedbackController = async (req: Request, res: Response) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE}/feedback`, req.body);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Feedback error:", error?.response?.data || error.message);
    return res.status(500).json({ message: "Feedback failed" });
  }
};

// ── Download Labeled PDF ───────────────────────────────────────────────────
export const downloadLabeledPdfController = async (req: Request, res: Response) => {
  const { jobId } = req.params;

  try {
    const response = await axios.post(
      `${FASTAPI_BASE}/download-labeled/${jobId}`,
      req.body,               // { labels: [...] }
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="labeled_drawing_${jobId.slice(0, 8)}.pdf"`
    );

    response.data.pipe(res);

    response.data.on("error", (err: any) => {
      console.error("PDF download stream error:", err);
      res.status(500).end();
    });
  } catch (error: any) {
    console.error("Download labeled PDF error:", error?.response?.data || error.message);
    return res.status(500).json({ message: "PDF generation failed" });
  }
};