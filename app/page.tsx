"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHome from "@/components/DashboardHome";
import QuoteProcessor from "@/components/QuoteProcessor";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && <DashboardHome onNavigate={setActiveTab} />}
      {activeTab === "processor" && <QuoteProcessor />}
      {activeTab === "history" && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          History module coming soon
        </div>
      )}
      {activeTab === "settings" && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Settings module coming soon
        </div>
      )}
    </DashboardLayout>
  );
}
