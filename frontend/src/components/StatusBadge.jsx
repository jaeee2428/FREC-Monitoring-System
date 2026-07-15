import React from "react";

const STATUS_STYLES = {
    SUBMITTED: "bg-slate-100 text-slate-600",
    "FORWARDED-FREC": "bg-violet-100 text-violet-700",
    "CERT GENERATED": "bg-emerald-100 text-emerald-700",
    "FOR REVIEW": "bg-amber-100 text-amber-700",
    DISAPPROVED: "bg-red-100 text-red-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    FORWARDED: "bg-violet-100 text-violet-700",
    "ADVISER APPROVED": "bg-emerald-100 text-emerald-700",
    "DEAN ENDORSED": "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    "AWAITING_CHAIR_REVIEW": "bg-yellow-100 text-yellow-800 border border-yellow-200", 
    "FORWARDED-DEAN": "bg-orange-100 text-orange-700 border border-orange-200",
};

export default function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
    return (
        <span
            className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${style}`}
        >
            {status}
        </span>
    );
}
