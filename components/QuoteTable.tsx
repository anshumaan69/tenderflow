"use client";

import { motion } from "framer-motion";
import { Download, FileJson, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

export interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: "match" | "mismatch" | "partial";
  confidence: number;
  notes?: string;
  top3?: { id: string; name: string; score: number; specs: any }[];
  reqSpecs?: any;
}

interface QuoteTableProps {
  items: QuoteItem[];
}

export default function QuoteTable({ items }: QuoteTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h3 className="text-lg font-semibold tracking-tight text-slate-800">Generated Quote</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 text-slate-700"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 text-slate-700"
          >
            <FileJson className="h-3 w-3" />
            JSON
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
            <tr>
              <th className="p-4 w-[400px]">Item Description</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4">Match Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <tr 
                    className={`group transition-all hover:bg-slate-50 cursor-pointer ${expandedId === item.id ? 'bg-blue-50/30' : ''}`}
                    onClick={() => toggleExpand(item.id)}
                >
                  <td className="p-4 align-top">
                    <div className="font-bold text-slate-900 text-base">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1">{item.id}</div> 
                    {item.notes && (
                      <div className="mt-2 text-xs text-slate-500 bg-slate-100 p-2 rounded-md inline-block max-w-[300px]">
                        ℹ️ {item.notes}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top text-slate-700 font-medium">{item.quantity}</td>
                  <td className="p-4 align-top text-slate-700">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="p-4 align-top text-right font-bold text-slate-900 font-mono">₹{item.total.toLocaleString()}</td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border w-fit ${
                          item.status === 'match' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : item.status === 'partial'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                        
                         {/* Confidence Bar */}
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${
                                    item.confidence > 90 ? 'bg-emerald-500' : 
                                    item.confidence > 70 ? 'bg-amber-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${item.confidence}%` }}
                            />
                         </div>
                         <div className="text-[10px] text-slate-400 font-medium">Confidence: {item.confidence}%</div>
                    </div>
                  </td>
                  <td className="p-4 align-top text-center">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
                        {expandedId === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </td>
                </tr>

                {expandedId === item.id && (
                  <tr>
                    <td colSpan={7} className="p-0 border-b border-blue-100 bg-slate-50/50">
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-6"
                        >
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">AI</span>
                                Analyzed Top 3 Recommendations
                            </h4>
                            
                            <div className="grid grid-cols-4 gap-4 text-xs">
                                {/* Requirement Column */}
                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2 uppercase tracking-wide">RFP Requirement</div>
                                    <div className="space-y-2">
                                        {Object.entries(item.reqSpecs || {}).map(([key, val]: any) => (
                                          <div key={key} className="flex justify-between">
                                            <span className="text-slate-500 capitalize">{key}:</span>
                                            <span className="font-semibold text-slate-900 text-right">{val}</span>
                                          </div>  
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Top 3 Products */}
                                {item.top3?.map((prod, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border shadow-sm relative overflow-hidden ${idx === 0 ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200 opacity-80'}`}>
                                        {idx === 0 && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">BEST MATCH</div>}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-800 text-sm">{prod.name}</span>
                                            <div className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{prod.score.toFixed(0)}%</div>
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                            {Object.entries(item.reqSpecs || {}).map(([key]: any) => {
                                                const match = prod.specs[key]?.toString().toLowerCase().includes(item.reqSpecs[key]?.toString().toLowerCase());
                                                return (
                                                  <div key={key} className="flex justify-between items-center">
                                                    <span className="text-slate-400 capitalize">{key}</span>
                                                    <span className={`font-medium ${match ? 'text-emerald-600' : 'text-red-400 line-through'}`}>
                                                        {prod.specs[key] || '-'}
                                                    </span>
                                                  </div>
                                                );
                                            })}
                                        </div>
                                        {idx === 0 && (
                                            <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs font-bold transition-colors shadow-sm">
                                                Select & Lock
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        
                        </motion.div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={3} className="p-4 text-right font-semibold text-slate-700">
                Grand Total
              </td>
              <td className="p-4 text-right text-lg font-bold text-slate-900 border-t-2 border-slate-300">
                ₹{totalCost.toLocaleString()}
              </td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
}
