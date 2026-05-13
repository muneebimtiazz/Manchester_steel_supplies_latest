import { useState, useRef, useEffect, useCallback } from "react"

import Navbar from "../components/Navbar"
import PdfUploadTrigger from "../components/PdfUploadTrigger"
import {
  Plus, Minus, SlidersHorizontal, ArrowDownNarrowWide, Ellipsis,
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

import { streamJob, getPageImageUrl, type LabelEvent, type UploadResult } from "../api/steel.api"

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
}

// ── Helpers ────────────────────────────────────────────────────────────────
const DOT_COLORS: Record<string, string> = {
  blue: "#438DE7",
  orange: "#F59E0B",
  green: "#22C55E",
};

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
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

  // Refs
  const streamRef = useRef<EventSource | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  const incr = () => setZoom((a) => Math.min(a + 5, 200))
  const decr = () => setZoom((a) => Math.max(a - 5, 20))

  // ── After upload success ─────────────────────────────────────────────────
  const handleUploadSuccess = (id: string, meta: UploadResult) => {
    // Reset everything for new job
    setJobId(id)
    setLabels([])
    setLiveTonnage(0)
    setProgress(0)
    setActivity([])
    setImageLoaded(false)

    const page0 = meta.pages[0]
    setPageMeta({ width: page0.width, height: page0.height })

    // Trigger image load via proxy
    setPageImageUrl(getPageImageUrl(id, 0, 150))
  }

  // ── Draw dots on canvas whenever labels or image change ──────────────────
  const drawDots = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !pageMeta || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sync canvas size to rendered image size
    const rect = img.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scaleX = canvas.width / pageMeta.width
    const scaleY = canvas.height / pageMeta.height

    labels.forEach((lbl) => {
      const px = lbl.x * scaleX
      const py = lbl.y * scaleY
      const color = DOT_COLORS[lbl.color] || "#438DE7"

      // Outer glow
      ctx.beginPath()
      ctx.arc(px, py, 8, 0, Math.PI * 2)
      ctx.fillStyle = color + "33"
      ctx.fill()

      // Dot
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Tiny label
      ctx.font = "bold 9px monospace"
      ctx.fillStyle = "#1e293b"
      ctx.fillText(lbl.label, px + 7, py + 3)
    })
  }, [labels, pageMeta, imageLoaded])

  useEffect(() => {
    drawDots()
  }, [drawDots])

  // Redraw on window resize
  useEffect(() => {
    const onResize = () => drawDots()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [drawDots])

  // ── Start AI Scan ────────────────────────────────────────────────────────
  const handleStartScan = () => {
    if (!jobId) return

    if (streamRef.current) {
      streamRef.current.close()
    }

    setLabels([])
    setLiveTonnage(0)
    setProgress(0)
    setActivity([])
    setScanning(true)

    streamRef.current = streamJob(jobId, (data) => {
      if (data.type === "label") {
        const lbl: DetectedLabel = {
          ...data,
          detectedAt: new Date().toLocaleTimeString(),
        }

        setLabels((prev) => {
          // Deduplicate by id
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

      if (data.type === "progress") {
        setProgress(data.percent || 0)
      }

      if (data.type === "complete" || data.type === "done") {
        setScanning(false)
        setProgress(100)
      }

      if (data.type === "error") {
        setScanning(false)
        console.error("Stream error:", data.message)
      }
    })
  }

  // ── Breakdown rows derived from labels ───────────────────────────────────
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
        })
      }
    })
    return Array.from(map.values())
  })()

  // ── Avg confidence ───────────────────────────────────────────────────────
  const avgConfidence = labels.length
    ? Math.round(labels.reduce((a, l) => a + l.confidence, 0) / labels.length * 100)
    : 0

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => { streamRef.current?.close() }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

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

            {/* PDF VIEWER AREA */}
            <div
              ref={viewerRef}
              className="flex-1 overflow-auto rounded-xl bg-gray-100 flex items-start justify-center relative"
            >
              {!pageImageUrl ? (
                /* Upload trigger shown when no PDF yet */
                <div className="w-full h-full">
                  <PdfUploadTrigger
                    uploadIcon={pdflogo}
                    backgroundImage={upload}
                    onSuccess={handleUploadSuccess}
                  />
                </div>
              ) : (
                /* Once uploaded, show the rasterised PDF page */
                <div
                  className="relative inline-block"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
                >
                  <img
                    ref={imgRef}
                    src={pageImageUrl}
                    alt="PDF page"
                    className="block"
                    style={{ maxWidth: "100%", display: "block" }}
                    onLoad={() => setImageLoaded(true)}
                  />

                  {/* Canvas overlaid exactly on top of the image */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                  />

                  {/* Loading shimmer while image isn't ready */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
                  )}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {scanning && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Toolbar + Start button */}
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
                {/* Replace PDF button (shown once a job exists) */}
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
                  </tr>
                </thead>
                <tbody>
                  {breakdownRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
              <button className="px-3 py-2 rounded-md border border-[#E5252A29] bg-[#E5252A29] text-sm inline-flex items-center">
                <img src={pdfLogo} className="w-4 h-4 mr-2" />
                Export Marked PDF
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Dashboard