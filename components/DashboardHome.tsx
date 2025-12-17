"use client";

import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Plus
} from "lucide-react";

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const stats = [
    { label: "Total Quotes", value: "1,234", change: "+12%", icon: FileText, color: "text-blue-600" },
    { label: "Processed Today", value: "42", change: "+5%", icon: Clock, color: "text-amber-500" },
    { label: "Success Rate", value: "98.5%", change: "+0.2%", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Avg. Turnaround", value: "1.2s", change: "-15%", icon: TrendingUp, color: "text-indigo-500" },
  ];

  const recentActivity = [
    { id: 1, file: "RFP_Q4_Logistics.pdf", status: "Completed", date: "2 mins ago", amount: "$12,450" },
    { id: 2, file: "Server_Procurement_2025.docx", status: "Processing", date: "5 mins ago", amount: "-" },
    { id: 3, file: "Office_Supplies_Bulk.pdf", status: "Completed", date: "1 hour ago", amount: "$3,200" },
    { id: 4, file: "Network_Infrastructure_Upgrade.pdf", status: "Failed", date: "3 hours ago", amount: "-" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, User</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your quotes today.</p>
        </div>
        <button 
          onClick={() => onNavigate("processor")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Plus size={18} />
          New Quote
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg bg-slate-50 ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {stat.change} <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-3xl font-bold tracking-tight mt-1 text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                      <FileText className="h-5 w-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none text-slate-900 group-hover:text-blue-700 transition-colors">{item.file}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">{item.amount}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      item.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      item.status === "Processing" ? "bg-blue-50 text-blue-600 border-blue-100" :
                      "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions / Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">System Status</h3>
          </div>
          <div className="p-6 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">API Latency</span>
                <span className="font-semibold text-emerald-600">45ms</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[95%] rounded-full" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Processing Queue</span>
                <span className="font-semibold text-slate-700">Idle</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-500 w-[5%] rounded-full" />
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mt-6">
              <h4 className="text-sm font-bold text-blue-900 mb-2">Pro Tip</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                You can drag and drop multiple PDF files at once to batch process your RFPs. Use the bulk uploader for more than 10 files.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
