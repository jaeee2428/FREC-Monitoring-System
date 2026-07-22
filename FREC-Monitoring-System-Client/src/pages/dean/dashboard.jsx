import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import ModeBadge from "../../components/ModeBadge.jsx";
import AllDocuments from "../../components/AllDocuments.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import DeanApprovals from "./approvals.jsx";
import DriveLinkButton from "../../components/DriveLinkButton.jsx";
import {
    InfoIcon,
    XCircleIcon,
    ArrowRightCircleIcon,
    CheckCircleIcon,
    HomeIcon,
    FileTextIcon,
    RotateIcon,
} from "../../components/icons.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SpinnerIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

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

export default function DeanDashboard({ user = { name: "Dr. Amalia Cruz", initials: "DA" }, onLogout = () => { }, view, setView }) {
    const [activeTab, setActiveTab] = useState(0);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [toastType, setToastType] = useState("success");

    const pendingCount = submissions.filter((s) => s.status === "FORWARDED-DEAN").length;
    const endorsedCount = submissions.filter((s) => s.status === "DEAN ENDORSED").length;
    const completedCount = submissions.filter((s) => s.status === "COMPLETED").length;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length;

    const showToast = (message, type = "success") => {
        setToast(message);
        setToastType(type);
        window.setTimeout(() => setToast(null), 2500);
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/documents?role=dean`);
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
        fetchSubmissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApprove = async (id) => {
        const sub = submissions.find((s) => s.id === id);
        if (!sub) return;

        try {
            const res = await fetch(`${API}/api/documents/${id}/approve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actorId: user.id, role: "dean" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Approval failed");

            setSubmissions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: data.nextStatus } : s))
            );

            const message = sub.mode === 2
                ? `"${sub.title}" approved — certification complete (Mode 2).`
                : `Endorsement letter issued for "${sub.title}" — forwarded to Reviewer (Mode 3).`;
            showToast(message);
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleDisapprove = async (id) => {
        const sub = submissions.find((s) => s.id === id);
        const remarks = window.prompt(`Reason for disapproving "${sub?.title}"?`);
        if (remarks === null) return;

        try {
            const res = await fetch(`${API}/api/documents/${id}/disapprove`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actorId: user.id, remarks: remarks || "Disapproved by dean" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Disapproval failed");

            setSubmissions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: "DISAPPROVED" } : s))
            );
            showToast(`"${sub?.title}" has been disapproved.`);
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const pendingList = submissions.filter((s) => s.status === "FORWARDED-DEAN");
    const queueLabel = "My Queue";

    const sidebarIcons = [
        { icon: HomeIcon, label: "Dashboard", onClick: () => setView("Dashboard") },
        { icon: FileTextIcon, label: "All Documents", onClick: () => setView("All Documents") },
        { icon: CheckCircleIcon, label: queueLabel, onClick: () => setView(queueLabel) },
        { icon: RotateIcon, label: "Workflow Guide", onClick: () => setView("Workflow Guide") },
    ];
    const activeSidebarIndex = view === "All Documents" ? 1 : view === queueLabel ? 2 : view === "Workflow Guide" ? 3 : 0;

    return (
        <DashboardLayout
            userName={user.name}
            userInitials={user.initials}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showTabs={view === "Dashboard"}
            title={view === "All Documents" ? "All Documents" : view === queueLabel ? queueLabel : view === "Workflow Guide" ? "Workflow Guide" : ""}
            showAddButton={false}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
            role="dean"
        >
            {view === "All Documents" ? (
                <AllDocuments role="dean" />
            ) : view === queueLabel ? (
                <DeanApprovals
                    submissions={submissions}
                    onApprove={handleApprove}
                    onDisapprove={handleDisapprove}
                />
            ) : view === "Workflow Guide" ? (
                <WorkflowGuide />
            ) : (
                <>
                    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
                        <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
                        <p className="mt-1 max-w-xl text-sm text-white/85">
                            Review documents forwarded from the Program Chair. Approve Mode 2 submissions to complete the certification, or issue an endorsement letter for Mode 3 onward to the Reviewer.
                        </p>
                        <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                            {user.initials}
                        </div>
                    </div>

                    <div className="mb-6 flex gap-4">
                        <StatCard label="PENDING REVIEW" value={pendingCount} valueColor="text-[#7a1f2b]" />
                        <StatCard label="ENDORSED" value={endorsedCount} valueColor="text-blue-600" />
                        <StatCard label="COMPLETED" value={completedCount} valueColor="text-emerald-600" />
                        <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
                    </div>

                    <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <InfoIcon size={16} className="mt-0.5 shrink-0" />
                        <p>
                            <span className="font-semibold">Dean Review Rules:</span>
                            {" "}Approving a <span className="font-bold">Mode 2</span> submission completes the certification immediately. Approving a <span className="font-bold">Mode 3</span> submission issues an endorsement letter and forwards it to the Reviewer.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <h2 className="!text-sm !font-semibold !text-slate-800">Pending Review Queue</h2>
                            <span className="text-xs text-slate-400">{pendingList.length} items</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center px-5 py-10 text-sm text-slate-400">
                                <SpinnerIcon size={14} className="mr-2" /> Loading queue…
                            </div>
                        ) : pendingList.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No pending submissions in your queue.
                            </div>
                        ) : (
                            pendingList.map((sub, idx) => (
                                <div key={sub.id} className="flex items-center justify-between px-5 py-5 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {idx + 1}. {sub.title}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">{sub.student}</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                            <span>ID: {sub.id}</span>
                                            <span>·</span>
                                            <ModeBadge mode={sub.mode} />
                                        </div>
                                        {sub.driveLink && (
                                            <div className="mt-2">
                                                <DriveLinkButton driveLink={sub.driveLink} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <StatusBadge status={sub.status} />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDisapprove(sub.id)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <XCircleIcon size={14} /> Disapprove
                                            </button>
                                            {sub.mode === 2 ? (
                                                <button
                                                    onClick={() => handleApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <CheckCircleIcon size={14} /> Approve & Complete
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-[#7a1f2b] hover:bg-[#5a121d] text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <ArrowRightCircleIcon size={14} /> Issue Endorsement
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg z-50 ${toastType === "error" ? "bg-red-700" : "bg-slate-900"}`}>
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}
