import { useState } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import WorkflowGuide from "../../components/WorkflowGuide";
import {
  InfoIcon,
  FileTextIcon,
  CheckCircleIcon,
  ArrowRightCircleIcon,
  HomeIcon,
  RotateIcon,
} from "../../components/icons";

const INITIAL_REQUESTS = [
  {
    id: "REQ-2024-001",
    title: "Thesis Certification Request",
    type: "Thesis Certification",
    submitted: "2024-06-06",
    status: "PENDING REVIEW",
    note: "Awaiting adviser evaluation.",
  },
  {
    id: "REQ-2024-002",
    title: "Research Certification Request",
    type: "Research Certification",
    submitted: "2024-05-28",
    status: "APPROVED",
    note: "Your document has been accepted.",
  },
  {
    id: "REQ-2024-003",
    title: "Project Endorsement Request",
    type: "Project Endorsement",
    submitted: "2024-05-10",
    status: "FORWARDED",
    note: "Your request has been forwarded to FREC.",
  },
];

export default function StudentDashboard({
  user = { name: "Juan Dela Cruz", initials: "JD" },
  onLogout,
}) {
  const [view, setView] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState(0);
  const [requests] = useState(INITIAL_REQUESTS);
  const [toast, setToast] = useState(null);

  const pendingCount = requests.filter((item) => item.status === "PENDING REVIEW").length;
  const approvedCount = requests.filter((item) => item.status === "APPROVED").length;
  const forwardedCount = requests.filter((item) => item.status === "FORWARDED").length;

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const sidebarIcons = [
    { icon: HomeIcon, label: "Dashboard", onClick: () => setView("Dashboard") },
    { icon: RotateIcon, label: "Workflow Guide", onClick: () => setView("Workflow Guide") },
  ];

  const activeSidebarIndex = view === "Workflow Guide" ? 1 : 0;

  return (
    <DashboardLayout
      userName={user.name}
      userInitials={user.initials}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      role="student"
      showAddButton={view === "Dashboard"}
      onAddClick={() => showToast("New submission form would open here.")}
      onLogout={onLogout}
      sidebarIcons={sidebarIcons}
      activeSidebarIndex={activeSidebarIndex}
    >
      {view === "Workflow Guide" ? (
        <WorkflowGuide />
      ) : (
        <>
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
            <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
            <p className="mt-1 max-w-xl text-sm text-white/85">
              This is CertTrack, your certification monitoring dashboard.
              Track document submissions, monitor approval status, and manage the certification workflow.
            </p>
            <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
              {user.initials}
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            <StatCard label="PENDING REVIEW" value={pendingCount} valueColor="text-[#7a1f2b]" />
            <StatCard label="APPROVED" value={approvedCount} valueColor="text-emerald-600" />
            <StatCard label="FORWARDED" value={forwardedCount} valueColor="text-violet-600" />
          </div>

          <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <InfoIcon size={16} className="mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold">Student Instructions:</span> Submit complete
              documents and monitor the progress of each request. Once your submission is
              reviewed, the status will update automatically.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h2 className="!text-sm !font-semibold !text-slate-800">Recent Requests</h2>
              <span className="text-xs text-slate-400">{requests.length} items</span>
            </div>

            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between border-t border-slate-100 px-5 py-4 first:border-t-0"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{request.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.id} · Submitted {request.submitted}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <FileTextIcon size={14} />
                    <span>{request.type}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${request.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : request.status === "FORWARDED"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {request.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast(`${request.title} — ${request.note}`)}
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <CheckCircleIcon size={14} /> View Details
                    <ArrowRightCircleIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
