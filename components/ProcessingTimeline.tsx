"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FileUp, ScanText, BrainCircuit, Database, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Upload", icon: FileUp },
  { id: 2, label: "OCR Scan", icon: ScanText },
  { id: 3, label: "Context Analysis", icon: BrainCircuit },
  { id: 4, label: "Inventory Match", icon: Database },
  { id: 5, label: "Quote Ready", icon: FileCheck },
];

export default function ProcessingTimeline() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600); // Sync roughly with the 3s total processing time

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step) => {
          const isActive = step.id <= activeStep;
          const isCurrent = step.id === activeStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-4">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isActive ? "var(--color-primary)" : "var(--color-background)",
                  borderColor: isActive ? "var(--color-primary)" : "var(--color-border)",
                }}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
                style={{
                  backgroundColor: isActive ? "hsl(var(--primary))" : "hsl(var(--background))",
                  borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
                }}
              >
                <Icon className="h-5 w-5" />
                {isCurrent && (
                  <motion.div
                    layoutId="pulse-ring"
                    className="absolute inset-0 -z-10 rounded-full bg-primary/30"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
