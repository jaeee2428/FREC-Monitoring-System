import React, { useState } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardCertStatus from "../../layouts/components/DashboardCertStatus";
import { StatCard } from "../../components/StatCard";
import WorkflowGuide from "./WorkflowGuide";
import { HomeIcon, PlusIcon, RotateIcon } from "../../components/icons";

const DOCUMENT_TYPES = ["Thesis Certification", "Research Certification", "Project Endorsement"];

const INITIAL_REQUESTS = [
  {
    id: "REQ-2024-001",
    title: "Thesis Certification Request",
    type: "Thesis Certification",
    submitted: "2024-06-06",
    status: "UNDER REVIEW",
    mode: <span className="font-mono text-[13px] font-semibold text-violet-700">Mode 1</span>,
    modeStr: "Mode 1",
    note: "Awaiting adviser evaluation.",
  },
  {
    id: "REQ-2024-002",
    title: "Research Certification Request",
    type: "Research Certification",
    submitted: "2024-05-28",
    status: "APPROVED",
    mode: <span className="font-mono text-[13px] font-semibold text-blue-700">Mode 2</span>,
    modeStr: "Mode 2",
    note: "Your document has been accepted.",
  },
  {
    id: "REQ-2024-003",
    title: "Project Endorsement Request",
    type: "Project Endorsement",
    submitted: "2024-05-10",
    status: "FORWARDED-FREC",
    mode: <span className="font-mono text-[13px] font-semibold text-orange-700">Mode 3</span>,
    modeStr: "Mode 3",
    note: "Your request has been forwarded to FREC.",
  },
];

export default function StudentDashboard({
  user = { name: "Juan Dela Cruz", initials: "JD" },
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeView, setActiveView] = useState("home");
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [documentLink, setDocumentLink] = useState("");
  const [toast, setToast] = useState(null);

  const totalSubmittedCount = requests.length;
  const disapprovedCount = requests.filter((item) => item.status?.includes("DISAPPROVED")).length;
  const completedCount = requests.filter(
    (item) => item.status === "APPROVED" || item.status === "COMPLETED"
  ).length;
  const pendingCount = totalSubmittedCount - disapprovedCount - completedCount;

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const submitDocument = (event) => {
    event.preventDefault();

    const trimmedLink = documentLink.trim();
    const isGoogleDriveLink =
      /^https:\/\/(drive|docs)\.google\.com\//i.test(trimmedLink);

    if (!isGoogleDriveLink) {
      showToast("Please enter a valid Google Drive link.");
      return;
    }

    const submittedDate = new Date().toISOString().slice(0, 10);
    const requestType = DOCUMENT_TYPES[activeTab] ?? DOCUMENT_TYPES[0];
    const requestNumber = String(requests.length + 1).padStart(3, "0");

    setRequests((prev) => [
      {
        id: `REQ-${new Date().getFullYear()}-${requestNumber}`,
        title: `${requestType} Request`,
        type: requestType,
        submitted: submittedDate,
        status: "UNDER REVIEW",
        modeStr: "Mode 1", // Default for new submissions
        note: "Awaiting adviser evaluation.",
        documentLink: trimmedLink,
      },
      ...prev,
    ]);
    setDocumentLink("");
    showToast("Document submitted for review.");
  };

  const sidebarIcons = [
    { icon: HomeIcon, label: "Home", onClick: () => setActiveView("home") },
    { icon: RotateIcon, label: "Workflow Guide", onClick: () => setActiveView("workflow") },
  ];

  return (
    <DashboardLayout
      userName={user.name}
      userInitials={user.initials}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      role="student"
      sidebarIcons={sidebarIcons}
      activeSidebarIndex={activeView === "workflow" ? 1 : 0}
      showTabs={activeView !== "workflow"}
      topBarTitle={activeView === "workflow" ? "Workflow Guide" : undefined}
      showAddButton
      onAddClick={() => showToast("New submission form would open here.")}
      onLogout={onLogout}
    >
      {activeView === "workflow" ? (
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
        <StatCard label="TOTAL SUBMITTED" value={totalSubmittedCount} valueColor="text-[#7a1f2b]" />
        <StatCard label="PENDING" value={pendingCount} valueColor="text-[#7a1f2b]" />
        <StatCard label="COMPLETED" value={completedCount} valueColor="text-emerald-600" />
        <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
      </div>

      <form
        onSubmit={submitDocument}
        className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="!text-sm !font-semibold !text-slate-800">Submit New Document</h2>
            <p className="mt-0.5 text-xs text-slate-500">{DOCUMENT_TYPES[activeTab] ?? DOCUMENT_TYPES[0]}</p>
          </div>
          <span className="rounded-md bg-[#f4e7e9] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#7a1f2b]">
            GOOGLE DRIVE
          </span>
        </div>

        <div className="flex gap-3">
          <input
            type="url"
            value={documentLink}
            onChange={(event) => setDocumentLink(event.target.value)}
            placeholder="Paste Google Drive link"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/15"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#671a24]"
          >
            <PlusIcon size={15} /> Submit
          </button>
        </div>
      </form>

      <DashboardCertStatus
        title="My Submissions"
        requests={requests}
        onViewDetails={(request) => showToast(`${request.title} - ${request.note}`)}
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
