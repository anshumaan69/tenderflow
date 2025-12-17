import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F0F0F2] text-[#2E2E38] font-sans overflow-hidden">
      {/* Sidebar - EY Corporate Charcoal */}
      <aside className="w-72 bg-[#2E2E38] flex flex-col z-50 shadow-xl">
        {/* EY Header */}
        <div className="p-8 pb-12">
           <div className="w-12 h-12 bg-[#FFE600] flex items-center justify-center mb-6">
              <span className="font-bold text-black text-xl tracking-tighter">EY</span>
           </div>
           
           <div className="text-white font-medium text-lg border-l-4 border-[#FFE600] pl-4">
             TenderFlow
             <div className="text-[#C4C4CD] text-xs font-normal mt-1">Audit & Assurance</div>
           </div>
        </div>
        
        <nav className="flex flex-col px-4 gap-1">
          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-white hover:bg-[#3D3D4D] transition-colors rounded-sm border-l-2 border-transparent hover:border-[#FFE600]">
            <span>📊</span> Overview
          </Link>
          <Link href="/dashboard/opportunities" className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-[#C4C4CD] hover:text-white hover:bg-[#3D3D4D] transition-colors rounded-sm border-l-2 border-transparent hover:border-[#FFE600]">
             <span>⚡</span> Sales Signals
          </Link>
          <Link href="/dashboard/process" className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-[#C4C4CD] hover:text-white hover:bg-[#3D3D4D] transition-colors rounded-sm border-l-2 border-transparent hover:border-[#FFE600]">
             <span>⚙️</span> Process RFP
          </Link>
        </nav>

        <div className="mt-auto p-8 border-t border-[#3D3D4D]">
          <div className="text-[#C4C4CD] text-xs leading-relaxed">
            © 2025 Ernst & Young Global Limited.<br/>
            All Rights Reserved.
          </div>
        </div>
      </aside>

      {/* Main Content - Professional Grey */}
      <main className="flex-1 overflow-auto bg-[#F0F0F2] text-[#2E2E38]">
        {children}
      </main>
    </div>
  );
}
