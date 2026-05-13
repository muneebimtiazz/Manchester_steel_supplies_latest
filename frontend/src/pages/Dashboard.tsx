import { useState, useRef, useEffect, useCallback } from "react"

import Navbar from "../components/Navbar"
import PdfUploadTrigger from "../components/PdfUploadTrigger"
import {
  Plus, Minus, SlidersHorizontal, ArrowDownNarrowWide, Ellipsis, X, Pencil,
} from "lucide-react"

import precisionManufacturing from "../assets/precision_manufacturing.png"
import sportsScore from "../assets/sports_score.png"
import weight from "../assets/weight.png"
import inkSelection from "../assets/ink_selection.png"
import excelLogo from "../assets/xls.png"
import pdfLogo from "../assets/pdf.png"
import nearMe from "../assets/near_me.png"
import backHand from "../assets/back_hand.png"
import three60 from "../assets/360.png"
import squareFoot from "../assets/direction.png"
import one from "../assets/364.png"
import two from "../assets/365.png"
import three from "../assets/366.png"
import play from "../assets/play_arrow.png"
import upload from "../assets/Mask_group.png"
import pdflogo from "../assets/Group_35.png"

import {
  streamJob,
  getPageImageUrl,
  sendCorrection,
  downloadLabeledPdf,
  type LabelEvent,
  type UploadResult,
} from "../api/steel.api"

// ── Types ──────────────────────────────────────────────────────────────────
interface DetectedLabel extends LabelEvent {
  detectedAt: string;
}

interface BreakdownRow {
  label: string;
  length: string;
  qty: number;
  tonnage: number;
  status: string;
  color: string;
  /** Representative label event (used for feedback payload) */
  sample: DetectedLabel;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const DOT_COLORS: Record<string, string> = {
  blue: "#438DE7",
  orange: "#F59E0B",
  green: "#22C55E",
};

// ── FeedbackModal ──────────────────────────────────────────────────────────
interface FeedbackModalProps {
  row: BreakdownRow;
  onClose: () => void;
  onSaved: (originalLabel: string, correctedLabel: string) => void;
}

function FeedbackModal({ row, onClose, onSaved }: FeedbackModalProps) {
  const [corrected, setCorrected] = useState(row.label)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const trimmed = corrected.trim()
    if (!trimmed || trimmed === row.label) { onClose(); return }
    setSaving(true)
    setError(null)
    try {
      await sendCorrection({
        original_label: row.label,
        corrected_label: trimmed,
        page: row.sample.page,
        x: row.sample.x,
        y: row.sample.y,
      })
      onSaved(row.label, trimmed)
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save correction.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-800 text-base">Correct Label</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Original */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Original (detected)</p>
          <div
            className="px-3 py-2 rounded-lg text-sm font-mono text-white"
            style={{ background: DOT_COLORS[row.color] || "#438DE7" }}
          >
            {row.label}
          </div>
        </div>

        {/* Correction input */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Corrected label</p>
          <input
            autoFocus
            type="text"
            value={corrected}
            onChange={(e) => setCorrected(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. 254x146x31 UB"
          />
        </div>

        {/* Meta */}
        <div className="text-xs text-gray-400 flex gap-4">
          <span>Qty: <b>{row.qty}</b></span>
          <span>Length: <b>{row.length}</b></span>
          <span>Weight: <b>{row.tonnage.toFixed(2)} kg</b></span>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-[#438DE7] hover:bg-[#2784f7] disabled:opacity-50 text-white rounded-lg flex items-center gap-2"
          >
            {saving && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Save Correction
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const IMAGE_DPI = 150
  const [zoom, setZoom] = useState(62)

  // Upload / job state
  const [jobId, setJobId] = useState<string | null>(null)
  const [pageMeta, setPageMeta] = useState<{ width: number; height: number } | null>(null)
  const [pageImageUrl, setPageImageUrl] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Streaming state
  const [scanning, setScanning] = useState(false)
  const [labels, setLabels] = useState<DetectedLabel[]>([])
  const [liveTonnage, setLiveTonnage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activity, setActivity] = useState<any[]>([])

  // Feedback modal
  const [feedbackRow, setFeedbackRow] = useState<BreakdownRow | null>(null)

  // PDF download state
  const [downloading, setDownloading] = useState(false)

  // true while fetchPageImage is in-flight (after upload, before blob arrives)
  const [fetchingImage, setFetchingImage] = useState(false)
  const streamRef = useRef<EventSource | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  const incr = () => setZoom((a) => Math.min(a + 5, 200))
  const decr = () => setZoom((a) => Math.max(a - 5, 20))

  // ── Fetch page image with retry (handles Render cold-start 502s) ───────────
  const fetchPageImage = async (id: string, retries = 5, delayMs = 2000) => {
    setFetchingImage(true)
    const url = getPageImageUrl(id, 0, IMAGE_DPI)
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        setPageImageUrl(objectUrl)
        setFetchingImage(false)
        return
      } catch (err) {
        console.warn(`Page image attempt ${attempt}/${retries} failed:`, err)
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs))
        } else {
          console.error("Could not load page image after all retries")
          setFetchingImage(false)
        }
      }
    }
  }

  // ── After upload success ─────────────────────────────────────────────────
  const handleUploadSuccess = (id: string, meta: UploadResult) => {
    setJobId(id)
    setLabels([])
    setLiveTonnage(0)
    setProgress(0)
    setActivity([])
    setImageLoaded(false)
    setPageImageUrl(null)

    const page0 = meta.pages[0]
    setPageMeta({ width: page0.width, height: page0.height })

    // Fetch with retry — the server is already warm from the upload request,
    // but a brief pause ensures it finishes writing before we hit /page-image
    fetchPageImage(id)
  }

  // ── Draw dots ────────────────────────────────────────────────────────────
  const drawDots = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !pageMeta || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = img.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // ── Rotation detection ──────────────────────────────────────────────────
    // pageMeta comes from PyMuPDF page.rect (PDF coordinate space).
    // The rasterised image may have been rendered rotated 90° relative to
    // the PDF coordinate space (common when the page has a /Rotate entry).
    // We detect this by comparing aspect ratios:
    //   - PDF landscape (width > height) but image portrait (height > width) → rotated
    //   - PDF portrait (height > width) but image landscape (width > height) → rotated
    const pdfIsLandscape = pageMeta.width > pageMeta.height
    const imgIsLandscape = rect.width > rect.height
    const isRotated = pdfIsLandscape !== imgIsLandscape

    // When rotated 90°, PDF (x, y) maps to image (y, pdfWidth - x) space.
    // We compute effective scale against whichever dimension actually matches.
    const effectivePdfW = isRotated ? pageMeta.height : pageMeta.width
    const effectivePdfH = isRotated ? pageMeta.width  : pageMeta.height

    const scaleX = canvas.width  / effectivePdfW
    const scaleY = canvas.height / effectivePdfH

    labels.forEach((lbl) => {
      // Map PDF point coords → canvas pixel coords, accounting for rotation
      let px: number, py: number
      if (isRotated) {
        // 90° clockwise rotation: new_x = pdf_y, new_y = pdfWidth - pdf_x
        px = lbl.y * scaleX
        py = (pageMeta.width - lbl.x) * scaleY
      } else {
        px = lbl.x * scaleX
        py = lbl.y * scaleY
      }

      const color = DOT_COLORS[lbl.color] || "#438DE7"

      ctx.beginPath()
      ctx.arc(px, py, 8, 0, Math.PI * 2)
      ctx.fillStyle = color + "33"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      ctx.font = "bold 9px monospace"
      ctx.fillStyle = "#1e293b"
      ctx.fillText(lbl.label, px + 7, py + 3)
    })
  }, [labels, pageMeta, imageLoaded])

  useEffect(() => { drawDots() }, [drawDots])

  useEffect(() => {
    const onResize = () => drawDots()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [drawDots])

  // ── Start AI Scan ────────────────────────────────────────────────────────
  const handleStartScan = () => {
    if (!jobId) return
    if (streamRef.current) streamRef.current.close()

    setLabels([])
    setLiveTonnage(0)
    setProgress(0)
    setActivity([])
    setScanning(true)

    streamRef.current = streamJob(jobId, (data) => {
      if (data.type === "label") {
        const lbl: DetectedLabel = { ...data, detectedAt: new Date().toLocaleTimeString() }

        setLabels((prev) => {
          if (prev.some((l) => l.id === lbl.id)) return prev
          return [lbl, ...prev]
        })

        setLiveTonnage((t) => parseFloat((t + (data.weight_kg || 0)).toFixed(2)))

        setActivity((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            confidence: Math.round((data.confidence || 0) * 100),
            formula: `${data.unit_weight} kg/m × ${(data.length_mm / 1000).toFixed(2)} m = ${data.weight_kg} kg`,
            label: data.label,
            color: data.color,
          },
          ...prev,
        ])
      }

      if (data.type === "progress") setProgress(data.percent || 0)
      if (data.type === "complete" || data.type === "done") { setScanning(false); setProgress(100) }
      if (data.type === "error") { setScanning(false); console.error("Stream error:", data.message) }
    })
  }

  // ── Feedback: apply correction to local state ────────────────────────────
  const handleFeedbackSaved = (originalLabel: string, correctedLabel: string) => {
    setLabels((prev) =>
      prev.map((l) =>
        l.label === originalLabel
          ? { ...l, label: correctedLabel, color: "green" as const }
          : l
      )
    )
  }

  // ── Export Marked PDF ────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!jobId || labels.length === 0) return
    setDownloading(true)
    try {
      await downloadLabeledPdf(jobId, labels)
    } catch (e) {
      console.error("PDF download failed:", e)
    } finally {
      setDownloading(false)
    }
  }

  // ── Breakdown rows ───────────────────────────────────────────────────────
  const breakdownRows: BreakdownRow[] = (() => {
    const map = new Map<string, BreakdownRow>()
    labels.forEach((l) => {
      const existing = map.get(l.label)
      if (existing) {
        existing.qty += 1
        existing.tonnage = parseFloat((existing.tonnage + l.weight_kg).toFixed(2))
      } else {
        map.set(l.label, {
          label: l.label,
          length: `${(l.length_mm / 1000).toFixed(2)} m`,
          qty: 1,
          tonnage: l.weight_kg,
          status: l.needs_review ? "Review" : "OK",
          color: l.color,
          sample: l,
        })
      }
    })
    return Array.from(map.values())
  })()

  const avgConfidence = labels.length
    ? Math.round(labels.reduce((a, l) => a + l.confidence, 0) / labels.length * 100)
    : 0

  useEffect(() => { return () => { streamRef.current?.close() } }, [])

  // Revoke blob URL when it changes to avoid memory leaks
  useEffect(() => {
    return () => {
      if (pageImageUrl?.startsWith("blob:")) URL.revokeObjectURL(pageImageUrl)
    }
  }, [pageImageUrl])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      {/* Feedback Modal */}
      {feedbackRow && (
        <FeedbackModal
          row={feedbackRow}
          onClose={() => setFeedbackRow(null)}
          onSaved={handleFeedbackSaved}
        />
      )}

      <div className="bg-[#F4F4F5] sm:flex h-fit p-3 gap-3 px-4 sm:px-10 justify-center items-stretch overflow-hidden">

        {/* ── LEFT ── */}
        <div className="sm:w-[55%] space-y-4 flex flex-col h-[calc(100vh-80px)]">

          {/* VIEWER CARD */}
          <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-800">Live Drawing Viewer</p>
              <div className="flex items-center space-x-3">
                <button onClick={decr} className="bg-[#F4F4F5] rounded-sm px-2 py-2"><Minus size={12} /></button>
                <span className="text-sm">{zoom}%</span>
                <button onClick={incr} className="bg-[#F4F4F5] rounded-sm px-2 py-2"><Plus size={12} /></button>
              </div>
            </div>

            <div
              ref={viewerRef}
              className="flex-1 overflow-auto rounded-xl bg-gray-100 relative"
            >
              {fetchingImage ? (
                /* Loading skeleton — shown between upload success and image blob arriving */
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-100 rounded-xl">
                  <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Loading drawing…</p>
                  <p className="text-xs text-gray-400">Rasterising PDF page</p>
                </div>
              ) : !pageImageUrl ? (
                <div className="w-full h-full">
                  <PdfUploadTrigger
                    uploadIcon={pdflogo}
                    backgroundImage={upload}
                    onSuccess={handleUploadSuccess}
                  />
                </div>
              ) : (
                /* Wrapper that scales from top-left; natural size = zoom 100% */
                <div
                  className="relative inline-block origin-top-left"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top left",
                    // Keep the scrollable area aware of the scaled size
                    // so scrollbars reflect the true content dimensions
                    width: imgRef.current
                      ? imgRef.current.naturalWidth * (zoom / 100)
                      : "auto",
                  }}
                >
                  <img
                    ref={imgRef}
                    src={pageImageUrl}
                    alt="PDF page"
                    className="block"
                    // No maxWidth — render at natural pixel size so labels don't cluster.
                    // At 150 DPI an A3 page is ~1748×1240px — crisp enough and fast.
                    style={{ display: "block" }}
                    onLoad={() => setImageLoaded(true)}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
                  )}
                </div>
              )}
            </div>

            {scanning && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="sm:flex sm:justify-between space-y-2 sm:space-y-0">
              <div className="sm:flex gap-3 space-y-2 sm:space-y-0">
                <div className="bg-[#292929] flex gap-6 rounded-md px-5 py-3 text-white">
                  <img src={nearMe} />
                  <img src={backHand} />
                  <img src={three60} />
                  <img src={squareFoot} />
                </div>
                <div className="bg-[#292929] flex gap-6 rounded-md px-5 py-3 text-white">
                  <img src={one} /><img src={two} /><img src={three} />
                </div>
              </div>

              <div className="flex gap-2">
                {jobId && (
                  <label className="text-gray-600 flex justify-center items-center gap-1 px-4 py-3 border border-gray-300 bg-white hover:bg-gray-50 rounded-md cursor-pointer text-sm">
                    Replace PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        import("../api/steel.api").then(({ uploadDrawing }) => {
                          uploadDrawing(file).then((res) => handleUploadSuccess(res.job_id, res))
                        })
                      }}
                    />
                  </label>
                )}

                <button
                  onClick={handleStartScan}
                  disabled={!jobId || scanning}
                  className="text-white flex justify-center items-center gap-1 pl-5 pr-6 py-3 bg-[#438DE7] hover:bg-[#2784f7] disabled:opacity-50 rounded-md"
                >
                  {scanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Scanning…
                    </>
                  ) : (
                    <>
                      <img src={play} />
                      Start AI Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVITY LOG */}
          <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-3 shrink-0 overflow-auto max-h-[30%]">
            <div className="sm:flex justify-between">
              <p className="text-lg font-medium text-gray-800">AI Activity Log</p>
              <div className="flex gap-1">
                <button className="flex items-center gap-2 border-2 px-3 py-1 border-gray-200 rounded-md">
                  <SlidersHorizontal size={18} /> Filter
                </button>
                <button className="flex items-center gap-2 border-2 px-3 py-1 border-gray-200 rounded-md">
                  <ArrowDownNarrowWide size={18} /> Sort
                </button>
                <button className="flex items-center gap-2 border-2 px-3 py-1 border-gray-200 rounded-md">
                  <Ellipsis size={18} />
                </button>
              </div>
            </div>

            {activity.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                {jobId ? "Press Start AI Scan to begin detection." : "Upload a PDF to get started."}
              </p>
            )}

            {activity.map((item, i) => (
              <div key={i} className="text-sm space-x-2 flex flex-wrap items-center gap-y-1">
                <span className="bg-gray-200 text-gray-500 px-2 py-0.5 rounded-sm text-xs">{item.time}</span>
                <span
                  className="px-2 py-0.5 rounded-sm text-xs font-mono text-white"
                  style={{ background: DOT_COLORS[item.color] || "#438DE7" }}
                >
                  {item.label}
                </span>
                <span>Confidence: <b>{item.confidence}%</b></span>
                <span className="text-gray-500 font-mono text-xs">{item.formula}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="sm:w-[45%] space-y-4 flex flex-col h-[calc(100vh-80px)]">

          {/* SUMMARY CARDS */}
          <div className="rounded-2xl flex flex-col gap-2 bg-white px-3 py-4 shrink-0">
            <p className="text-lg font-medium text-gray-800">Live Cost Summary</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 w-full">

              <div className="flex-1 bg-[#E2D2FF] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#CFBFEB]">
                  <img src={weight} />
                </div>
                <p className="text-xs text-gray-500">Tonnage</p>
                <p className="text-xl text-gray-800 font-semibold tabular-nums">
                  {(liveTonnage / 1000).toFixed(3)} T
                </p>
              </div>

              <div className="flex-1 bg-[#FCE1AC] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#F2D395]">
                  <img src={inkSelection} />
                </div>
                <p className="text-xs text-gray-500">Members</p>
                <p className="text-xl text-gray-800 font-semibold">{labels.length}</p>
              </div>

              <div className="flex-1 bg-[#BAE5F5] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#A6D6E8]">
                  <img src={precisionManufacturing} />
                </div>
                <p className="text-xs text-gray-500">Unique Sections</p>
                <p className="text-xl text-gray-800 font-semibold">{breakdownRows.length}</p>
              </div>

              <div className="flex-1 bg-[#CBEFBF] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#B5DCA8]">
                  <img src={sportsScore} />
                </div>
                <p className="text-xs text-gray-500">Avg Confidence</p>
                <p className="text-xl text-gray-800 font-semibold">{avgConfidence}%</p>
              </div>

            </div>
          </div>

          {/* BREAKDOWN TABLE */}
          <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-5 flex-1 overflow-hidden">
            <p className="text-lg font-medium text-gray-800">
              Breakdown
              {scanning && (
                <span className="ml-2 text-sm font-normal text-blue-500 animate-pulse">● Live</span>
              )}
            </p>

            <div className="text-xs sm:text-sm text-gray-600 border-gray-300 border rounded-2xl px-2 py-2 flex-1 overflow-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">#</th>
                    <th className="px-4 py-2 text-left font-medium">Member</th>
                    <th className="px-4 py-2 text-left font-medium">Length</th>
                    <th className="px-4 py-2 text-left font-medium">QTY</th>
                    <th className="px-4 py-2 text-left font-medium">Weight (kg)</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    {/* Edit column — only visible when there are labels */}
                    {labels.length > 0 && (
                      <th className="px-4 py-2 text-left font-medium">Fix</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {breakdownRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        {scanning ? "Detecting members…" : "No members detected yet."}
                      </td>
                    </tr>
                  ) : (
                    breakdownRows.map((row, i) => (
                      <tr key={row.label} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2">{i + 1}</td>
                        <td className="px-4 py-2 font-mono text-xs">{row.label}</td>
                        <td className="px-4 py-2">{row.length}</td>
                        <td className="px-4 py-2">{row.qty}</td>
                        <td className="px-4 py-2 tabular-nums">{row.tonnage.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs text-white"
                            style={{ background: DOT_COLORS[row.color] || "#438DE7" }}
                          >
                            {row.status}
                          </span>
                        </td>
                        {/* Fix / Feedback button */}
                        <td className="px-4 py-2">
                          <button
                            onClick={() => setFeedbackRow(row)}
                            title="Correct this label"
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-2">
              <button className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm inline-flex items-center">
                <img src={excelLogo} className="w-4 h-4 mr-2" />
                Export Excel File
              </button>

              {/* Export Marked PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={!jobId || labels.length === 0 || downloading}
                className="px-3 py-2 rounded-md border border-[#E5252A29] bg-[#E5252A29] text-sm inline-flex items-center disabled:opacity-50 hover:bg-[#E5252A40] transition-colors"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Generating…
                  </>
                ) : (
                  <>
                    <img src={pdfLogo} className="w-4 h-4 mr-2" />
                    Export Marked PDF
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Dashboard