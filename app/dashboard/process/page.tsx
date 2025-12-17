"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function ProcessPage() {
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
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-60px)] flex flex-col p-4">
      <header className="mb-6 flex justify-between items-end bg-white p-8 border-b border-[#D0D0D5] shadow-sm">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[#2E2E38]">RFP Processing Unit</h1>
          <p className="text-[#686872]">Upload Tender Documents for Agent Analysis</p>
        </div>
        
        {!processing && !results && (
             <div className="text-right">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-[#2E2E38] text-white hover:bg-black rounded-sm text-sm transition-colors font-bold tracking-wide uppercase shadow-sm"
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
                    className="flex-1 border-2 border-dashed border-[#D0D0D5] rounded-sm bg-white flex flex-col items-center justify-center p-8 hover:border-[#FFE600] transition-all text-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="text-4xl mb-4 opacity-50 text-[#2E2E38] group-hover:opacity-100 transition-opacity">📄</div>
                    <h3 className="text-xl font-bold text-[#2E2E38] mb-2">Drop RFP Document</h3>
                    <p className="text-[#686872] text-sm">PDF, Images accepted</p>
                </div>
            )}

            {/* System Logs */}
            <div className={`flex-1 bg-white rounded-sm border border-[#E1E1E5] p-6 font-mono text-xs overflow-auto shadow-sm ${results ? 'h-full flex-none' : ''}`}>
                <div className="text-[#686872] mb-4 text-[10px] uppercase tracking-widest border-b border-[#F0F0F2] pb-2 font-bold">System Audit Log</div>
                {logs.length === 0 && <span className="text-[#C4C4CD] italic">Waiting for input...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-2 text-[#2E2E38] border-l-2 border-[#FFE600] pl-2 py-0.5">
                        {log}
                    </div>
                ))}
                {processing && <div className="animate-pulse text-[#2E2E38] font-bold mt-2">_ Processing...</div>}
            </div>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E1E1E5] rounded-sm p-8 overflow-auto shadow-sm flex flex-col">
            {!results ? (
                <div className="h-full flex items-center justify-center text-[#C4C4CD] flex-col gap-4">
                    <div className="text-4xl">⚙️</div>
                    <p>Agent Output will appear here</p>
                </div>
            ) : (
                <div className="space-y-8 flex-1">
                    <div className="flex justify-between items-start border-b border-[#F0F0F2] pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#2E2E38]">Generated Proposal</h2>
                            <p className="text-[#686872] text-sm">Automated Analysis Report</p>
                        </div>
                        <div className="text-right">
                           <div className="text-sm text-[#686872]">Total Estimated Value</div>
                           <div className="text-3xl font-bold text-[#2E2E38]">
                             ₹{results.items.reduce((sum: number, i: any) => sum + i.total, 0).toLocaleString()}
                           </div>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-[#F0F0F2] text-[#686872]">
                            <tr>
                                <th className="p-4 font-medium uppercase text-xs tracking-wider">Line Item</th>
                                <th className="p-4 font-medium uppercase text-xs tracking-wider">Matched SKU</th>
                                <th className="p-4 font-medium uppercase text-xs tracking-wider">Qty</th>
                                <th className="p-4 font-medium uppercase text-xs tracking-wider">Unit Cost</th>
                                <th className="p-4 font-medium uppercase text-xs tracking-wider text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F0F2]">
                            {results.items.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-[#FFFDF5] group transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-[#2E2E38]">{item.name}</div>
                                        <div className="text-xs text-[#686872] mt-0.5 font-mono">{item.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold mb-1 ${
                                            item.status === 'match' ? 'bg-[#E3FCEF] text-[#006644]' :
                                            item.status === 'partial' ? 'bg-[#FFF8EB] text-[#B86E00]' :
                                            'bg-[#FFEBE6] text-[#BF2600]'
                                        }`}>
                                            {item.confidence}% Match
                                        </div>
                                        {item.status !== 'mismatch' && (
                                            <div className="text-[#2E2E38] text-xs">{item.matchedName}</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-[#2E2E38]">{item.quantity}</td>
                                    <td className="p-4 text-[#2E2E38]">₹{item.unitPrice}</td>
                                    <td className="p-4 font-mono text-[#2E2E38] font-bold text-right">₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="mt-auto pt-8 border-t border-[#F0F0F2] flex justify-end gap-4">
                        <button onClick={() => setResults(null)} className="px-6 py-3 text-[#686872] hover:text-[#2E2E38] font-medium text-sm">
                           Reset
                        </button>
                        <button className="px-8 py-3 bg-[#FFE600] text-[#2E2E38] font-bold rounded-sm hover:bg-[#E6CF00] shadow-sm uppercase tracking-wide text-sm">
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
