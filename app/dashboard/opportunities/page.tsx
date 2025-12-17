"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock Data for found tenders (Fallback)
const MOCK_TENDERS = [
  {
    id: "T-2025-001",
    title: "Supply of 11kV Cables for Metro Phase 2",
    authority: "Metro Rail Corporation",
    deadline: "2026-02-15", // < 3 months
    probability: "High",
    status: "new"
  },
  {
    id: "T-2025-002",
    title: "Annual Maintenance Contract for Elevators",
    authority: "Airport Authority",
    deadline: "2026-06-01", // > 3 months
    probability: "Low",
    status: "ignored" // Filtered out
  },
  {
    id: "T-2025-003",
    title: "Procurement of MCCB and Switchgear",
    authority: "State Electricity Board",
    deadline: "2026-01-20", // Urgent
    probability: "Very High",
    status: "new"
  }
];

export default function OpportunitiesPage() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scanUrl, setScanUrl] = useState("https://etenders.gov.in/eprocure/app"); // Default Mock
  const router = useRouter();

  const startScan = async () => {
    if (!scanUrl) return;
    setScanning(true);
    
    try {
        const res = await fetch("/api/scan", {
            method: "POST",
            body: JSON.stringify({ url: scanUrl })
        });
        const data = await res.json();
        
        if (data.success) {
            // Combine with existing mocks for demo richness
            setResults([...MOCK_TENDERS, ...data.opportunities]);
        } else {
            setResults(MOCK_TENDERS); // Fallback
        }
    } catch (e) {
        setResults(MOCK_TENDERS); // Fallback on error
    } finally {
        setScanning(false);
    }
  };

  const handleProcess = (id: string) => {
    router.push("/dashboard/process?auto=true");
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 border border-slate-200 shadow-sm rounded-xl">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Sales Signal Detection</h1>
          <p className="text-slate-500">Automated Portal Scanner • Region: India • Sector: Public Infra</p>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto">
            <input 
                type="text" 
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder="Enter Portal URL..."
                className="w-full md:w-96 px-4 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={startScan}
              disabled={scanning}
              className="whitespace-nowrap px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all uppercase tracking-wide text-xs"
            >
              {scanning ? (
                <>
                  <span className="animate-spin text-lg">⚡</span> Scanning...
                </>
              ) : (
                 <>📡 Scan Portals</>
              )}
            </button>
        </div>
      </header>

      {/* Scanned Results */}
      <div className="space-y-4">
        {results.length === 0 && !scanning && (
          <div className="text-center py-24 border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl text-slate-400 font-medium">
            No active scans. Enter a Portal URL and click "Scan Portals" to activate Sales Agent.
          </div>
        )}

        {results.map((tender, index) => (
          <div 
            key={`${tender.id}-${index}`}
            className={`p-6 rounded-xl border bg-white shadow-sm flex items-center justify-between transition-all hover:shadow-md ${
              tender.status === "ignored" 
                ? "border-slate-100 opacity-60 grayscale" 
                : "border-slate-200 border-l-4 border-l-blue-600"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-slate-700 font-bold text-[10px] px-2.5 py-1 bg-slate-100 rounded-full uppercase tracking-wider border border-slate-200">
                  {tender.authority}
                </span>
                {tender.status === "ignored" && (
                    <span className="text-slate-500 font-mono text-[10px] px-2 py-0.5 border border-slate-200 rounded-md bg-slate-50">
                        Deadline {">"} 3mo
                    </span>
                )}
                {(tender.probability === "Very High" || tender.probability === "High") && (
                    <span className="text-white bg-slate-800 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        🔥 High Priority
                    </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{tender.title}</h3>
              <p className="text-slate-500 text-sm mt-1 font-mono">Ref: {tender.id} • Due: {tender.deadline}</p>
            </div>

            {tender.status === "new" && (
              <button 
                onClick={() => handleProcess(tender.id)}
                className="ml-6 px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 text-xs uppercase tracking-wide shadow-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                Proceed to Quote &rarr;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
