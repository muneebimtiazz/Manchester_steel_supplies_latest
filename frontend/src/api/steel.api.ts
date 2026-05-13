import api from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export interface PageMeta {
  page: number;
  width: number;   // PDF points
  height: number;  // PDF points
}

export interface UploadResult {
  job_id: string;
  total_pages: number;
  pages: PageMeta[];
}

export interface LabelEvent {
  type: "label";
  id: string;
  page: number;
  label: string;
  raw_text: string;
  x: number;
  y: number;
  unit_weight: number;
  length_mm: number;
  weight_kg: number;
  source: string;
  color: "blue" | "orange" | "green";
  confidence: number;
  needs_review: boolean;
}

// ── Upload PDF ─────────────────────────────────────────────────────────────
export const uploadDrawing = async (
  file: File,
  payload?: {
    paper_size?: string;
    scale_ratio?: string;
    pipeline_type?: string;
    dpi?: string;
  }
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("paper_size", payload?.paper_size || "A3");
  formData.append("scale_ratio", payload?.scale_ratio || "50");
  formData.append("pipeline_type", payload?.pipeline_type || "auto_label");
  formData.append("dpi", payload?.dpi || "300");

  const res = await api.post("/steel/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ── Page Image URL ─────────────────────────────────────────────────────────
export const getPageImageUrl = (jobId: string, pageNum = 0, dpi = 150): string => {
  return `/api/steel/page-image/${jobId}/${pageNum}?dpi=${dpi}`;
};

// ── SSE Stream ─────────────────────────────────────────────────────────────
export const streamJob = (
  jobId: string,
  onMessage: (data: any) => void
): EventSource => {
  const eventSource = new EventSource(`/api/steel/stream/${jobId}`);

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      onMessage(parsed);
    } catch {
      console.warn("SSE parse error:", event.data);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE connection error:", err);
    eventSource.close();
  };

  return eventSource;
};

// ── Feedback ───────────────────────────────────────────────────────────────
export const sendCorrection = async (payload: {
  original_label: string;
  corrected_label: string;
  page: number;
  x: number;
  y: number;
}) => {
  const res = await api.post("/steel/feedback", { type: "correct", ...payload });
  return res.data;
};

export const sendExclusion = async (payload: {
  page: number;
  x: number;
  y: number;
}) => {
  const res = await api.post("/steel/feedback", { type: "exclude", ...payload });
  return res.data;
};

// ── Download Labeled PDF ───────────────────────────────────────────────────
export const downloadLabeledPdf = async (
  jobId: string,
  labels: LabelEvent[]
): Promise<void> => {
  const res = await api.post(
    `/steel/download-labeled/${jobId}`,
    { labels },
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `labeled_drawing_${jobId.slice(0, 8)}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};