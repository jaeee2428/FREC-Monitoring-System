import { useState } from "react";
import StatusBadge from "../../components/StatusBadge.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import { XCircleIcon, ArrowRightCircleIcon, CheckCircleIcon } from "../../components/icons.jsx";

const FILTERS = ["All", "Pending", "Forwarded to FREC", "Disapproved"];

function ModeButton({ mode, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${active
                ? "border-[#7a1f2b] bg-[#7a1f2b] text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-[#7a1f2b] hover:text-[#7a1f2b]"
                }`}
        >
            Mode {mode}
        </button>
    );
}

function matchesFilter(sub, filter) {
    if (filter === "All") return true;
    if (filter === "Pending") return sub.status === "SUBMITTED";
    if (filter === "Forwarded to FREC") return sub.status === "FORWARDED-FREC";
    if (filter === "Disapproved") return sub.status === "DISAPPROVED";
    return true;
}

export default function AdviserApprovalsView({ submissions, onApprove, onDisapprove, onSetMode }) {
    const [filter, setFilter] = useState("All");

    const pendingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
    const forwardedCount = submissions.filter((s) => s.status === "FORWARDED-FREC").length;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length;

    const filtered = submissions.filter((s) => matchesFilter(s, filter));

    return (
        <div>
            {/* Summary stat cards */}
            <div className="mb-6 flex gap-4">
                <StatCard label="PENDING REVIEW" value={pendingCount} valueColor="text-[#7a1f2b]" />
                <StatCard label="FORWARDED TO FREC" value={forwardedCount} valueColor="text-violet-600" />
                <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
            </div>

            {/* Filter tabs + count */}
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
            <div className="rounded-xl border border-slate-200 bg-white">
                {filtered.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-400">
                        No submissions match this filter.
                    </div>
                ) : (
                    filtered.map((sub, idx) => {
                        const isPending = sub.status === "SUBMITTED";
                        return (
                            <div
                                key={sub.id}
                                className={`flex items-start justify-between px-5 py-4 ${idx < filtered.length - 1 ? "border-b border-slate-100" : ""
                                    }`}
                            >
                                {/* Left */}
                                <div className="flex gap-4">
                                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{sub.title}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {sub.student} · {sub.studentNo} · {sub.program}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {sub.id} · Submitted {sub.submitted}
                                        </p>

                                        {/* Mode selector */}
                                        {isPending && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-500">Mode:</span>
                                                {[1, 2, 3].map((m) => (
                                                    <ModeButton
                                                        key={m}
                                                        mode={m}
                                                        active={sub.mode === m}
                                                        onClick={() => onSetMode(sub.id, m)}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Show selected mode badge for non-pending */}
                                        {!isPending && sub.mode && (
                                            <div className="mt-2">
                                                <span className="inline-block rounded-md border border-[#e6b8bd] bg-[#fbe9e7] px-2.5 py-0.5 text-xs font-medium text-[#7a1f2b]">
                                                    Mode {sub.mode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <StatusBadge status={sub.status} />

                                    {isPending && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onDisapprove(sub.id)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <XCircleIcon size={13} /> Disapprove
                                            </button>
                                            <button
                                                onClick={() => onApprove(sub.id)}
                                                disabled={!sub.mode}
                                                title={!sub.mode ? "Select a Mode before approving" : undefined}
                                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm ${
                                                    sub.mode
                                                        ? "bg-[#7a1f2b] text-white hover:bg-[#5a121d] cursor-pointer"
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                                                }`}
                                            >
                                                <ArrowRightCircleIcon size={13} /> Approve → FREC
                                            </button>
                                        </div>
                                    )}

                                    {sub.status === "FORWARDED-FREC" && (
                                        <span className="flex items-center gap-1 text-xs text-violet-600">
                                            <CheckCircleIcon size={12} /> Forwarded
                                        </span>
                                    )}

                                    {sub.status === "DISAPPROVED" && (
                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                            <XCircleIcon size={12} /> Disapproved
                                        </span>
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
