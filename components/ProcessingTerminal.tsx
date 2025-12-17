"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Terminal } from "lucide-react";

const logs = [
  "Initializing TenderFlow Core v2.4.0...",
  "Loading PDF parser module...",
  "Extracting text layers from document...",
  "Identifying document structure (Header, Body, Footer)...",
  "Detected Industry: Electrical & Infrastructure",
  "Loading industry-specific ontology...",
  "Vectorizing extracted line items...",
  "Connecting to Inventory Database (AWS RDS)...",
  "Calculating cosine similarity for 4 items...",
  "Match found: High Voltage Cable (Confidence: 98%)",
  "Match found: Industrial Circuit Breaker (Confidence: 95%)",
  "Partial match: Safety Gloves (Confidence: 75%)",
  "No match: Transformer Model Z (Confidence: 12%)",
  "Generating pricing model...",
  "Finalizing quote...",
  "Process complete.",
];

export default function ProcessingTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logs.length) {
        setLines((prev) => [...prev, logs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 150); // Speed of logs

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full overflow-hidden rounded-lg border border-border bg-zinc-950 font-mono text-sm shadow-inner"
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <Terminal className="h-4 w-4 text-zinc-400" />
        <span className="text-zinc-400">TenderFlow Processing Unit</span>
        <div className="ml-auto flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
        </div>
      </div>
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto p-4 text-green-500/90"
      >
        {lines.map((line, i) => (
          <div key={i} className="mb-1">
            <span className="mr-2 text-zinc-600">
              [{new Date().toLocaleTimeString()}]
            </span>
            <span className="typing-effect">{line}</span>
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </motion.div>
  );
}
