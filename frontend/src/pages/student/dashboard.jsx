import React, { useState } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import {
  FileTextIcon,
  CheckCircleIcon,
  ArrowRightCircleIcon,
  PlusIcon,
} from "../../components/icons";

const DOCUMENT_TYPES = ["Thesis Certification", "Research Certification", "Project Endorsement"];

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
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [documentLink, setDocumentLink] = useState("");
  const [toast, setToast] = useState(null);

  const totalSubmittedCount = requests.length;
  const pendingCount = requests.filter((item) => item.status === "PENDING REVIEW").length;
  const completedCount = requests.filter(
    (item) => item.status !== "PENDING REVIEW" && item.status !== "DISAPPROVED"
  ).length;
  const disapprovedCount = requests.filter((item) => item.status === "DISAPPROVED").length;

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
        status: "PENDING REVIEW",
        note: "Awaiting adviser evaluation.",
        documentLink: trimmedLink,
      },
      ...prev,
    ]);
    setDocumentLink("");
    showToast("Document submitted for review.");
  };

  return (
    <DashboardLayout
      userName={user.name}
      userInitials={user.initials}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      role="student"
      showAddButton
      onAddClick={() => showToast("New submission form would open here.")}
      onLogout={onLogout}
    >
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
