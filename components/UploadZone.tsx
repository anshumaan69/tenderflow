"use client";

import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

export default function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <div className={cn(
          "mb-4 rounded-full p-4 transition-colors",
          isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Upload className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-xl font-semibold tracking-tight">
          Upload RFP Document
        </h3>
        <p className="mb-6 text-center text-sm text-muted-foreground max-w-xs">
          Drag and drop your PDF here, or click to browse.
          <br />
          Supports .pdf files up to 50MB.
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-md active:scale-95"
        >
          Select File
        </label>

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
            <p className="text-xl font-bold text-primary">Drop to Upload</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
