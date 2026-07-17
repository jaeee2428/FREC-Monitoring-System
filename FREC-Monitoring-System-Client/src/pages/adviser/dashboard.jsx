import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AllDocuments from "../../components/AllDocuments.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import AdviserApprovals from "./approvals.jsx";
import {
    InfoIcon,
    XCircleIcon,
    ArrowRightCircleIcon,
    HomeIcon,
    FileTextIcon,
    CheckCircleIcon,
    RotateIcon,
} from "../../components/icons.jsx";

const INITIAL_SUBMISSIONS = [
    {
        id: "DOC-2024-004",
        title: "Thesis Certification Request",
        student: "Carlos Mendoza",
        studentNo: "2020-00312",
        program: "BS Computer Science",
        submitted: "2024-06-06",
        status: "SUBMITTED",
        mode: null,
    },
    {
        id: "DOC-2024-009",
        title: "AI Ethics Research Paper",
        student: "Ana Gonzales",
        studentNo: "2021-00567",
        program: "BS Computer Science",
        submitted: "2024-06-07",
        status: "FORWARDED-FREC",
        mode: 2,
    },
    {
        id: "DOC-2024-010",
        title: "Network Security Assessment",
        student: "Ben Torres",
        studentNo: "2022-00341",
        program: "BS Information Technology",
        submitted: "2024-06-03",
        status: "DISAPPROVED",
        mode: 1,
    },
];

// Mock data for the shared "All Documents" view
const ALL_DOCUMENTS = [
    { id: 1, docId: "DOC-2024-001", title: "Thesis Certification Request", student: "Maria Santos", studentNo: "2021-00145", adviser: "Dr. Reyes", mode: 1, status: "FORWARDED-FREC", dateUpdated: "2024-06-08" },
    { id: 2, docId: "DOC-2024-002", title: "Research Certification", student: "Juan dela Cruz", studentNo: "2021-00203", adviser: "Dr. Lim", mode: 2, status: "CERT GENERATED", dateUpdated: "2024-06-10" },
    { id: 3, docId: "DOC-2024-003", title: "Project Endorsement", student: "Ana Reyes", studentNo: "2022-00087", adviser: "Prof. Garcia", mode: 3, status: "FOR REVIEW", dateUpdated: "2024-06-11" },
    { id: 4, docId: "DOC-2024-004", title: "Thesis Certification Request", student: "Carlos Mendoza", studentNo: "2020-00312", adviser: "Dr. Reyes", mode: null, status: "SUBMITTED", dateUpdated: "2024-06-06" },
    { id: 5, docId: "DOC-2024-005", title: "Research Certification", student: "Lisa Tan", studentNo: "2021-00421", adviser: "Dr. Lim", mode: 1, status: "DISAPPROVED", dateUpdated: "2024-06-09" },
    { id: 6, docId: "DOC-2024-006", title: "Project Endorsement", student: "Miguel Cruz", studentNo: "2022-00156", adviser: "Prof. Garcia", mode: 2, status: "APPROVED", dateUpdated: "2024-06-12" },
    { id: 7, docId: "DOC-2024-007", title: "Thesis Certification Request", student: "Sofia Bautista", studentNo: "2021-00089", adviser: "Dr. Reyes", mode: 1, status: "ADVISER APPROVED", dateUpdated: "2024-06-09" },
    { id: 8, docId: "DOC-2024-008", title: "Research Certification", student: "Paolo Villanueva", studentNo: "2020-00445", adviser: "Dr. Lim", mode: 3, status: "DEAN ENDORSED", dateUpdated: "2024-06-11" },
    { id: 9, docId: "DOC-2024-006", title: "Project Endorsement", student: "Miguel Cruz", studentNo: "2022-00156", adviser: "Prof. Garcia", mode: 2, status: "APPROVED", dateUpdated: "2024-06-12" },
    { id: 10, docId: "DOC-2024-007", title: "Thesis Certification Request", student: "Sofia Bautista", studentNo: "2021-00089", adviser: "Dr. Reyes", mode: 1, status: "ADVISER APPROVED", dateUpdated: "2024-06-09" },
    { id: 11, docId: "DOC-2024-008", title: "Research Certification", student: "Paolo Villanueva", studentNo: "2020-00445", adviser: "Dr. Lim", mode: 3, status: "DEAN ENDORSED", dateUpdated: "2024-06-11" },
];

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

export default function AdviserDashboard({ user = { name: "Dr. Elena Reyes", initials: "DE" }, onLogout = () => { } }) {
    const [view, setView] = useState("home"); // "home" | "documents"
    const [activeTab, setActiveTab] = useState(0);
    const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
    const [toast, setToast] = useState(null);

    const pendingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
    const forwardedCount = submissions.filter((s) => s.status === "FORWARDED-FREC").length;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length;

    const setMode = (id, mode) => {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, mode } : s)));
    };

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2200);
    };

    const approve = (id) => {
        const sub = submissions.find((s) => s.id === id);
        if (!sub.mode) return;
        setSubmissions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "FORWARDED-FREC" } : s))
        );
        showToast(`${sub.title} forwarded to FREC (Mode ${sub.mode}).`);
    };

    const disapprove = (id) => {
        const sub = submissions.find((s) => s.id === id);
        setSubmissions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "DISAPPROVED" } : s))
        );
        showToast(`${sub.title} disapproved.`);
    };

    const pending = submissions.filter((s) => s.status === "SUBMITTED");

    // Sidebar icons with per-item navigation
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
            showAddButton={view === "Dashboard"}
            onAddClick={() => showToast("Add document form would open here.")}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
        >
            {view === "All Documents" ? (
                <AllDocuments documents={ALL_DOCUMENTS} />
            ) : view === "Approvals" ? (
                <AdviserApprovals
                    submissions={submissions}
                    onApprove={approve}
                    onDisapprove={disapprove}
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

                    {/* Adviser instructions */}
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

                        {pending.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No pending submissions.
                            </div>
                        ) : (
                            pending.map((sub, idx) => (
                                <div key={sub.id} className="flex items-center justify-between px-5 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {idx + 1}. {sub.title}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {sub.student} · {sub.studentNo} · {sub.program}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {sub.id} · Submitted {sub.submitted}
                                        </p>
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
                                                onClick={() => disapprove(sub.id)}
                                                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                            >
                                                <XCircleIcon size={14} /> Disapprove
                                            </button>
                                            <button
                                                onClick={() => approve(sub.id)}
                                                disabled={!sub.mode}
                                                title={!sub.mode ? "Select a Mode before forwarding to FREC" : undefined}
                                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${sub.mode
                                                    ? "cursor-pointer bg-[#e6b8bd] text-[#7a1f2b] hover:bg-[#dba3aa]"
                                                    : "cursor-not-allowed bg-slate-100 text-slate-400 pointer-events-none"
                                                    }`}
                                            >
                                                <ArrowRightCircleIcon size={14} /> Approve &rarr; FREC
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}