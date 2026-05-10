import { useState, useRef } from "react"

import Navbar from "../components/Navbar"
import PdfUploadTrigger from "../components/PdfUploadTrigger"

import {
  Plus,
  Minus,
  SlidersHorizontal,
  ArrowDownNarrowWide,
  Ellipsis,
} from "lucide-react"

import upload from "../assets/Mask_group.png"
import pdflogo from "../assets/Group_35.png"
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

import { table } from "../assets/dataset"
import {streamJob } from "../api/steel.api"

const Dashboard = () => {
  const [zoom, setZoom] = useState(62)
  const [jobId, setJobId] = useState<string | null>(null)
  const [activity, setActivity] = useState<any[]>([])

  const streamRef = useRef<EventSource | null>(null)

  const incr = () => setZoom((a) => a + 1)
  const decr = () => setZoom((a) => a - 1)

  // START AI SCAN
const handleStartScan = async () => {
    if (!jobId) return

    if (streamRef.current) {
        streamRef.current.close()
    }

    setActivity([])

    streamRef.current = streamJob(jobId, (data) => {
        if (data.type === "label") {
            setActivity(prev => [
                ...prev,
                {
                    page: data.page,
                    date: new Date().toLocaleDateString(),
                    confidence: Math.round((data.confidence || 0) * 100),
                    formula: `T = ${data.unit_weight} × ${data.length_mm} m = ${data.weight_kg} T`,
                }
            ])
        }
    })
}

  return (
    <>
      <Navbar />

      <div className="bg-[#F4F4F5] sm:flex h-fit p-3 gap-3 px-4 sm:px-10 justify-center items-stretch overflow-hidden">
        {/* LEFT */}
        <div className="sm:w-[55%] space-y-4 flex flex-col h-[calc(100vh-80px)]">
          {/* Viewer */}
          <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex justify-between">
              <p className="text-lg font-medium text-gray-800">
                Live Drawing Viewer
              </p>

              <div className="space-x-3">
                <button
                  onClick={decr}
                  className="bg-[#F4F4F5] rounded-sm px-2 py-2"
                >
                  <Minus size={12} />
                </button>

                <span>{zoom}%</span>

                <button
                  onClick={incr}
                  className="bg-[#F4F4F5] rounded-sm px-2 py-2"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <PdfUploadTrigger
              uploadIcon={pdflogo}
              backgroundImage={upload}
              onSuccess={(id) => setJobId(id)}
            />

            <div className="sm:flex sm:justify-between space-y-2 sm:space-y-0">
              <div className="sm:flex gap-3 space-y-2 sm:space-y-0">
                <div className="bg-[#292929] flex gap-6 rounded-md px-5 py-3 text-white">
                  <img src={nearMe} />
                  <img src={backHand} />
                  <img src={three60} />
                  <img src={squareFoot} />
                </div>

                <div className="bg-[#292929] flex gap-6 rounded-md px-5 py-3 text-white">
                  <img src={one} />
                  <img src={two} />
                  <img src={three} />
                </div>
              </div>

              <button
                onClick={handleStartScan}
                className="text-white flex justify-center items-center gap-1 w-full sm:w-auto pl-5 pr-6 py-3 bg-[#438DE7] hover:bg-[#2784f7] rounded-md"
              >
                <img src={play} />
                Start AI Scan
              </button>
            </div>
          </div>

          {/* ACTIVITY LOG */}
          <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-3 shrink-0 overflow-auto max-h-[30%]">
            <div className="sm:flex justify-between">
              <p className="text-lg font-medium text-gray-800">
                AI Activity Log
              </p>

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

            {activity.map((item, i) => (
                <div key={i} className='text-sm space-x-4'>
                    
                    <span className='block sm:inline bg-gray-200 text-gray-500 px-3 py-1 rounded-sm'>
                        {item.date}
                    </span>

                    <span className='block sm:inline'>
                        Confidence calculated: {item.confidence}%
                    </span>

                    <span className='block sm:inline'>
                        {item.formula}
                    </span>

                    {/* <span className='block sm:inline text-gray-800 underline cursor-pointer'>
                        View Activity
                    </span> */}

                </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="sm:w-[45%] space-y-4 flex flex-col h-[calc(100vh-80px)]">
          {/* SUMMARY */}
          <div className="rounded-2xl flex flex-col gap-2 bg-white px-3 py-4 shrink-0">
            <p className="text-lg font-medium text-gray-800">
              Live Cost Summary
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 w-full">
              <div className="flex-1 bg-[#E2D2FF] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#CFBFEB]">
                  <img src={weight} />
                </div>
                <p className="text-xs text-gray-500">Tonnage</p>
                <p className="text-xl text-gray-800">24.63 T</p>
              </div>

              <div className="flex-1 bg-[#FCE1AC] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#F2D395]">
                  <img src={inkSelection} />
                </div>
                <p className="text-xs text-gray-500">Paint Area</p>
                <p className="text-xl text-gray-800">1,248 m²</p>
              </div>

              <div className="flex-1 bg-[#BAE5F5] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#A6D6E8]">
                  <img src={precisionManufacturing} />
                </div>
                <p className="text-xs text-gray-500">Fabrication Hrs</p>
                <p className="text-xl text-gray-800">312 hrs</p>
              </div>

              <div className="flex-1 bg-[#CBEFBF] rounded-xl p-2 flex flex-col">
                <div className="w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#B5DCA8]">
                  <img src={sportsScore} />
                </div>
                <p className="text-xs text-gray-500">Confidence Score</p>
                <p className="text-xl text-gray-800">96.4%</p>
              </div>
            </div>
          </div>

          {/* BREAKDOWN */}
          <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-5 flex-1 overflow-hidden">
            <p className="text-lg font-medium text-gray-800">Breakdown</p>

            <div className="text-xs sm:text-sm text-gray-600 border-gray-300 border rounded-2xl px-2 py-2 flex-1 overflow-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">#</th>
                    <th className="px-4 py-2 text-left font-medium">Member</th>
                    <th className="px-4 py-2 text-left font-medium">Length</th>
                    <th className="px-4 py-2 text-left font-medium">QTY</th>
                    <th className="px-4 py-2 text-left font-medium">Tonnage</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {table.map((row) => (
                    <tr key={row["#"]}>
                      <td className="px-4 py-2">{row["#"]}</td>
                      <td className="px-4 py-2">{row.Member}</td>
                      <td className="px-4 py-2">{row.Length}</td>
                      <td className="px-4 py-2">{row.QTY}</td>
                      <td className="px-4 py-2">{row.Tonnage}</td>
                      <td className="px-4 py-2">{row.Status}</td>
                    </tr>
                  ))}
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