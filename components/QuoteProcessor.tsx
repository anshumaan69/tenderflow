"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadZone from "./UploadZone";
import QuoteTable, { QuoteItem } from "./QuoteTable";
import DocumentList from "./DocumentList";
import ProcessingTerminal from "./ProcessingTerminal";
import ProcessingTimeline from "./ProcessingTimeline";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

type AppState = "idle" | "uploading" | "processing" | "results";

export default function QuoteProcessor() {
  const [state, setState] = useState<AppState>("idle");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [industry, setIndustry] = useState<string>("");

  const handleUpload = async (file: File) => {
    setState("uploading");
    
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setState("processing");

    try {
      const response = await fetch("/api/process", {
        method: "POST",
      });
      const data = await response.json();
      setItems(data.items);
      setIndustry(data.industry);
      setState("results");
    } catch (error) {
      console.error("Processing failed", error);
      setState("idle");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full flex-col gap-8"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight">New Quote Request</h2>
              <p className="text-muted-foreground">
                Upload your RFP document to automatically extract line items and generate a quote.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <UploadZone onUpload={handleUpload} />
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Recent Documents</h3>
              <DocumentList />
            </div>
          </motion.div>
        )}

        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Uploading Document...</p>
          </motion.div>
        )}

        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full flex-col gap-8"
          >
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-bold tracking-tight">Processing RFP</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <ProcessingTimeline />
              </div>
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden">
                <ProcessingTerminal />
              </div>
            </div>
          </motion.div>
        )}

        {state === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full flex-col gap-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Analysis Complete
                </div>
                <div className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                  Industry: <span className="text-foreground font-semibold">{industry}</span>
                </div>
              </div>
              
              <button
                onClick={() => setState("idle")}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                Process Another
              </button>
            </div>
            
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <QuoteTable items={items} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
