import { useRef } from "react";
import { uploadDrawing } from "../api/steel.api";

interface Props {
  uploadIcon?: string;
  backgroundImage?: string;
  onSuccess?: (jobId: string) => void;
}

export default function PdfUploadTrigger({
  uploadIcon,
  backgroundImage,
  onSuccess,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const res = await uploadDrawing(file);
      const jobId = res?.job_id;

      if (jobId && onSuccess) {
        onSuccess(jobId);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <>
      {/* hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* clickable upload area (NO UI CHANGE) */}
      <div
        className="h-full flex items-center justify-center bg-gray-100 cursor-pointer"
        style={
          backgroundImage
            ? { backgroundImage: `url(${backgroundImage})` }
            : undefined
        }
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadIcon && <img src={uploadIcon} alt="upload" />}
      </div>
    </>
  );
}