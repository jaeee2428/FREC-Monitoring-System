import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AllDocuments from "../../components/AllDocuments.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import ProgramChairApprovals from "./program-chair-approvals.jsx";
import {
    InfoIcon,
    XCircleIcon,
    ArrowRightCircleIcon,
    HomeIcon,
    FileTextIcon,
    CheckCircleIcon,
    RotateIcon,
} from "../../components/icons.jsx";
import ModeBadge from "../../components/ModeBadge.jsx";

const INITIAL_SUBMISSIONS = [
    {
        id: "DOC-2026-9021",
        title: "Optimizing ML Models on Low-Power Embedded Devices",
        student: "John Doe",
        studentNo: "2022-04021",
        program: "BS Computer Science",
        submitted: "2026-07-12",
        status: "AWAITING_CHAIR_REVIEW",
        mode: 1, 
    },
    {
        id: "DOC-2026-3342",
        title: "Local IoT Smart Irrigation System for Campus Grounds",
        student: "Maria Clara",
        studentNo: "2021-09823",
        program: "BS Information Technology",
        submitted: "2026-07-14",
        status: "AWAITING_CHAIR_REVIEW",
        mode: 2, 
    },
    {
        id: "DOC-2026-5581",
        title: "Automated Microgrid Routing in Rural Communities",
        student: "Paolo Villaluz",
        studentNo: "2022-10492",
        program: "BS Electrical Engineering",
        submitted: "2026-07-15",
        status: "AWAITING_CHAIR_REVIEW",
        mode: 3, 
    }
];

const ALL_DOCUMENTS = [
    { id: 1, docId: "DOC-2024-001", title: "Thesis Certification Request", student: "Maria Santos", studentNo: "2021-00145", adviser: "Dr. Reyes", mode: 1, status: "FORWARDED-FREC", dateUpdated: "2024-06-08" },
    { id: 2, docId: "DOC-2024-002", title: "Research Certification", student: "Juan dela Cruz", studentNo: "2021-00203", adviser: "Dr. Lim", mode: 2, status: "CERT GENERATED", dateUpdated: "2024-06-10" },
    { id: 3, docId: "DOC-2024-003", title: "Project Endorsement", student: "Ana Reyes", studentNo: "2022-00087", adviser: "Prof. Garcia", mode: 3, status: "FOR REVIEW", dateUpdated: "2024-06-11" },
    { id: 4, docId: "DOC-2024-004", title: "Thesis Certification Request", student: "Carlos Mendoza", studentNo: "2020-00312", adviser: "Dr. Reyes", mode: null, status: "SUBMITTED", dateUpdated: "2024-06-06" },
    { id: 5, docId: "DOC-2024-005", title: "Research Certification", student: "Lisa Tan", studentNo: "2021-00421", adviser: "Dr. Lim", mode: 1, status: "DISAPPROVED", dateUpdated: "2024-06-09" },
    { id: 6, docId: "DOC-2024-006", title: "Project Endorsement", student: "Miguel Cruz", studentNo: "2022-00156", adviser: "Prof. Garcia", mode: 2, status: "APPROVED", dateUpdated: "2024-06-12" },
    { id: 7, docId: "DOC-2024-007", title: "Thesis Certification Request", student: "Sofia Bautista", studentNo: "2021-00089", adviser: "Dr. Reyes", mode: 1, status: "ADVISER APPROVED", dateUpdated: "2024-06-09" },
    { id: 8, docId: "DOC-2024-008", title: "Research Certification", student: "Paolo Villanueva", studentNo: "2020-00445", adviser: "Dr. Lim", mode: 3, status: "DEAN ENDORSED", dateUpdated: "2024-06-11" },
];

function ModeButton({ mode, active, onClick }) {
    // Dynamic styles when setting a mode manually
    const getActiveStyle = () => {
        if (!active) return "border-slate-300 bg-white text-slate-600 hover:border-slate-400";
        if (mode === 1) return "border-emerald-600 bg-emerald-600 text-white";
        if (mode === 2) return "border-sky-500 bg-sky-500 text-white";
        return "border-purple-600 bg-purple-600 text-white";
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

export default function ProgramChairDashboard({ user = { name: "Dr. Jose Santos", initials: "DJ" }, onLogout = () => { }, view, setView }) {
    const [activeTab, setActiveTab] = useState(0);
    const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
    const [toast, setToast] = useState(null);

    const pendingCount = submissions.filter((s) => s.status === "AWAITING_CHAIR_REVIEW").length;
    const actionedCount = submissions.filter((s) => s.status === "COMPLETED" || s.status === "FORWARDED-DEAN").length;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length;

    const setMode = (id, mode) => {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, mode } : s)));
    };

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2500);
    };

    const handleApprove = (id) => {
        const sub = submissions.find((s) => s.id === id);
        if (!sub.mode) return;

        let nextStatus = "COMPLETED";
        let message;

        if (sub.mode === 1) {
            nextStatus = "COMPLETED";
            message = `"${sub.title}" successfully completed and signed (Mode 1).`;
        } else {
            nextStatus = "FORWARDED-DEAN";
            message = `"${sub.title}" signed and forwarded to the Dean's Queue (Mode ${sub.mode}).`;
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
        showToast(`"${sub.title}" disapproved and returned.`);
    };

    const pendingList = submissions.filter((s) => s.status === "AWAITING_CHAIR_REVIEW");

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
            showAddButton={view === "Dashboard"}
            onAddClick={() => showToast("Add document form coming soon.")}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
        >
            {view === "All Documents" ? (
                <AllDocuments documents={ALL_DOCUMENTS} />
            ) : view === "Approvals" ? (
                <ProgramChairApprovals
                    submissions={submissions}
                    onApprove={handleApprove}
                    onDisapprove={handleDisapprove}
                    onSetMode={setMode}
                />
            ) : view === "Workflow Guide" ? (
                <WorkflowGuide />
            ) : (
                <>
                    {/* Welcome Banner */}
                    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
                        <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
                        <p className="mt-1 max-w-xl text-sm text-white/85">
                            Manage routed certifications, review assigned modes, and sign documents to either complete the workflow or escalate to the Dean.
                        </p>
                        <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                            {user.initials}
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="mb-6 flex gap-4">
                        <StatCard label="PENDING ACTION" value={pendingCount} valueColor="text-[#7a1f2b]" />
                        <StatCard label="ACTIONED" value={actionedCount} valueColor="text-emerald-600" />
                        <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
                    </div>

                    {/* Instructions Banner */}
                    <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <InfoIcon size={16} className="mt-0.5 shrink-0" />
                        <p>
                            <span className="font-semibold">Program Chair Mode Rules:</span> 
                            {" "}Approving under <span className="font-bold">Mode 1</span> will complete the chain immediately. Approving under <span className="font-bold">Mode 2 or 3</span> signs and forwards the document directly to the Dean.
                        </p>
                    </div>

                    {/* Pending Submissions Queue */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <h2 className="!text-sm !font-semibold !text-slate-800">Pending Actions Queue</h2>
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
                                            <ModeBadge mode={sub.mode} />
                                        </div>
                                        
                                        {/* Dynamic Mode Switch Toggles */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-500">Switch Mode:</span>
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
                                                onClick={() => handleDisapprove(sub.id)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <XCircleIcon size={14} /> Disapprove
                                            </button>
                                            
                                            {/* Action Button Layout with tailored color schemas */}
                                            {sub.mode === 1 ? (
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
                                                    <ArrowRightCircleIcon size={14} /> Approve & Forward
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

            {/* Notification Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg z-50">
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}