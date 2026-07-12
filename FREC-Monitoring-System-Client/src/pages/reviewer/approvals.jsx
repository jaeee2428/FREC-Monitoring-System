import { useState } from "react";
import { StatCard } from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { XCircleIcon, ArrowRightCircleIcon, CheckCircleIcon } from "../../components/icons.jsx";

function ModeBadge() {
    return <span className="rounded border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">Mode 3</span>;
}

export default function ReviewerApprovals({ submissions, onApprove, onDisapprove }) {
    const [filter, setFilter] = useState("All");

    const pendingList = submissions.filter((s) => s.status === "DEAN ENDORSED");
    const reviewList = submissions.filter((s) => s.status === "FOR REVIEW");
    const completedList = submissions.filter((s) => s.status === "COMPLETED");
    const disapprovedList = submissions.filter((s) => s.status === "DISAPPROVED");

    const getFiltered = () => {
        if (filter === "Pending") return pendingList;
        if (filter === "For Review") return reviewList;
        if (filter === "Completed") return completedList;
        if (filter === "Disapproved") return disapprovedList;
        return submissions;
    };

    const filtered = getFiltered();

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <StatCard label="PENDING REVIEW" value={pendingList.length} valueColor="text-[#7a1f2b]" />
                <StatCard label="IN REVIEW" value={reviewList.length} valueColor="text-amber-600" />
                <StatCard label="COMPLETED" value={completedList.length} valueColor="text-emerald-600" />
                <StatCard label="DISAPPROVED" value={disapprovedList.length} valueColor="text-red-600" />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {["All", "Pending", "For Review", "Completed", "Disapproved"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                                filter === tab ? "bg-[#7a1f2b] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <h2 className="!text-sm !font-semibold !text-slate-800">{filter} Queue</h2>
                </div>

                {filtered.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-400">
                        No submissions found matching the "{filter}" filter.
                    </div>
                ) : (
                    filtered.map((sub, idx) => {
                        const isPending = sub.status === "DEAN ENDORSED";
                        const isInReview = sub.status === "FOR REVIEW";
                        const showActions = isPending || isInReview;

                        return (
                            <div key={sub.id} className="flex items-center justify-between px-5 py-5 border-b border-slate-50 last:border-0">
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
                                        <ModeBadge />
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <StatusBadge status={sub.status} />
                                    {showActions && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onDisapprove(sub.id)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <XCircleIcon size={14} /> Disapprove
                                            </button>
                                            {isPending ? (
                                                <button
                                                    onClick={() => onApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <ArrowRightCircleIcon size={14} /> Accept for Review
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <CheckCircleIcon size={14} /> Confirm FICS FREC
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
