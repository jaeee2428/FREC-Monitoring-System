import { useState } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import WorkflowGuide from "../../components/WorkflowGuide";
import DashboardCertStatus from "../../layouts/components/DashboardCertStatus";
import {
  InfoIcon,
  HomeIcon,
  RotateIcon,
} from "../../components/icons";

const INITIAL_REQUESTS = [
  {
    id: "REQ-2024-001",
    title: "Thesis Certification Request",
    type: "Thesis Certification",
    submitted: "2024-06-06",
    status: "UNDER REVIEW",
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
    status: "FORWARDED-FREC",
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

  const pendingCount = requests.filter((item) => item.status === "UNDER REVIEW").length;
  const approvedCount = requests.filter((item) => item.status === "APPROVED").length;
  const forwardedCount = requests.filter((item) => item.status === "FORWARDED-FREC").length;

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

          <DashboardCertStatus
            requests={requests}
            onViewDetails={(request) => showToast(`${request.title} — ${request.note}`)}
          />
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
