"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function WarRoomPage() {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.from(".header-anim", { y: -20, opacity: 0, duration: 0.8 })
      .from(".ey-card", { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, "-=0.4");

    // Loop Data Packet - EY Yellow
    gsap.to(".packet", {
      x: 600, 
      duration: 3,
      repeat: -1,
      ease: "power1.inOut",
      yoyo: true
    });
      
  }, { scope: container });

  return (
    <div ref={container} className="max-w-[1600px] mx-auto p-4">
      {/* Header */}
      <header className="header-anim mb-8 flex justify-between items-end border-b border-[#D0D0D5] pb-6 bg-white p-8 shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-[#2E2E38]">Global Control Center</h1>
            <p className="text-[#686872] mt-1">Multi-Agent Procurement Orchestration</p>
        </div>
        <Link href="/dashboard/process" className="px-6 py-3 bg-[#FFE600] text-[#2E2E38] font-bold text-sm tracking-wide hover:bg-[#E6CF00] transition-colors shadow-sm">
            PROCESS NEW RFP &rarr;
        </Link>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* KPI Section (Left Column) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Sales Card */}
            <div className="ey-card bg-white p-8 shadow-sm border-l-4 border-[#FFE600] h-48 flex flex-col justify-between group hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#2E2E38] text-lg">Sales Intelligence</h3>
                  <div className="w-2 h-2 bg-[#FFE600] rounded-full"></div>
               </div>
               <div>
                  <div className="text-4xl font-bold text-[#2E2E38]">03</div>
                  <div className="text-sm text-[#686872] mt-1">High-Priority Leads</div>
               </div>
               <Link href="/dashboard/opportunities" className="text-xs font-bold text-[#2E2E38] underline decoration-[#FFE600] underline-offset-4 hover:decoration-4 transition-all">
                  VIEW OPPORTUNITIES
               </Link>
            </div>

            {/* Inventory Card */}
            <div className="ey-card bg-white p-8 shadow-sm border-l-4 border-[#2E2E38] h-48 flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#2E2E38] text-lg">Technical Knowledge</h3>
                  <div className="font-mono text-xs text-[#686872]">VECTOR_DB_V1</div>
               </div>
               <div>
                  <div className="text-4xl font-bold text-[#2E2E38]">15</div>
                  <div className="text-sm text-[#686872] mt-1">Indexed SKUs</div>
               </div>
               <div className="w-full bg-[#F0F0F2] h-1.5 mt-2">
                 <div className="bg-[#2E2E38] h-full w-[85%]"></div>
               </div>
            </div>
            
             {/* Efficiency Card */}
             <div className="ey-card bg-[#2E2E38] p-8 shadow-sm text-white h-48 flex flex-col justify-between">
               <h3 className="font-bold text-white text-lg">Procurement Efficiency</h3>
               <div className="flex justify-between items-end">
                  <div className="text-4xl font-bold text-[#FFE600]">+400%</div>
                  <div className="text-right text-xs text-[#C4C4CD]">vs Manual</div>
               </div>
            </div>

        </div>

        {/* Architecture Flow (Right Main Area) */}
        <div className="col-span-12 lg:col-span-8">
            <div className="ey-card bg-white h-full min-h-[500px] shadow-sm p-10 relative overflow-hidden">
                <h3 className="font-bold text-[#2E2E38] text-lg mb-12 border-b border-[#F0F0F2] pb-6">Live Architecture flow</h3>
                
                {/* Flow Diagram */}
                <div className="relative flex justify-between items-center h-64 mt-8 px-12">
                   
                   {/* Line */}
                   <div className="absolute left-24 right-24 h-0.5 bg-[#E1E1E5] z-0"></div>
                   
                   {/* Data Packet */}
                   <div className="packet absolute left-24 w-4 h-4 bg-[#FFE600] z-10 shadow-sm border border-[#2E2E38]"></div>

                   {/* Node 1 */}
                   <div className="relative z-20 bg-white border border-[#E1E1E5] p-6 w-56 shadow-sm flex flex-col items-center text-center h-40 justify-center">
                      <div className="text-3xl mb-3">📡</div>
                      <div className="font-bold text-[#2E2E38]">Sales Agent</div>
                      <div className="text-xs text-[#686872] mt-1">Portal Capture</div>
                   </div>

                   {/* Node 2 */}
                   <div className="relative z-20 bg-white border border-[#E1E1E5] p-6 w-56 shadow-sm flex flex-col items-center text-center h-40 justify-center">
                      <div className="text-3xl mb-3">🧠</div>
                      <div className="font-bold text-[#2E2E38]">Technical Agent</div>
                      <div className="text-xs text-[#686872] mt-1">RAG Matching</div>
                   </div>

                   {/* Node 3 */}
                   <div className="relative z-20 bg-white border border-[#E1E1E5] p-6 w-56 shadow-sm flex flex-col items-center text-center h-40 justify-center">
                      <div className="text-3xl mb-3">💰</div>
                      <div className="font-bold text-[#2E2E38]">Pricing Agent</div>
                      <div className="text-xs text-[#686872] mt-1">Cost Injection</div>
                   </div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                   <div className="text-xs text-[#686872]">Status: <span className="font-bold text-green-600">Active Monitoring</span></div>
                   <div className="text-xs text-[#686872]">Latency: <span className="font-bold text-[#2E2E38]">45ms</span></div>
                   <div className="text-xs text-[#686872]">Logic: <span className="font-bold text-[#2E2E38]">Deterministic</span></div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
