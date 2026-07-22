import { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import ModeBadge from "./ModeBadge";
import DriveLinkButton from "./DriveLinkButton";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FILTERS = ["All", "Active", "Completed", "Disapproved"];

const SpinnerIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

function matchesFilter(doc, filter) {
    if (filter === "All") return true;
    if (filter === "Disapproved") return doc.status === "DISAPPROVED";
    if (filter === "Completed") return doc.status === "APPROVED" || doc.status === "COMPLETED";
    return doc.status !== "DISAPPROVED" && doc.status !== "APPROVED" && doc.status !== "COMPLETED";
}

export default function AllDocumentsView({ role = null }) {
    const [filter, setFilter] = useState("All");
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            setError(null);
            try {
                // IT Admin sees all docs; roles see their filtered set
                const url = role ? `${API}/api/documents?role=${encodeURIComponent(role)}` : `${API}/api/documents`;
                const res = await fetch(url);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch documents");

                setDocuments(
                    data.documents.map((d) => ({
                        id: d.id,
                        docId: d.id,
                        title: d.title,
                        student: d.student || "—",
                        studentNo: "",
                        adviser: d.adviser || "—",
                        mode: d.mode,
                        status: d.status,
                        dateUpdated: d.updatedDate ? d.updatedDate.split("T")[0] : "",
                        driveLink: d.driveLink || null,
                    }))
                );
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [role]);

    const filtered = documents.filter((doc) => matchesFilter(doc, filter));

    return (
        <div>
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
                    {loading ? (
                        <div className="flex items-center justify-center px-5 py-12 text-sm text-slate-400">
                            <SpinnerIcon size={14} className="mr-2" /> Loading documents…
                        </div>
                    ) : error ? (
                        <div className="px-5 py-10 text-center text-sm text-red-600">
                            Error: {error}
                        </div>
                    ) : (
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
                                    <th className="px-5 py-3">Drive Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-10 text-center text-sm text-slate-400">
                                            No documents match this filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((doc, idx) => (
                                        <tr key={doc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                                            <td className="px-5 py-4 text-slate-500">{idx + 1}</td>
                                            <td className="px-5 py-4 font-mono text-xs text-slate-500">{doc.docId}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-800">{doc.title}</td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-800">{doc.student}</div>
                                                {doc.studentNo && (
                                                    <div className="text-xs text-slate-400">{doc.studentNo}</div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">{doc.adviser}</td>
                                            <td className="px-5 py-4">
                                                {doc.mode ? (
                                                    <ModeBadge mode={doc.mode} />
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={doc.status} />
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">{doc.dateUpdated}</td>
                                            <td className="px-5 py-4">
                                                {doc.driveLink ? (
                                                    <DriveLinkButton driveLink={doc.driveLink} compact />
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
