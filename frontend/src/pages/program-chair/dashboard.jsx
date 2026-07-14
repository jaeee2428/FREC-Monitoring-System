import React, { useState } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import { InfoIcon, CheckCircleIcon, ArrowRightCircleIcon } from "../../components/icons";

// Initial mock data simulating queue items passed forward to the Program Chair
const INITIAL_QUEUE = [
  {
    id: "DOC-2024-001",
    title: "Thesis Certification Request",
    student: "Alice Jenkins",
    studentNo: "2021-04321",
    program: "BS Computer Science",
    submitted: "2024-06-05",
    status: "Return to Adviser", // PBI-23 AC1 status
    mode: 1, // Mode 1 item
  },
  {
    id: "DOC-2024-002",
    title: "Research Certification Request",
    student: "Marcus Aurelius",
    studentNo: "2021-09876",
    program: "BS Information Technology",
    submitted: "2024-06-07",
    status: "AWAITING_CHAIR_REVIEW", // PBI-24 AC1 status
    mode: 2, // Mode 2 item
  },
];

export default function ProgramChairDashboard({
  user = { name: "Dr. Jose Santos", initials: "JS" },
  onLogout
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [toast, setToast] = useState(null);

  // Helper to trigger feedback banner
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  // PBI-23 AC2: Approval sets status to "COMPLETED"
  const approveAndSignMode1 = (id) => {
    const doc = queue.find((d) => d.id === id);
    setQueue((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "COMPLETED" } : d))
    );
    showToast(`Approved & Signed: ${doc.title} marked as COMPLETED.`);
  };

  // PBI-24 AC2: Forwarding advances status toward Dean review
  const forwardMode2 = (id) => {
    const doc = queue.find((d) => d.id === id);
    setQueue((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "FORWARDED-DEAN" } : d))
    );
    showToast(`Forwarded: ${doc.title} advanced to Dean Review.`);
  };

  // Status-based counts
  const pendingCount = queue.filter(
    (d) => d.status === "Return to Adviser" || d.status === "AWAITING_CHAIR_REVIEW"
  ).length;
  
  const actionedCount = queue.filter(
    (d) => d.status === "COMPLETED" || d.status === "FORWARDED-DEAN"
  ).length;

  // Filter queue to display only relevant items
  const activeQueueItems = queue.filter(
    (d) => d.status === "Return to Adviser" || d.status === "AWAITING_CHAIR_REVIEW"
  );

  return (
    <DashboardLayout
      userName={user.name}
      userInitials={user.initials}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showAddButton={false} // Chairs usually don't initiate submissions
      onLogout={onLogout}
    >
      {/* Welcome Banner */}
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

      {/* Analytics Counter Row */}
      <div className="mb-6 flex gap-4">
        <StatCard label="PENDING ACTION" value={pendingCount} valueColor="text-[#7a1f2b]" />
        <StatCard label="ACTIONED" value={actionedCount} valueColor="text-green-600" />
        <StatCard label="TOTAL IN QUEUE" value={queue.length} valueColor="text-slate-600" />
      </div>

      {/* Program Chair Guide Alert */}
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <InfoIcon size={16} className="mt-0.5 shrink-0" />
        <p>
          <span className="font-semibold">Program Chair Queue:</span> Review documents assigned to your role. 
          For <strong>Mode 1</strong> items (from Adviser), approve them to Complete the chain. For <strong>Mode 2</strong> items, 
          forward them to the Dean to continue routing.
        </p>
      </div>

      {/* Pending Queue List */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="!text-sm !font-semibold !text-slate-800">Program Chair — Document Queue</h2>
          <span className="text-xs text-slate-400">{activeQueueItems.length} items pending</span>
        </div>

        {activeQueueItems.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            No documents pending action.
          </div>
        ) : (
          activeQueueItems.map((doc, idx) => (
            <div key={doc.id} className="flex items-center justify-between border-b border-slate-100 last:border-0 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {idx + 1}. {doc.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {doc.student} · {doc.studentNo} · {doc.program}
                </p>
                <p className="text-xs text-slate-400">
                  {doc.id} · Submitted {doc.submitted}
                </p>
                <div className="mt-2">
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                    Mode {doc.mode} Routing
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-600">
                  {doc.status}
                </span>
                
                <div className="flex gap-2">
                  {/* PBI-23 UI Action: Mode 1 - Review and Sign */}
                  {doc.mode === 1 && (
                    <button
                      type="button"
                      onClick={() => approveAndSignMode1(doc.id)}
                      className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircleIcon size={14} /> Approve & Sign (Mode 1)
                    </button>
                  )}

                  {/* PBI-24 UI Action: Mode 2 - Review and Forward */}
                  {doc.mode === 2 && (
                    <button
                      type="button"
                      onClick={() => forwardMode2(doc.id)}
                      className="flex items-center gap-1.5 rounded-md bg-[#e6b8bd] px-3 py-1.5 text-xs font-semibold text-[#7a1f2b] hover:bg-[#dba3aa] transition-colors"
                    >
                      <ArrowRightCircleIcon size={14} /> Forward to Dean
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast Notification Pop-up */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}