"use client";

import DashboardLayout from "../dashboard/layout";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function AboutPage() {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Reveal Items
    tl.to(".anim-item", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.3,
      ease: "power2.out"
    });

    // Loop Data Packet
    gsap.to(".packet", {
      y: 300, // Distance to cover
      duration: 4,
      repeat: -1,
      ease: "none" // Linear flow
    });

  }, { scope: container });

  return (
    <DashboardLayout>
      <div ref={container} className="max-w-4xl mx-auto py-12">
        
        <h1 className="anim-item text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          The Architecture
        </h1>
        
        <p className="anim-item text-xl text-white/60 mb-16 max-w-2xl leading-relaxed">
          TenderFlow replaces manual RFP processing with a coordinated swarm of specialized AI Agents.
          Here is how the system thinks.
        </p>

        {/* Animated Pipeline Visualization */}
        <div className="relative mt-12 mb-20">
          
          {/* Connecting Line */}
          <div className="absolute left-[29px] top-12 bottom-12 w-0.5 bg-white/10 hidden md:block"></div>
          
          {/* Animated Data Packet */}
          <div className="packet absolute left-[25px] top-12 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] hidden md:block z-20"></div>

          <div className="space-y-16 relative z-10">
            
            {/* Sales Agent Node */}
            <div className="anim-item flex gap-8 items-start opacity-0">
               <div className="w-16 h-16 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-3xl shrink-0 z-10 relative">
                  📡
                  <div className="absolute inset-0 bg-green-500/10 rounded-2xl animate-pulse"></div>
               </div>
               <div className="pt-2">
                  <h2 className="text-2xl font-bold text-green-400 mb-2">1. Sales Agent (The Hunter)</h2>
                  <p className="text-white/60 max-w-xl">
                    Continuously scans government portals and filters RFPs based on urgency.
                    <br/><span className="text-xs text-green-500 font-mono mt-2 block">Found: "Metro Rail Cable Tender" (Due: 25th Dec)</span>
                  </p>
               </div>
            </div>

            {/* Technical Agent Node */}
            <div className="anim-item flex gap-8 items-start opacity-0">
               <div className="w-16 h-16 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-3xl shrink-0 z-10 relative">
                  🧠
               </div>
               <div className="pt-2">
                  <h2 className="text-2xl font-bold text-cyan-400 mb-2">2. Technical Agent (The Expert)</h2>
                  <p className="text-white/60 max-w-xl mb-4">
                    Orchestrates AWS Bedrock to extract specs and perform Semantic Search.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div className="p-3 bg-white/5 rounded border border-white/5">
                      <div className="text-xs text-white/40 mb-1">Input Spec</div>
                      <div className="text-sm font-mono text-cyan-200">"11kV 3-Core XLPE"</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded border border-white/5 relative">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-white/20">→</div>
                      <div className="text-xs text-white/40 mb-1">Vector Match</div>
                      <div className="text-sm font-mono text-green-300">CBL-HV-001 (92%)</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Pricing Agent Node */}
            <div className="anim-item flex gap-8 items-start opacity-0">
               <div className="w-16 h-16 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-3xl shrink-0 z-10 relative">
                  💰
               </div>
               <div className="pt-2">
                  <h2 className="text-2xl font-bold text-amber-400 mb-2">3. Pricing Agent (The Accountant)</h2>
                  <p className="text-white/60 max-w-xl">
                    Applies deterministic logic to calculate margins, taxes, and service fees.
                    <br/><span className="text-xs text-amber-500 font-mono mt-2 block">Action: Injected "HV Test" Cost (₹15,000)</span>
                  </p>
               </div>
            </div>

          </div>
        </div>

        <div className="anim-item mt-16 pt-8 border-t border-white/10 text-center text-white/20 text-sm">
          Built on AWS Bedrock • Next.js • Tailwind CSS • GSAP
        </div>

      </div>
    </DashboardLayout>
  );
}
