"use client";

import { motion } from "framer-motion";
import { FileText, Building2, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  company: string;
  industry: string;
  date: string;
  status: "completed" | "pending" | "failed";
  value: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "RFP-2024-001-Cables.pdf",
    company: "Global Infra Corp",
    industry: "Electrical",
    date: "2024-03-10",
    status: "completed",
    value: "$125,000",
  },
  {
    id: "2",
    name: "Tender_Construction_Phase2.pdf",
    company: "BuildRight Solutions",
    industry: "Construction",
    date: "2024-03-12",
    status: "completed",
    value: "$450,000",
  },
  {
    id: "3",
    name: "IT_Hardware_Supply.pdf",
    company: "TechStream Systems",
    industry: "IT & Hardware",
    date: "2024-03-14",
    status: "pending",
    value: "-",
  },
  {
    id: "4",
    name: "Hospital_Equipment_Q1.pdf",
    company: "MediCare Plus",
    industry: "Healthcare",
    date: "2024-03-15",
    status: "completed",
    value: "$85,000",
  },
];

export default function DocumentList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
          <div className="col-span-4">Document</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Value</div>
          <div className="col-span-1 text-right">Status</div>
        </div>
        <div className="divide-y divide-border">
          {mockDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="group grid cursor-pointer grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {doc.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{doc.industry}</div>
                </div>
              </div>
              <div className="col-span-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {doc.company}
              </div>
              <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {doc.date}
              </div>
              <div className="col-span-2 flex items-center text-sm font-medium text-foreground">
                {doc.value}
              </div>
              <div className="col-span-1 flex items-center justify-end">
                {doc.status === "completed" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {doc.status === "pending" && (
                  <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                )}
                {doc.status === "failed" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
