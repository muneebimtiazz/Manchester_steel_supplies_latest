import api from "./axios";

// Upload PDF
export const uploadDrawing = async (file: File, payload?: any) => {
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

// SSE Stream API
export const streamJob = (jobId: string, onMessage: (data: any) => void) => {
  const eventSource = new EventSource(`/api/steel/stream/${jobId}`);

  eventSource.onmessage = (event) => {
    try {
      let parsed;

      try {
        parsed = JSON.parse(event.data);
      } catch {
        parsed = JSON.parse(event.data.replace(/^live/, ""));
      }

      onMessage(parsed);
    } catch {
      console.log("Stream parse error:", event.data);
    }
  };

  eventSource.onerror = (err) => {
    console.log("SSE connection error:", err);
    eventSource.close();
  };

  return eventSource;
};