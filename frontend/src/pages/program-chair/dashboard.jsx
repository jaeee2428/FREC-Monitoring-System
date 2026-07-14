import React, { useState, useRef } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import { InfoIcon, CheckCircleIcon, ArrowRightCircleIcon, FileTextIcon, XCircleIcon } from "../../components/icons";

const INITIAL_QUEUE = [
  {
    id: "DOC-2024-001",
    title: "Thesis Certification Request",
    student: "Alice Jenkins",
    studentNo: "2021-04321",
    program: "BS Computer Science",
    submitted: "2024-06-05",
    status: "Return to Adviser",
    mode: 1,
  },
  {
    id: "DOC-2024-002",
    title: "Research Certification Request",
    student: "Marcus Aurelius",
    studentNo: "2021-09876",
    program: "BS Information Technology",
    submitted: "2024-06-07",
    status: "AWAITING_CHAIR_REVIEW",
    mode: 2,
  },
];

export default function ProgramChairDashboard({
  user = { name: "Dr. Jose Santos", initials: "JS" },
  onLogout
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [toast, setToast] = useState(null);
  
  const [activeSidebarIndex, setActiveSidebarIndex] = useState(0);
  const [selectedDocForReview, setSelectedDocForReview] = useState(null);

  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB"
      });
      showToast(`Attached: ${file.name}`);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Attachment removed.");
  };

  const approveAndSignMode1 = (id) => {
    setQueue((prev) => prev.map((d) => (d.id === id ? { ...d, status: "COMPLETED" } : d)));
    showToast("Approved & Signed: Marked as COMPLETED.");
    resetView();
  };

  const forwardMode2 = (id) => {
    setQueue((prev) => prev.map((d) => (d.id === id ? { ...d, status: "FORWARDED-DEAN" } : d)));
    showToast("Forwarded: Advanced to Dean Review.");
    resetView();
  };

  const resetView = () => {
    setActiveSidebarIndex(0);
    setSelectedDocForReview(null);
    setAttachedFile(null);
  };

  const openReviewScreen = (doc) => {
    setSelectedDocForReview(doc);
    setActiveSidebarIndex(2);
  };

  const pendingCount = queue.filter(d => d.status === "Return to Adviser" || d.status === "AWAITING_CHAIR_REVIEW").length;
  const actionedCount = queue.filter(d => d.status === "COMPLETED" || d.status === "FORWARDED-DEAN").length;
  const activeQueueItems = queue.filter(d => d.status === "Return to Adviser" || d.status === "AWAITING_CHAIR_REVIEW");

  return (
    <DashboardLayout
      userName={user.name}
      userInitials={user.initials}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showAddButton={false}
      activeSidebarIndex={activeSidebarIndex}
      onLogout={onLogout}
    >
      
      {/* VIEW 1: HOME/DASHBOARD QUEUE */}
      {activeSidebarIndex !== 2 && (
        <>
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
            <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
            <p className="mt-1 max-w-xl text-sm text-white/90">Review pending certificates and fulfill your PBI validations.</p>
          </div>

          <div className="mb-6 flex gap-4">
            <StatCard label="PENDING ACTION" value={pendingCount} valueColor="text-[#7a1f2b]" />
            <StatCard label="ACTIONED" value={actionedCount} valueColor="text-green-700" />
            <StatCard label="TOTAL IN QUEUE" value={queue.length} valueColor="text-slate-600" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h2 className="!text-sm !font-semibold !text-slate-800 tracking-tight">Program Chair — Document Queue</h2>
              <span className="text-xs text-slate-500">{activeQueueItems.length} tasks remaining</span>
            </div>

            {activeQueueItems.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No documents pending action.</div>
            ) : (
              activeQueueItems.map((doc, idx) => (
                <div key={doc.id} className="flex items-center justify-between border-b border-slate-100 last:border-0 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{idx + 1}. {doc.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{doc.student} · {doc.studentNo} · <span className="text-slate-400">{doc.program}</span></p>
                    <span className="mt-2 inline-block rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">Mode {doc.mode}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => openReviewScreen(doc)}
                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:text-[#7a1f2b] hover:border-[#7a1f2b] transition-all"
                  >
                    Open Document Review &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* VIEW 2: DEDICATED REVIEW SCREEN */}
      {activeSidebarIndex === 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!selectedDocForReview ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <p>No document selected for review.</p>
              <button onClick={resetView} className="mt-3 text-sm text-[#7a1f2b] underline">Go back to Queue</button>
            </div>
          ) : (
            <div>
                <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Review Mode / {selectedDocForReview.id}</span>
                    <h2 className="text-base font-normal mt-1" style={{ color: '#334155' }}>{selectedDocForReview.title}</h2>
                </div>

                <button 
                  onClick={resetView}
                  className="text-xs text-slate-500 hover:text-[#7a1f2b] border border-slate-200 rounded-md px-3 py-1.5 bg-white transition-all shadow-sm"
                >
                  &larr; Back to Queue
                </button>
              </div>

              {/* Main Workspace Frame */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                
                {/* Left Side: Document Details Box */}
                <div className="lg:col-span-2 border border-slate-200 bg-white rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                      <FileTextIcon size={20} className="text-slate-400" />
                      <div>
                        <p className="text-xs uppercase text-slate-400 tracking-wider font-medium">Routing Document Manifest</p>
                        <p className="text-sm text-slate-700 mt-0.5">Digital Certificate Details Summary</p>
                      </div>
                    </div>
                    
                    {/* Increased body from text-xs to text-sm */}
                    <div className="w-full text-sm text-slate-600 space-y-3.5">
                      <p className="border-b border-slate-100 pb-2.5"><span className="text-slate-400 inline-block w-28">Candidate:</span> <span className="text-slate-700 font-medium">{selectedDocForReview.student}</span> <span className="text-slate-400">({selectedDocForReview.studentNo})</span></p>
                      <p className="border-b border-slate-100 pb-2.5"><span className="text-slate-400 inline-block w-28">Program:</span> <span className="text-slate-700">{selectedDocForReview.program}</span></p>
                      <p className="border-b border-slate-100 pb-2.5"><span className="text-slate-400 inline-block w-28">Origin Date:</span> <span className="text-slate-700">{selectedDocForReview.submitted}</span></p>
                      <p className="pb-1"><span className="text-slate-400 inline-block w-28">Chain Track:</span> <span className="rounded bg-slate-50 px-2.5 py-1 text-xs text-slate-600 border border-slate-200/80 font-medium">{selectedDocForReview.status}</span></p>
                    </div>
                  </div>

                  {/* FILE ATTACHMENT AREA */}
                  <div className="mt-8 pt-5 border-t border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2.5">Chairperson Signature / Verification Upload</p>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                      accept=".pdf,.png,.jpg,.jpeg"
                    />

                    {!attachedFile ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-slate-200 hover:border-[#7a1f2b] hover:bg-slate-50/20 rounded-lg py-5 text-center bg-white transition-all cursor-pointer"
                      >
                        <span className="text-sm text-slate-500">📎 Click to attach signed endorsement file</span>
                        <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG format placeholders</p>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base text-slate-400">📄</span>
                          <div className="truncate text-left">
                            <p className="text-sm text-slate-600 truncate font-medium">{attachedFile.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{attachedFile.size}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={removeAttachedFile}
                          className="text-slate-400 hover:text-[#7a1f2b] transition-colors p-1 cursor-pointer"
                        >
                          <XCircleIcon size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Clean White Workflow Action Panel */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 border-b border-slate-100 pb-2.5 mb-4">
                      <InfoIcon size={14} />
                      <h3 className="text-xs uppercase tracking-wider font-medium">Review Action Panel</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Your evaluation signs off or forwards the processing structure based on the established workflow criteria rules.
                    </p>
                    <div className="mt-4 border border-slate-100 rounded-lg p-3.5 bg-slate-50/50 text-xs text-slate-500 space-y-2">
                      <p>• <span className="text-slate-600 font-medium">Mode 1 Rule:</span> Finalizes certification routing path directly to a completed status.</p>
                      <p>• <span className="text-slate-600 font-medium">Mode 2 Rule:</span> Appends signature track onward to the Dean validation chain.</p>
                    </div>
                  </div>

                  {/* Standardized Actions matching plain gray/red-hover tones */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {selectedDocForReview.mode === 1 ? (
                      <button
                        type="button"
                        onClick={() => approveAndSignMode1(selectedDocForReview.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 hover:text-green-700 hover:border-green-600 transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircleIcon size={14} /> Approve & Sign (Mode 1)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => forwardMode2(selectedDocForReview.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 hover:text-[#7a1f2b] hover:border-[#7a1f2b] transition-all shadow-sm cursor-pointer"
                      >
                        <ArrowRightCircleIcon size={14} /> Forward to Dean (Mode 2)
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-4 py-2 text-xs text-white shadow-md z-50">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}