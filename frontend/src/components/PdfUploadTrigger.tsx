import { useRef, useState } from "react";
import { uploadDrawing } from "../api/steel.api";

interface UploadResult {
  job_id: string;
  total_pages: number;
  pages: { page: number; width: number; height: number }[];
}

interface Props {
  uploadIcon?: string;
  backgroundImage?: string;
  onSuccess?: (jobId: string, meta: UploadResult) => void;
}

export default function PdfUploadTrigger({
  uploadIcon,
  backgroundImage,
  onSuccess,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setFileName(file.name);
    try {
      const res: UploadResult = await uploadDrawing(file);
      if (res?.job_id && onSuccess) {
        onSuccess(res.job_id, res);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
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

      <div
        className="h-full flex flex-col items-center justify-center bg-gray-100 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
        style={
          backgroundImage
            ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover" }
            : undefined
        }
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Uploading {fileName}…</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-1">
            {uploadIcon && <img src={uploadIcon} alt="upload" className="opacity-60" />}
            <p className="text-xs text-gray-400">{fileName} — click to replace</p>
          </div>
        ) : (
          uploadIcon && <img src={uploadIcon} alt="upload" />
        )}
      </div>
    </>
  );
}