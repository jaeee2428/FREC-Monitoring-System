import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AllDocuments from "../../components/AllDocuments.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import DriveLinkButton from "../../components/DriveLinkButton.jsx";
import DisapproveModal from "../../components/DisapproveModal.jsx";
import {
    CheckCircleIcon,
    XCircleIcon,
    ArrowRightCircleIcon,
    InfoIcon,
    HomeIcon,
    FileTextIcon,
    RotateIcon,
} from "../../components/icons.jsx";
import AdviserApprovals from "./approvals.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SpinnerIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

function ModeButton({ mode, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${active
                ? "border-[#7a1f2b] bg-[#7a1f2b] text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-[#7a1f2b] hover:text-[#7a1f2b]"
                }`}
        >
            Mode {mode}
        </button>
    );
}

// Shape an API document into the local submission shape
function toSubmission(d) {
    return {
        id: d.id,
        title: d.title,
        student: d.student || "—",
        studentNo: "",
        program: "",
        submitted: d.submittedDate ? d.submittedDate.split("T")[0] : "",
        status: d.status,
        mode: d.mode || null,
        driveLink: d.driveLink || null,
    };
}

export default function AdviserDashboard({ user = { name: "Dr. Elena Reyes", initials: "DE" }, onLogout = () => { }, view, setView }) {
    const [activeTab, setActiveTab] = useState(0);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [toastType, setToastType] = useState("success");
    const [disapproving, setDisapproving] = useState(null);

    const pendingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
    const forwardedCount = submissions.filter((s) => s.status === "FORWARDED-FREC").length;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length;

    const showToast = (message, type = "success") => {
        setToast(message);
        setToastType(type);
        window.setTimeout(() => setToast(null), 2500);
    };

    // ── Fetch submissions assigned to this adviser ─────────────────────────
    const fetchSubmissions = async (id) => {
        setLoading(true);
        try {
            // Fetch all SUBMITTED docs (visible to any adviser) plus docs assigned to this adviser
            const params = new URLSearchParams({ role: 'adviser' });
            if (id) params.set('adviserId', id);
            const url = `${API}/api/documents?${params.toString()}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch documents");
            setSubmissions(data.documents.map(toSubmission));
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchSubmissions(user?.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // ── Set mode (local + API) ─────────────────────────────────────────────
    const setMode = async (id, mode) => {
        // Optimistic update
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, mode } : s)));
        try {
            const res = await fetch(`${API}/api/documents/${id}/mode`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Mode update failed");
        } catch (err) {
            // Roll back on failure
            await fetchSubmissions(user?.id);
            showToast(err.message, "error");
        }
    };

    // ── Approve (forward to FREC) ──────────────────────────────────────────
    const approve = async (id) => {
        const sub = submissions.find((s) => s.id === id);
        if (!sub?.mode) return;

        try {
            const res = await fetch(`${API}/api/documents/${id}/approve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actorId: user.id, role: "adviser" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Approval failed");

            setSubmissions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: data.nextStatus } : s))
            );
            showToast(`"${sub.title}" forwarded to FREC (Mode ${sub.mode}).`);
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // ── Disapprove ─────────────────────────────────────────────────────────
    const disapprove = async (id, remarks) => {
        setDisapproving(null);

        try {
            const res = await fetch(`${API}/api/documents/${id}/disapprove`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actorId: user.id, remarks }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Disapproval failed");

            const sub = submissions.find((s) => s.id === id);
            setSubmissions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: "DISAPPROVED" } : s))
            );
            showToast(`"${sub?.title}" disapproved.`);
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const pending = submissions.filter((s) => s.status === "SUBMITTED");

    const sidebarIcons = [
        { icon: HomeIcon, label: "Dashboard", onClick: () => setView("Dashboard") },
        { icon: FileTextIcon, label: "All Documents", onClick: () => setView("All Documents") },
        { icon: CheckCircleIcon, label: "Approvals", onClick: () => setView("Approvals") },
        { icon: RotateIcon, label: "Workflow Guide", onClick: () => setView("Workflow Guide") },
    ];
    const activeSidebarIndex = view === "All Documents" ? 1 : view === "Approvals" ? 2 : view === "Workflow Guide" ? 3 : 0;

    return (
        <DashboardLayout
            userName={user.name}
            userInitials={user.initials}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showTabs={view === "Dashboard"}
            title={view === "All Documents" ? "All Documents" : view === "Approvals" ? "Pending Approvals" : view === "Workflow Guide" ? "Workflow Guide" : ""}
            showAddButton={false}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
            userProgram={user.program}
        >
            {view === "All Documents" ? (
                <AllDocuments role="adviser" />
            ) : view === "Approvals" ? (
                <AdviserApprovals
                    submissions={submissions}
                    onApprove={approve}
                    onDisapprove={(id) => { const sub = submissions.find(s => s.id === id); setDisapproving(sub); }}
                    onSetMode={setMode}
                />
            ) : view === "Workflow Guide" ? (
                <WorkflowGuide />
            ) : (
                <>
                    {/* Welcome banner */}
                    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
                        <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
                        <p className="mt-1 max-w-xl text-sm text-white/85">
                            This is CertTrack, your certification monitoring dashboard. Track document
                            submissions, monitor approval status, and manage the certification workflow.
                        </p>
                        <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                            {user.initials}
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="mb-6 flex gap-4">
                        <StatCard label="PENDING REVIEW" value={pendingCount} valueColor="text-[#7a1f2b]" />
                        <StatCard label="FORWARDED TO FREC" value={forwardedCount} valueColor="text-violet-600" />
                        <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
                    </div>

                    {/* Instructions */}
                    <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <InfoIcon size={16} className="mt-0.5 shrink-0" />
                        <p>
                            <span className="font-semibold">Adviser Instructions:</span> Select a processing
                            mode (1, 2, or 3) for each submission before forwarding to FREC. Disapproved
                            submissions will end the process. Mode determines the certificate routing path.
                        </p>
                    </div>

                    {/* Pending submissions */}
                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <h2 className="!text-sm !font-semibold !text-slate-800">Pending Submissions</h2>
                            <span className="text-xs text-slate-400">{pending.length} items</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center px-5 py-10 text-sm text-slate-400">
                                <SpinnerIcon size={14} className="mr-2" /> Loading submissions…
                            </div>
                        ) : pending.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No pending submissions.
                            </div>
                        ) : (
                            pending.map((sub, idx) => (
                                <div key={sub.id} className="flex items-center justify-between border-b border-slate-50 px-5 py-4 last:border-0">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {idx + 1}. {sub.title}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {sub.student}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {sub.id} · Submitted {sub.submitted}
                                        </p>
                                        {sub.driveLink && (
                                            <div className="mt-2">
                                                <DriveLinkButton driveLink={sub.driveLink} />
                                            </div>
                                        )}
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-500">Mode:</span>
                                            {[1, 2, 3].map((m) => (
                                                <ModeButton
                                                    key={m}
                                                    mode={m}
                                                    active={sub.mode === m}
                                                    onClick={() => setMode(sub.id, m)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <StatusBadge status={sub.status} />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setDisapproving(sub)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                            >
                                                <XCircleIcon size={14} /> Disapprove
                                            </button>
                                            <button
                                                onClick={() => approve(sub.id)}
                                                disabled={!sub.mode}
                                                title={!sub.mode ? "Select a Mode before forwarding to FREC" : undefined}
                                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm ${sub.mode
                                                    ? "bg-[#7a1f2b] text-white hover:bg-[#5a121d] cursor-pointer"
                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                                                    }`}
                                            >
                                                <ArrowRightCircleIcon size={14} /> Approve → FREC
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {disapproving && (
                <DisapproveModal
                    title={disapproving.title}
                    onConfirm={(remarks) => disapprove(disapproving.id, remarks)}
                    onCancel={() => setDisapproving(null)}
                />
            )}

            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg z-50 ${toastType === "error" ? "bg-red-700" : "bg-slate-900"}`}>
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}
