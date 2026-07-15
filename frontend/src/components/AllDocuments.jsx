import React, { useState } from "react";
import StatusBadge from "./StatusBadge";

const FILTERS = ["All", "Active", "Completed", "Disapproved"];

function matchesFilter(doc, filter) {
    if (filter === "All") return true;
    if (filter === "Disapproved") return doc.status === "DISAPPROVED";
    if (filter === "Completed") return doc.status === "APPROVED" || doc.status === "COMPLETED";
    return doc.status !== "DISAPPROVED" && doc.status !== "APPROVED" && doc.status !== "COMPLETED";
}

export default function AllDocumentsView({ documents = [] }) {
    const [filter, setFilter] = useState("All");

    const filtered = documents.filter((doc) => matchesFilter(doc, filter));

    return (
        <div>
            <h1 className="!m-0 !mb-4 !text-lg !font-bold !text-slate-800">All Documents</h1>

            <div className="rounded-xl border border-slate-200 bg-white">
                {/* Filter tabs */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <div className="flex gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f
                                    ? "bg-[#7a1f2b] text-white"
                                    : "bg-white text-slate-600 border border-slate-300 hover:border-[#7a1f2b] hover:text-[#7a1f2b]"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-slate-400">{filtered.length} records</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                                <th className="px-5 py-3">No.</th>
                                <th className="px-5 py-3">Document ID</th>
                                <th className="px-5 py-3">Title</th>
                                <th className="px-5 py-3">Student</th>
                                <th className="px-5 py-3">Adviser</th>
                                <th className="px-5 py-3">Mode</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Date Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">
                                        No documents match this filter.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((doc, idx) => (
                                    <tr key={doc.id} className="border-b border-slate-50 last:border-0">
                                        <td className="px-5 py-4 text-slate-500">{idx + 1}</td>
                                        <td className="px-5 py-4 font-mono text-xs text-slate-500">{doc.docId}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-800">{doc.title}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-slate-800">{doc.student}</div>
                                            <div className="text-xs text-slate-400">{doc.studentNo}</div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{doc.adviser}</td>
                                        <td className="px-5 py-4">
                                            {doc.mode ? (
                                                <span className={{ 1: "text-purple-800", 2: "text-blue-800", 3: "text-amber-900" }[doc.mode]}>
                                                    Mode {doc.mode}
                                                </span>
                                            ) : (
                                                <span className="text-slate-800">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={doc.status} />
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{doc.dateUpdated}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}