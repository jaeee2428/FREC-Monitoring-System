import React from "react";

export function StatCard({ label, value, valueColor = "text-slate-800" }) {
    return (
        <div className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-5 font-mono shadow-sm">
            <p className="text-[13px] tracking-widest text-slate-500">
                {label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
    );
}
