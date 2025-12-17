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
    { label: "Total Quotes", value: "1,234", change: "+12%", icon: FileText, color: "text-blue-500" },
    { label: "Processed Today", value: "42", change: "+5%", icon: Clock, color: "text-orange-500" },
    { label: "Success Rate", value: "98.5%", change: "+0.2%", icon: CheckCircle2, color: "text-green-500" },
    { label: "Avg. Turnaround", value: "1.2s", change: "-15%", icon: TrendingUp, color: "text-purple-500" },
  ];

  const recentActivity = [
    { id: 1, file: "RFP_Q4_Logistics.pdf", status: "Completed", date: "2 mins ago", amount: "$12,450" },
    { id: 2, file: "Server_Procurement_2025.docx", status: "Processing", date: "5 mins ago", amount: "-" },
    { id: 3, file: "Office_Supplies_Bulk.pdf", status: "Completed", date: "1 hour ago", amount: "$3,200" },
    { id: 4, file: "Network_Infrastructure_Upgrade.pdf", status: "Failed", date: "3 hours ago", amount: "-" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, ey_techathon</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your quotes today.</p>
        </div>
        <button 
          onClick={() => onNavigate("processor")}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Plus size={16} />
          New Quote
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-muted ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                {stat.change} <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-4 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{item.file}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{item.amount}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      item.status === "Completed" ? "bg-green-500/10 text-green-500" :
                      item.status === "Processing" ? "bg-blue-500/10 text-blue-500" :
                      "bg-red-500/10 text-red-500"
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
          className="col-span-3 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold">System Status</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Latency</span>
                <span className="font-medium text-green-500">45ms</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500 w-[95%]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing Queue</span>
                <span className="font-medium">Idle</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-500 w-[5%]" />
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 mt-4">
              <h4 className="text-sm font-medium mb-2">Did you know?</h4>
              <p className="text-xs text-muted-foreground">
                You can drag and drop multiple PDF files at once to batch process your RFPs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
