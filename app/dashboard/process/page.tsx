"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ProcessContent() {
  const searchParams = useSearchParams();
  const autoRun = searchParams.get("auto") === "true";
  
  const [logs, setLogs] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Auto-run effect for "Sales Agent" handoff
  useEffect(() => {
    if (autoRun && !processing && !results) {
      handleSimulatedUpload();
    }
  }, [autoRun]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const processFile = async (file: File) => {
    setProcessing(true);
    setLogs([]); // Clear previous logs
    setResults(null);
    
    addLog(`📢 Sales Agent: Handoff received.`);
    addLog(`📂 Input: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    addLog(`🏗️ Orchestrator: Initializing Agents...`);

    try {
      addLog(`🕵️ Technical Agent: Extracting specifications (AWS Textract)...`);
      
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      const data = await response.json();
      addLog(`🧠 Technical Agent: Vector Search complete.`);
      addLog(`💰 Pricing Agent: Costs calculated.`);
      
      setResults(data);
      addLog(`✅ System: Pipeline execution successful.`);

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulatedUpload = async () => {
    addLog(`🤖 System: Initiating Auto-Processing for Sales Lead "T-2025-001"...`);
    try {
      const res = await fetch("/cable_rfp.pdf");
      const blob = await res.blob();
      const file = new File([blob], "cable_rfp_tender_doc.pdf", { type: "application/pdf" });
      processFile(file);
    } catch (e) {
      addLog(`❌ Error fetching simulated file.`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-60px)] flex flex-col p-6">
      <header className="mb-6 flex justify-between items-end bg-white p-8 border border-slate-200 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-slate-900">RFP Processing Unit</h1>
          <p className="text-slate-500">Upload Tender Documents for Agent Analysis</p>
        </div>
        
        {!processing && !results && (
             <div className="text-right">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm transition-all font-semibold tracking-wide uppercase shadow-sm hover:shadow-md"
                >
                  Upload Manual RFP
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                />
             </div>
        )}
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: Input & Logs */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Drop Zone */}
            {!results && !processing && (
                <div 
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex-1 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-8 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="text-5xl mb-6 opacity-30 text-slate-400 group-hover:opacity-100 group-hover:text-blue-500 transition-all group-hover:scale-110 duration-300">📄</div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Drop RFP Document</h3>
                    <p className="text-slate-500 text-sm">PDF, Images accepted</p>
                </div>
            )}

            {/* System Logs */}
            <div className={`flex-1 bg-white rounded-xl border border-slate-200 p-6 font-mono text-xs overflow-auto shadow-sm ${results ? 'h-full flex-none' : ''}`}>
                <div className="text-slate-400 mb-4 text-[10px] uppercase tracking-widest border-b border-slate-100 pb-2 font-bold flex justify-between">
                    <span>System Audit Log</span>
                    <span className="text-emerald-500">● Live</span>
                </div>
                {logs.length === 0 && <span className="text-slate-300 italic">Waiting for input...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-2 text-slate-600 border-l-2 border-blue-500 pl-3 py-1">
                        {log}
                    </div>
                ))}
                {processing && <div className="animate-pulse text-blue-600 font-bold mt-4 flex items-center gap-2">
                    <span className="animate-spin">⟳</span> Processing...
                </div>}
            </div>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-8 overflow-auto shadow-sm flex flex-col">
            {!results ? (
                <div className="h-full flex items-center justify-center text-slate-300 flex-col gap-4">
                    <div className="text-5xl opacity-20">⚙️</div>
                    <p>Agent Output will appear here</p>
                </div>
            ) : (
                <div className="space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Generated Proposal</h2>
                            <p className="text-slate-500 text-sm">Automated Analysis Report</p>
                        </div>
                        <div className="text-right">
                           <div className="text-sm text-slate-500">Total Estimated Value</div>
                           <div className="text-4xl font-bold text-slate-900 tracking-tight">
                             ₹{results.items.reduce((sum: number, i: any) => sum + i.total, 0).toLocaleString()}
                           </div>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-4 font-semibold uppercase text-xs tracking-wider rounded-tl-lg">Line Item</th>
                                <th className="p-4 font-semibold uppercase text-xs tracking-wider">Matched SKU</th>
                                <th className="p-4 font-semibold uppercase text-xs tracking-wider">Qty</th>
                                <th className="p-4 font-semibold uppercase text-xs tracking-wider">Unit Cost</th>
                                <th className="p-4 font-semibold uppercase text-xs tracking-wider text-right rounded-tr-lg">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.items.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50 group transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{item.name}</div>
                                        <div className="text-xs text-slate-400 mt-0.5 font-mono">{item.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`text-[10px] px-2.5 py-0.5 rounded-full inline-block font-bold mb-1 shadow-sm border ${
                                            item.status === 'match' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            item.status === 'partial' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                            {item.confidence}% Match
                                        </div>
                                        {item.status !== 'mismatch' && (
                                            <div className="text-slate-600 text-xs font-medium">{item.matchedName}</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600">{item.quantity}</td>
                                    <td className="p-4 text-slate-600">₹{item.unitPrice.toLocaleString()}</td>
                                    <td className="p-4 font-mono text-slate-900 font-bold text-right">₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="mt-auto pt-8 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setResults(null)} className="px-6 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors">
                           Reset
                        </button>
                        <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all uppercase tracking-wide text-xs hover:-translate-y-0.5">
                           Download Proposal PDF
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

export default function ProcessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#686872]">Loading Workflow...</div>}>
      <ProcessContent />
    </Suspense>
  );
}
