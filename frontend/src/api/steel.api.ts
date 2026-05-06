// steel.api.ts

// -------------------------
// Upload PDF / Drawing API
// -------------------------
import api from "./axios";

// Upload PDF / Drawing API
export const uploadDrawing = async (file: File, payload?: any) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("paper_size", payload?.paper_size || "A3");
    formData.append("scale_ratio", payload?.scale_ratio || "50");
    formData.append("pipeline_type", payload?.pipeline_type || "auto_label");
    formData.append("dpi", payload?.dpi || "300");

    const res = await api.post("/steel/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return res.data;
};


// -------------------------
// SSE Stream API
// -------------------------
export const streamJob = (
    jobId: string,
    onMessage: (data: any) => void
) => {
    const url = `/api/steel/stream/${jobId}`

    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
        try {
            // backend may send:
            // data: {...}
            // or raw text
            const raw = event.data

            let parsed

            try {
                parsed = JSON.parse(raw)
            } catch {
                // fallback if backend sends weird format like: live{...}
                const cleaned = raw.replace(/^live/, "")
                parsed = JSON.parse(cleaned)
            }

            onMessage(parsed)
        } catch (err) {
            console.log("Stream parse error:", event.data)
        }
    }

    eventSource.onerror = (err) => {
        console.log("SSE connection error:", err)
        eventSource.close()
    }

    return eventSource
}