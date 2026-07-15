import React, { useState } from "react";
import StatusBadge from "../../components/StatusBadge.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import { XCircleIcon, ArrowRightCircleIcon, CheckCircleIcon } from "../../components/icons.jsx";

const FILTERS = ["All", "Pending", "Actioned", "Disapproved"];

function matchesFilter(sub, filter) {
    if (filter === "All") return true;
    if (filter === "Pending") return sub.status === "AWAITING_CHAIR_REVIEW";
    if (filter === "Actioned") return sub.status === "FORWARDED-DEAN" || sub.status === "COMPLETED";
    if (filter === "Disapproved") return sub.status === "DISAPPROVED";
    return true;
}

export default function ProgramChairApprovalsView({ submissions, onApprove, onDisapprove }) {
    const [filter, setFilter] = useState("All");

    const pendingCount = submissions.filter((s) => s.status === "AWAITING_CHAIR_REVIEW").length;
    const actionedCount = submissions.filter((s) => s.status === "FORWARDED-DEAN" || s.status === "COMPLETED").length;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length;

    const filtered = submissions.filter((s) => matchesFilter(s, filter));

    return (
        <div>
            <h1 className="!m-0 !mb-5 !text-lg !font-bold !text-slate-800">Approvals Queue</h1>

            {/* Summary stat cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="PENDING ACTION" value={pendingCount} valueColor="text-[#7a1f2b]" />
                <StatCard label="ACTIONED" value={actionedCount} valueColor="text-emerald-600" />
                <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
            </div>

            {/* Filter tabs */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f
                                ? "bg-[#7a1f2b] text-white"
                                : "border border-slate-300 bg-white text-slate-600 hover:border-[#7a1f2b] hover:text-[#7a1f2b]"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-slate-400">
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Submissions list */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                {filtered.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-400">
                        No submissions match this filter.
                    </div>
                ) : (
                    filtered.map((sub, idx) => {
                        const isPending = sub.status === "AWAITING_CHAIR_REVIEW";
                        return (
                            <div
                                key={sub.id}
                                className={`flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between ${idx < filtered.length - 1 ? "border-b border-slate-100" : ""
                                    }`}
                            >
                                {/* Left Side Info */}
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 m-0">{sub.title}</p>
                                        <p className="mt-1 text-xs text-slate-500 m-0">
                                            {sub.student} · {sub.studentNo} · {sub.program}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                ID: {sub.id}
                                            </span>
                                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                Submitted: {sub.submitted}
                                            </span>
                                            {/* Pre-assigned Mode Tag */}
                                            <span className="rounded border border-[#e6b8bd] bg-[#fbe9e7] px-2 py-0.5 text-[10px] font-bold text-[#7a1f2b]">
                                                MODE {sub.mode}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side Actions */}
                                <div className="flex shrink-0 items-center gap-3 self-end md:self-center">
                                    {isPending ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onDisapprove(sub.id)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <XCircleIcon size={13} /> Disapprove
                                            </button>
                                            <button
                                                onClick={() => onApprove(sub.id, sub.mode)}
                                                className="flex items-center gap-1.5 rounded-md bg-[#7a1f2b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5a121d] transition-colors"
                                            >
                                                <ArrowRightCircleIcon size={13} /> 
                                                {sub.mode === 1 ? "Approve (Complete)" : "Approve & Forward"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            {sub.status === "COMPLETED" && (
                                                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                                                    <CheckCircleIcon size={14} className="text-emerald-600" /> Completed (Mode 1 Approved)
                                                </span>
                                            )}
                                            {sub.status === "FORWARDED-DEAN" && (
                                                <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                                                    <ArrowRightCircleIcon size={14} className="text-blue-600" /> Forwarded to Dean (Mode 2)
                                                </span>
                                            )}
                                            {sub.status === "DISAPPROVED" && (
                                                <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 border border-red-200">
                                                    <XCircleIcon size={14} className="text-red-600" /> Disapproved
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}