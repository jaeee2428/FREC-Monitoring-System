import { useState } from "react";
import { StatCard } from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { XCircleIcon, ArrowRightCircleIcon, CheckCircleIcon } from "../../components/icons.jsx";
import ModeBadge from "../../components/ModeBadge.jsx";
import DriveLinkButton from "../../components/DriveLinkButton.jsx";

// Reusable Interactive Mode Switch Buttons (Unified Maroon Theme)
function ModeButton({ mode, active, onClick }) {
    const getActiveStyle = () => {
        if (!active) return "border-slate-300 bg-white text-slate-600 hover:border-slate-400";
        // All active modes use brand maroon for visual consistency
        return "border-[#7a1f2b] bg-[#7a1f2b] text-white shadow-sm";
    };

    return (
        <button
            onClick={onClick}
            className={`rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${getActiveStyle()}`}
        >
            Mode {mode}
        </button>
    );
}



export default function ProgramChairApprovals({ submissions, onApprove, onDisapprove, onSetMode }) {
    const [filter, setFilter] = useState("All");

    // Stat Count Calculations
    const pendingList = submissions.filter((s) => s.status === "AWAITING_CHAIR_REVIEW");
    const actionedList = submissions.filter((s) => s.status === "COMPLETED" || s.status === "FORWARDED-DEAN");
    const disapprovedList = submissions.filter((s) => s.status === "DISAPPROVED");

    const pendingCount = pendingList.length;
    const actionedCount = actionedList.length;
    const disapprovedCount = disapprovedList.length;

    // Filter Logic
    const getFilteredSubmissions = () => {
        if (filter === "Pending") return pendingList;
        if (filter === "Actioned") return actionedList;
        if (filter === "Disapproved") return disapprovedList;
        return submissions; // "All"
    };

    const filteredSubmissions = getFilteredSubmissions();

    return (
        <div className="space-y-6">
            {/* Stat Cards Header */}
            <div className="flex gap-4">
                <StatCard label="PENDING ACTION" value={pendingCount} valueColor="text-[#7a1f2b]" />
                <StatCard label="ACTIONED" value={actionedCount} valueColor="text-emerald-600" />
                <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
            </div>

            {/* Filter Navigation and Record Count */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {["All", "Pending", "Actioned", "Disapproved"].map((tab) => {
                        const isActive = filter === tab;
                        const activeStyle = isActive
                            ? "bg-[#7a1f2b] text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50";

                        return (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${activeStyle}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                    {filteredSubmissions.length} record{filteredSubmissions.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Approvals Table/List Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <h2 className="!text-sm !font-semibold !text-slate-800">
                        {filter} Approvals Queue
                    </h2>
                </div>

                {filteredSubmissions.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-400">
                        No submissions found matching the "{filter}" filter.
                    </div>
                ) : (
                    filteredSubmissions.map((sub, idx) => {
                        const isPending = sub.status === "AWAITING_CHAIR_REVIEW";

                        return (
                            <div
                                key={sub.id}
                                className="flex items-center justify-between px-5 py-5 border-b border-slate-50 last:border-0"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {idx + 1}. {sub.title}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {sub.student} · {sub.studentNo} · {sub.program}
                                    </p>

                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                        <span>ID: {sub.id}</span>
                                        <span>·</span>
                                        <ModeBadge mode={sub.mode} />
                                    </div>

                                    {/* Drive Link */}
                                    {sub.driveLink && (
                                        <div className="mt-2">
                                            <DriveLinkButton driveLink={sub.driveLink} />
                                        </div>
                                    )}

                                    {/* Switch Mode Controls: Only interactive if the document is still pending review */}
                                    {isPending && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-500">Switch Mode:</span>
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
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <StatusBadge status={sub.status} />

                                    {/* Actions Container: Only show action buttons if state is pending */}
                                    {isPending && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onDisapprove(sub.id)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <XCircleIcon size={14} /> Disapprove
                                            </button>

                                            {sub.mode === 1 ? (
                                                <button
                                                    onClick={() => onApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <CheckCircleIcon size={14} /> Approve & Complete
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-[#7a1f2b] hover:bg-[#5a121d] text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <ArrowRightCircleIcon size={14} /> Approve & Forward
                                                </button>
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