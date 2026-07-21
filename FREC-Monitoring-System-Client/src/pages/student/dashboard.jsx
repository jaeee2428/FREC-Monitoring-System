import { useState } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import WorkflowGuide from "../../components/WorkflowGuide";
import DashboardCertStatus from "../../layouts/components/DashboardCertStatus";
import {
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
    mode: 1,
    modeStr: "Mode 1",
  },
  {
    id: "REQ-2024-002",
    title: "Research Certification Request",
    type: "Research Certification",
    submitted: "2024-05-28",
    status: "APPROVED",
    note: "Your document has been accepted.",
    mode: 2,
    modeStr: "Mode 2",
  },
  {
    id: "REQ-2024-003",
    title: "Project Endorsement Request",
    type: "Project Endorsement",
    submitted: "2024-05-10",
    status: "FORWARDED-FREC",
    note: "Your request has been forwarded to FREC.",
    mode: 3,
    modeStr: "Mode 3",
  },
];

export default function StudentDashboard({
  user = { name: "Juan Dela Cruz", initials: "JD" },
  onLogout,
  view,
  setView,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [docTitle, setDocTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [toast, setToast] = useState(null);

  const pendingCount = requests.filter((item) => !["APPROVED", "COMPLETED", "DISAPPROVED"].includes(item.status)).length;
  const approvedCount = requests.filter((item) => ["APPROVED", "COMPLETED"].includes(item.status)).length;
  const disapprovedCount = requests.filter((item) => item.status === "DISAPPROVED").length;

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const handleSimulatedUpload = (e) => {
    if (e) e.preventDefault();
    if (!docTitle.trim() || !driveLink.trim()) {
      showToast("Please fill in both the Document Title and Google Drive Link.");
      return;
    }
    if (uploading) return;
    setUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newRequest = {
              id: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              title: docTitle,
              type: "Thesis Certification",
              submitted: new Date().toISOString().split("T")[0],
              status: "SUBMITTED",
              note: `Document submitted via Google Drive: ${driveLink}`,
              mode: 1,
              modeStr: "Mode 1"
            };
            setRequests((prevReqs) => [newRequest, ...prevReqs]);
            setUploading(false);
            setDocTitle("");
            setDriveLink("");
            showToast("Google Drive Link submitted successfully.");
          }, 400);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
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
      showTabs={view === "Dashboard"}
      title={view === "Workflow Guide" ? "Workflow Guide" : ""}
      showAddButton={false}
      onAddClick={handleSimulatedUpload}
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
            <StatCard label="TOTAL SUBMITTED" value={requests.length} valueColor="text-slate-800" />
            <StatCard label="PENDING REVIEW" value={pendingCount} valueColor="text-[#7a1f2b]" />
            <StatCard label="APPROVED" value={approvedCount} valueColor="text-emerald-600" />
            <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
          </div>

          {/* Submit New Document Section - Inline Embedded */}
          <form onSubmit={handleSimulatedUpload} className="rounded-xl border border-slate-200 bg-white p-5 mb-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Submit New Document</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">DOCUMENT TITLE</label>
                <input 
                  type="text" 
                  placeholder="e.g. Thesis Certification Request" 
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#7a1f2b] focus:bg-white transition-all"
                  required
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">GOOGLE DRIVE LINK</label>
                {/* Flex container keeps input and button on the same horizontal row */}
                <div className="flex gap-3 items-center">
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/file/d/..." 
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#7a1f2b] focus:bg-white transition-all"
                    required
                    disabled={uploading}
                  />
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="shrink-0 rounded-lg bg-[#7a1f2b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5a121d] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {uploading ? `Submitting (${uploadProgress}%)...` : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Submissions queue rendered via reusable component */}
          <DashboardCertStatus
            requests={requests}
            title="My Submissions"
            role="student"
            onDownload={(request) => showToast(`Downloading certificate for ${request.id}...`)}
          />
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
