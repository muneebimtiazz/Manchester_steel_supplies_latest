import Navbar from '../components/Navbar'
import { Plus, Minus, SlidersHorizontal, ArrowDownNarrowWide, Ellipsis, } from 'lucide-react'
import upload from '../assets/Mask_group.png'
import pdflogo from '../assets/Group_35.png'
import precisionManufacturing from '../assets/precision_manufacturing.png'
import sportsScore from '../assets/sports_score.png'
import weight from '../assets/weight.png'
import inkSelection from '../assets/ink_selection.png'
import excelLogo from '../assets/4726010.png'
import pdfLogo from '../assets/19edf111f3ce7f883923c2bafb27e96aa7de1880.png'

import nearMe from '../assets/near_me.png'
import backHand from '../assets/back_hand.png'
import three60 from '../assets/360.png'
import squareFoot from '../assets/direction.png'

import one from '../assets/364.png'
import two from '../assets/365.png'
import three from '../assets/366.png'

import play from '../assets/play_arrow.png'
import {table} from '../assets/dataset'
import { useState } from 'react'

const Dashboard = () => {
    const [zoom,setZoom]=useState(62)
    
    function incr(){
        return setZoom(a=>a+1);
    }
    function decr(){
        return setZoom(a=>a-1);
    }

    return (
        <>
            <Navbar />
            <div className='bg-[#F4F4F5] sm:flex h-fit p-3 gap-3 px-4 sm:px-10 justify-center items-stretch overflow-hidden'>
                {/* 55% */}
                <div className="sm:w-[55%] space-y-4 flex flex-col h-[calc(100vh-80px)]"> 
                   <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-3 flex-1 overflow-hidden">
                        <div className='flex justify-between'>
                            <p className='text-lg font-medium text-gray-800 '>Live Drawing Viewer</p>
                            <div className='space-x-3'>
                                <button onClick={decr} className='bg-[#F4F4F5] rounded-sm px-2 py-1'><Minus size={12}/></button>
                                <span>{zoom}%</span>
                                <button onClick={incr} className='bg-[#F4F4F5] rounded-sm px-2 py-1'><Plus size={12}/></button>
                            </div>
                        </div>
                        <div className="h-full flex items-center justify-center bg-gray-100" style={{ backgroundImage: `url(${upload})` }}>
                            <img src={pdflogo} alt="img"  className="" />
                        </div>
                        <div className='sm:flex sm:justify-between space-y-2 sm:space-y-0'>
                            <div className='sm:flex gap-3 space-y-2 sm:space-y-0'>
                                <div className='bg-[#292929] flex gap-6 rounded-md px-5 py-3 text-white'>
                                    <img src={nearMe}/>
                                    <img src={backHand}/>
                                    <img src={three60} />
                                    <img src={squareFoot}/>
                                </div>
                                <div className='bg-[#292929] flex gap-6 rounded-md px-5 py-3 text-white'>
                                    <img src={one}/>
                                    <img src={two}/>
                                    <img src={three} />
                                </div>
                            </div>
                            <button className='text-white flex justify-center items-center gap-1 w-full sm:w-auto pl-5 pr-6 py-3 bg-[#438DE7] hover:bg-[#2784f7] rounded-xl'>
                                <img src={play} />Start AI Scan
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white px-3 py-4 flex flex-col gap-3 shrink-0 overflow-auto max-h-[30%]">
                        <div className='sm:flex justify-between'>
                            <p className='text-lg font-medium text-gray-800 '>AI Activity Log</p>
                            <div className='flex gap-1'>
                                <button className='flex items-center gap-2 border-2 px-3 py-1 border-gray-200 rounded-xl'><SlidersHorizontal size={18}/> Filter</button>
                                <button className='flex items-center gap-2 border-2 px-3 py-1 border-gray-200 rounded-xl'><ArrowDownNarrowWide size={18}/>Sort by</button>
                                <button className='flex items-center gap-2 border-2 px-3 py-1 border-gray-200 rounded-xl'><Ellipsis size={18}/></button>
                            </div>
                        </div>
                        <div className=' text-sm space-x-4 '>
                            <span className='block sm:inline bg-gray-200 text-gray-500 w-full px-3 py-1 rounded-sm'>10, 21, 2023</span>
                            <span className='block sm:inline'>Confidence calculated: 97%</span>
                            <span className='block sm:inline'>Formula applied: T = 0.037 × 6.2 m = 0.23 T</span>
                            <span className='block sm:inline text-gray-800 underline'>View Activity</span>
                        </div>
                        <div className='text-sm space-x-4'>
                            <span className='block sm:inline bg-gray-200 text-gray-500 w-full px-3 py-1 rounded-sm'>10, 21, 2023</span>
                            <span className='block sm:inline'>Confidence calculated: 97%</span>
                            <span className='block sm:inline'>Formula applied: T = 0.037 × 6.2 m = 0.23 T</span>
                            <span className='block sm:inline text-gray-800 underline'>View Activity</span>
                        </div>
                        <div className='block sm:inline text-sm space-x-4'>
                            <span className='block sm:inline bg-gray-200 text-gray-500 w-full px-3 py-1 rounded-sm'>10, 21, 2023</span>
                            <span className='block sm:inline'>Confidence calculated: 97%</span>
                            <span className='block sm:inline'>Formula applied: T = 0.037 × 6.2 m = 0.23 T</span>
                            <span className='block sm:inline text-gray-800 underline'>View Activity</span>
                        </div>

                    </div>
                </div>

                {/* 45% */}
                <div className="sm:w-[45%] space-y-4 flex flex-col h-[calc(100vh-80px)]">
                    <div className='rounded-2xl flex flex-col gap-2 bg-white px-3 py-4 shrink-0'>
                        <p className='text-lg font-medium text-gray-800 '>Live Cost Summary</p>
                        <div className='flex flex-col gap-3 sm:flex-row sm:gap-2 w-full'>
                            <div className='flex-1 bg-[#E2D2FF] rounded-2xl p-2 flex flex-col'>
                                <div className='w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#CFBFEB]'><img src={weight}/></div>
                                <div>
                                    <p className="text-xs text-gray-500">Tonnage</p>
                                    <p className="text-xl text-gray-800">24.63 T</p>
                                </div>
                            </div>
                            <div className='flex-1 bg-[#FCE1AC] rounded-2xl p-2 flex flex-col'>
                                <div className='w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#F2D395]'><img src={inkSelection}/></div>
                                <div>
                                    <p className="text-xs text-gray-500">Paint Area</p>
                                    <p className="text-xl text-gray-800">1,248 m²</p>
                                </div>
                            </div>
                            <div className='flex-1 bg-[#BAE5F5] rounded-2xl p-2 flex flex-col'>
                                <div className='w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#A6D6E8]'><img src={precisionManufacturing}/></div>
                                <div>
                                    <p className="text-xs text-gray-500">Fabrication Hrs</p>
                                    <p className="text-xl text-gray-800">312 hrs</p>
                                </div>
                            </div>
                            <div className='flex-1 bg-[#CBEFBF] rounded-2xl p-2 flex flex-col'>
                                <div className='w-1/4 flex justify-center ml-auto p-2 rounded-md bg-[#B5DCA8]'><img src={sportsScore}/></div>
                                <div>
                                    <p className="text-xs text-gray-500">Confidence Score</p>
                                    <p className="text-xl text-gray-800">96.4%</p>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <div className='rounded-2xl bg-white px-3 py-4 flex flex-col gap-5 flex-1 overflow-hidden'>
                        <p className='text-lg font-medium text-gray-800 '>Breakdown</p>
                        <div className='text-xs sm:text-sm text-gray-600 border-gray-300 border rounded-2xl px-2 py-2 flex-1 overflow-auto'>
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
                                    <td className="px-4 py-2 text-left">
                                        <span className={row.Status === "Confirmed" ? "bg-[#CBEFBF] px-2 py-1 rounded-sm inline-block" : "inline-block"}>
                                            {row.Status}
                                        </span>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-left sm:text-right">
                            <div className="inline-block w-full sm:w-auto sm:max-w-[70%] space-y-2 sm:space-y-0 sm:space-x-2">
                                <button className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm align-middle">
                                    <img src={excelLogo} className="inline w-5 h-5 mr-2" />
                                    Export Excel File
                                </button>

                                <button className="w-full sm:w-auto px-3 py-2 rounded-lg border border-[#E5252A29] bg-[#E5252A29] hover:bg-[#eb252c36] text-sm align-middle">
                                    <img src={pdfLogo} className="inline w-5 h-5 mr-2" />
                                    Export Marked PDF
                                </button>

                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </>
    )
}


export default Dashboard