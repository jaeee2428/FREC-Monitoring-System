import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AllDocuments from "../../components/AllDocuments.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import ReviewerApprovals from "./approvals.jsx";
import {
    InfoIcon,
    XCircleIcon,
    ArrowRightCircleIcon,
    CheckCircleIcon,
    HomeIcon,
    FileTextIcon,
    RotateIcon,
} from "../../components/icons.jsx";

const ALL_DOCUMENTS = [
    { id: 1, docId: "DOC-2024-001", title: "Thesis Certification Request", student: "Maria Santos", studentNo: "2021-00145", adviser: "Dr. Reyes", mode: 3, status: "FOR REVIEW", dateUpdated: "2024-06-12" },
    { id: 2, docId: "DOC-2024-002", title: "Research Certification", student: "Juan dela Cruz", studentNo: "2021-00203", adviser: "Dr. Lim", mode: 3, status: "DEAN ENDORSED", dateUpdated: "2024-06-10" },
    { id: 3, docId: "DOC-2024-003", title: "Project Endorsement", student: "Ana Reyes", studentNo: "2022-00087", adviser: "Prof. Garcia", mode: 3, status: "COMPLETED", dateUpdated: "2024-06-14" },
    { id: 4, docId: "DOC-2024-004", title: "Thesis Certification Request", student: "Carlos Mendoza", studentNo: "2020-00312", adviser: "Dr. Reyes", mode: 3, status: "DISAPPROVED", dateUpdated: "2024-06-11" },
];

export default function ReviewerDashboard({ user = { name: "Prof. Ramon Dela Cruz", initials: "PR" }, onLogout = () => {}, view, setView }) {
    const [activeTab, setActiveTab] = useState(0);
    const [submissions, setSubmissions] = useState([
        { id: "DOC-2026-5581", title: "Automated Microgrid Routing in Rural Communities", student: "Paolo Villaluz", studentNo: "2022-10492", program: "BS Electrical Engineering", submitted: "2026-07-15", status: "DEAN ENDORSED", mode: 3 },
        { id: "DOC-2026-1023", title: "Deep Learning for Crop Disease Detection", student: "Rosa Santos", studentNo: "2022-00523", program: "BS Computer Science", submitted: "2026-07-10", status: "DEAN ENDORSED", mode: 3 },
        { id: "DOC-2026-7741", title: "Barangay E-Governance Mobile Platform", student: "Jose Rizal III", studentNo: "2021-07741", program: "BS Information Technology", submitted: "2026-07-08", status: "FOR REVIEW", mode: 3 },
    ]);
    const [toast, setToast] = useState(null);

    const pendingCount = submissions.filter((s) => s.status === "DEAN ENDORSED").length;
    const reviewCount = submissions.filter((s) => s.status === "FOR REVIEW").length;
    const completedCount = submissions.filter((s) => s.status === "COMPLETED").length;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length;

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2500);
    };

    const handleApprove = (id) => {
        const sub = submissions.find((s) => s.id === id);
        if (!sub) return;

        let nextStatus;
        let message;

        if (sub.status === "DEAN ENDORSED") {
            nextStatus = "FOR REVIEW";
            message = `"${sub.title}" has been accepted for review. Certificate generation will follow.`;
        } else {
            nextStatus = "COMPLETED";
            message = `"${sub.title}" has received final FICS FREC confirmation and is now complete.`;
        }

        setSubmissions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
        );
        showToast(message);
    };

    const handleDisapprove = (id) => {
        const sub = submissions.find((s) => s.id === id);
        setSubmissions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "DISAPPROVED" } : s))
        );
        showToast(`"${sub.title}" has been disapproved.`);
    };

    const pendingList = submissions.filter((s) => s.status === "DEAN ENDORSED" || s.status === "FOR REVIEW");
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
            role="reviewer"
        >
            {view === "All Documents" ? (
                <AllDocuments documents={ALL_DOCUMENTS} />
            ) : view === queueLabel ? (
                <ReviewerApprovals
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
                            Review Dean-endorsed submissions, validate documentation, and give final FICS FREC confirmation to complete the Mode 3 workflow.
                        </p>
                        <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                            {user.initials}
                        </div>
                    </div>

                    <div className="mb-6 flex gap-4">
                        <StatCard label="PENDING REVIEW" value={pendingCount} valueColor="text-[#7a1f2b]" />
                        <StatCard label="IN REVIEW" value={reviewCount} valueColor="text-amber-600" />
                        <StatCard label="COMPLETED" value={completedCount} valueColor="text-emerald-600" />
                        <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
                    </div>

                    <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <InfoIcon size={16} className="mt-0.5 shrink-0" />
                        <p>
                            <span className="font-semibold">Reviewer Workflow:</span>
                            {" "}Review Dean-endorsed submissions, accept them for certificate generation, then give final <span className="font-bold">FICS FREC confirmation</span> to mark them complete.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <h2 className="!text-sm !font-semibold !text-slate-800">Pending Review Queue</h2>
                            <span className="text-xs text-slate-400">{pendingList.length} items</span>
                        </div>

                        {pendingList.length === 0 ? (
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
                                        <p className="mt-1 text-xs text-slate-500">
                                            {sub.student} · {sub.studentNo} · {sub.program}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                            <span>ID: {sub.id}</span>
                                            <span>·</span>
                                            <span className="rounded border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">Mode 3</span>
                                        </div>
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
                                            {sub.status === "DEAN ENDORSED" ? (
                                                <button
                                                    onClick={() => handleApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-[#7a1f2b] hover:bg-[#5a121d] text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <ArrowRightCircleIcon size={14} /> Accept for Review
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleApprove(sub.id)}
                                                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    <CheckCircleIcon size={14} /> Confirm FICS FREC
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
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg z-50">
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}
