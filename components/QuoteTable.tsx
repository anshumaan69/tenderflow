"use client";

import { motion } from "framer-motion";
import { Check, AlertTriangle, X, Download, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: "match" | "mismatch" | "partial";
  confidence?: number;
  notes?: string;
}

interface QuoteTableProps {
  items: QuoteItem[];
}

export default function QuoteTable({ items }: QuoteTableProps) {
  const totalCost = items.reduce((acc, item) => acc + item.total, 0);

  const handleExportCSV = () => {
    const headers = ["Item Name", "Quantity", "Unit Price", "Total", "Status", "Confidence", "Notes"];
    const csvContent = [
      headers.join(","),
      ...items.map(item => 
        [
          `"${item.name}"`,
          item.quantity,
          item.unitPrice,
          item.total,
          item.status,
          `${item.confidence || 0}%`,
          `"${item.notes || ""}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tenderflow_quote.csv";
    link.click();
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tenderflow_quote.json";
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
        <h3 className="text-lg font-semibold tracking-tight">Generated Quote</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <FileJson className="h-3 w-3" />
            JSON
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Item Name</th>
              <th className="px-6 py-3 font-medium text-right">Confidence</th>
              <th className="px-6 py-3 font-medium text-right">Qty</th>
              <th className="px-6 py-3 font-medium text-right">Unit Price</th>
              <th className="px-6 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {items.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-muted/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {item.status === "match" && (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                        <Check className="mr-1 h-3 w-3" /> Match
                      </span>
                    )}
                    {item.status === "mismatch" && (
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-600/20">
                        <X className="mr-1 h-3 w-3" /> Mismatch
                      </span>
                    )}
                    {item.status === "partial" && (
                      <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 ring-1 ring-inset ring-yellow-600/20">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Partial
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-foreground">
                  {item.name}
                  {item.notes && (
                    <div className="mt-1 text-xs text-red-500">{item.notes}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          (item.confidence || 0) > 90
                            ? "bg-green-500"
                            : (item.confidence || 0) > 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        )}
                        style={{ width: `${item.confidence || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{item.confidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-muted-foreground">{item.quantity}</td>
                <td className="px-6 py-4 text-right text-muted-foreground">
                  ${item.unitPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-medium text-foreground">
                  ${item.total.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/50 border-t border-border">
            <tr>
              <td colSpan={5} className="px-6 py-4 text-right font-semibold text-foreground">
                Grand Total
              </td>
              <td className="px-6 py-4 text-right text-lg font-bold text-foreground">
                ${totalCost.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
}
