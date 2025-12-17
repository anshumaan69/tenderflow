"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock Data for found tenders
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
  const router = useRouter();

  const startScan = () => {
    setScanning(true);
    // Simulate scraping delay
    setTimeout(() => {
      setResults(MOCK_TENDERS);
      setScanning(false);
    }, 2500);
  };

  const handleProcess = (id: string) => {
    router.push("/dashboard/process?auto=true");
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4">
      <header className="mb-8 flex justify-between items-center bg-white p-8 border-b border-[#D0D0D5] shadow-sm">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#2E2E38]">Sales Signal Detection</h1>
          <p className="text-[#686872]">Automated Portal Scanner • Region: India • Sector: Public Infra</p>
        </div>
        
        <button 
          onClick={startScan}
          disabled={scanning}
          className="px-6 py-3 bg-[#FFE600] hover:bg-[#E6CF00] disabled:opacity-50 disabled:cursor-not-allowed text-[#2E2E38] font-bold rounded-sm shadow-sm flex items-center gap-2 transition-all uppercase tracking-wide text-sm"
        >
          {scanning ? (
            <>
              <span className="animate-spin text-xl">⚡</span> Scanning...
            </>
          ) : (
             <>📡 Scan Portals Now</>
          )}
        </button>
      </header>

      {/* Scanned Results */}
      <div className="space-y-4">
        {results.length === 0 && !scanning && (
          <div className="text-center py-20 border-2 border-dashed border-[#D0D0D5] bg-white rounded-sm text-[#686872]">
            No active scans. Click "Scan Portals" to activate Sales Agent.
          </div>
        )}

        {results.map((tender) => (
          <div 
            key={tender.id}
            className={`p-6 rounded-sm border bg-white shadow-sm flex items-center justify-between transition-all ${
              tender.status === "ignored" 
                ? "border-[#E1E1E5] opacity-60 grayscale" 
                : "border-l-4 border-l-[#FFE600] border-y-[#E1E1E5] border-r-[#E1E1E5]"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#2E2E38] font-bold text-xs px-2 py-0.5 bg-[#F0F0F2] rounded-sm uppercase tracking-wider">
                  {tender.authority}
                </span>
                {tender.status === "ignored" && (
                    <span className="text-[#686872] font-mono text-xs px-2 py-0.5 border border-[#E1E1E5] rounded-sm">
                        Deadline {">"} 3mo
                    </span>
                )}
                {tender.probability === "Very High" && (
                    <span className="text-white bg-[#2E2E38] font-bold text-xs px-2 py-0.5 rounded-sm">
                        🔥 High Priority
                    </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-[#2E2E38]">{tender.title}</h3>
              <p className="text-[#686872] text-sm mt-1 font-mono">Ref: {tender.id} • Due: {tender.deadline}</p>
            </div>

            {tender.status === "new" && (
              <button 
                onClick={() => handleProcess(tender.id)}
                className="ml-6 px-6 py-2 bg-[#2E2E38] text-white font-bold rounded-sm hover:bg-[#1A1A24] transition-colors flex items-center gap-2 text-sm uppercase tracking-wide shadow-sm"
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
