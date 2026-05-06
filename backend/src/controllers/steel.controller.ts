import { Request, Response } from "express"
import axios from "axios"
import FormData from "form-data"

export const upload = async (req: Request, res: Response) => {
  console.log("STEEL ROUTE HIT")
  try {
    // file from multer
    const file = req.file

    if (!file) {
      return res.status(400).json({
        message: "PDF file is required",
      })
    }

    // fields from frontend
    const {
      paper_size,
      scale_ratio,
      pipeline_type,
      dpi,
    } = req.body

    // ===== create FormData for FastAPI =====
    const formData = new FormData()

    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    })

    formData.append("paper_size", paper_size || "A3")
    formData.append("scale_ratio", scale_ratio || "50")
    formData.append("pipeline_type", pipeline_type || "auto_label")
    formData.append("dpi", dpi || "300")

    // ===== call FastAPI =====
    const response = await axios.post(
      "https://man-steel-api-1.onrender.com/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    )

    // ===== send response back to frontend =====
    return res.status(200).json(response.data)
  } catch (error: any) {
    console.error(
      "Upload error:",
      error?.response?.data || error.message
    )

    return res.status(500).json({
      message: "Upload failed",
      error: error?.response?.data || error.message,
    })
  }
}


export const stream = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  console.log("STEEL ROUTE HIT")

  try {
    // ===== 1. Set SSE headers =====
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // ===== 2. Connect to FastAPI SSE =====
    const response = await axios.get(
      `https://man-steel-api-1.onrender.com/stream/${jobId}`,
      {
        responseType: "stream",
      }
    );

    // ===== 3. Pipe stream chunks =====
    response.data.on("data", (chunk: Buffer) => {
      const data = chunk.toString();

      // Forward exactly as received
      res.write(data);
    });

    // ===== 4. End stream =====
    response.data.on("end", () => {
      res.end();
    });

    // ===== 5. Error handling =====
    response.data.on("error", (err: any) => {
      console.error("Stream error:", err);
      res.end();
    });

    // ===== 6. Handle client disconnect =====
    req.on("close", () => {
      response.data.destroy();
      res.end();
    });

  } catch (error: any) {
    console.error("Controller error:", error?.message);

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Stream failed",
      })}\n\n`
    );

    res.end();
  }
};