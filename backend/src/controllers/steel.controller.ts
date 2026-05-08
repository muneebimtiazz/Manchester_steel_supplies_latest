import { Request, Response } from "express";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const FASTAPI_BASE =
  "https://man-steel-api-1.onrender.com";

export const uploadDrawing = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const {
      pipeline_type,
      scale_ratio,
      paper_size,
      dpi,
    } = req.body;

    // 🔥 READ FILE INTO BUFFER (IMPORTANT FIX)
    const fileBuffer = fs.readFileSync(file.path);

    const formData = new FormData();

    formData.append("file", fileBuffer, {
      filename: file.originalname,
      contentType: "application/pdf",
    });

    formData.append(
      "pipeline_type",
      pipeline_type || "detect"
    );

    formData.append(
      "scale_ratio",
      scale_ratio || 50
    );

    formData.append(
      "paper_size",
      paper_size || "A3"
    );

    formData.append("dpi", dpi || 300);

    const response = await axios.post(
      `${FASTAPI_BASE}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },

        timeout: 120000, // 🔥 2 min timeout (IMPORTANT)

        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    // cleanup file
    fs.unlinkSync(file.path);

    return res.json(response.data);
  } catch (err: any) {
    console.log("UPLOAD ERROR:", err.message);

    return res.status(500).json({
      error: err.message,
    });
  }
};

/* --------------------------------------------------
  2. STREAM SSE (REAL-TIME LABELS)
-------------------------------------------------- */
export const streamLabels = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId } = req.params;

    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );
    res.setHeader(
      "Cache-Control",
      "no-cache"
    );
    res.setHeader(
      "Connection",
      "keep-alive"
    );

    const response = await axios({
      method: "GET",
      url: `${FASTAPI_BASE}/stream/${jobId}`,
      responseType: "stream",
    });

    response.data.on("data", (chunk: any) => {
      res.write(chunk);
    });

    response.data.on("end", () => {
      res.write(
        `data: {"type":"complete"}\n\n`
      );
      res.end();
    });

    req.on("close", () => {
      response.data.destroy();
      res.end();
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/* --------------------------------------------------
  3. STOP JOB
-------------------------------------------------- */
export const stopJob = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId } = req.params;

    const response = await axios.post(
      `${FASTAPI_BASE}/job/${jobId}/stop`
    );

    return res.json(response.data);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

/* --------------------------------------------------
  4. FEEDBACK (CORRECTIONS / EXCLUDE AREAS)
-------------------------------------------------- */
export const submitFeedback = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await axios.post(
      `${FASTAPI_BASE}/feedback`,
      req.body
    );

    return res.json(response.data);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

/* --------------------------------------------------
  5. GET PAGE IMAGE (PDF → IMAGE)
-------------------------------------------------- */
export const getPageImage = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId, pageNum } = req.params;

    const { dpi } = req.query;

    const response = await axios.get(
      `${FASTAPI_BASE}/page-image/${jobId}/${pageNum}`,
      {
        params: { dpi: dpi || 150 },
      }
    );

    return res.json(response.data);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

/* --------------------------------------------------
  6. DOWNLOAD LABELED PDF
-------------------------------------------------- */
export const downloadLabeledPdf = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId } = req.params;

    const response = await axios.post(
      `${FASTAPI_BASE}/download-labeled/${jobId}`,
      req.body
    );

    return res.json(response.data);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};