import { useState, useEffect } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import WorkflowGuide from "../../components/WorkflowGuide";
import DashboardCertStatus from "../../layouts/components/DashboardCertStatus";
import { HomeIcon, RotateIcon } from "../../components/icons";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SpinnerIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function StudentDashboard({
  user = { name: "Juan Dela Cruz", initials: "JD" },
  onLogout,
  view,
  setView,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [advisers, setAdvisers] = useState([]);
  const [selectedAdviserId, setSelectedAdviserId] = useState("");
  const [editingDoc, setEditingDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDriveLink, setEditDriveLink] = useState("");

  const pendingCount = requests.filter(r => !["APPROVED", "COMPLETED", "DISAPPROVED", "CANCELLED"].includes(r.status)).length;
  const approvedCount = requests.filter(r => ["APPROVED", "COMPLETED"].includes(r.status)).length;
  const disapprovedCount = requests.filter(r => r.status === "DISAPPROVED").length;

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    window.setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch advisers and assigned adviser ────────────────────────────────────
  const fetchAdvisers = async () => {
    try {
      const res = await fetch(`${API}/api/users`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      const ad = data.users.filter(u => u.role_id === 2);
      setAdvisers(ad);

      if (user?.id) {
        const profRes = await fetch(`${API}/api/users/${encodeURIComponent(user.id)}`);
        if (profRes.ok) {
          const prof = await profRes.json();
          if (prof.advisers?.length > 0) {
            setSelectedAdviserId(prof.advisers[0].id);
          } else if (ad.length > 0) {
            setSelectedAdviserId(ad[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch advisers:", err);
    }
  };

  // ── Fetch student's documents from DB ─────────────────────────────────────
  const fetchDocuments = async () => {
    if (!user?.id) return;
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API}/api/documents?studentId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch documents");

      setRequests(data.documents.map(d => ({
        id: d.id,
        title: d.title,
        type: "Certification Request",
        submitted: d.submittedDate ? d.submittedDate.split("T")[0] : "",
        status: d.status,
        note: d.remarks || "",
        driveLink: d.driveLink || null,
        mode: d.mode,
        modeStr: d.mode ? `Mode ${d.mode}` : "—",
      })));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchAdvisers();
  }, [user?.id]);

  // ── Submit new document ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!docTitle.trim()) {
      showToast("Please fill in the Document Title.", "error");
      return;
    }
    if (!driveLink.trim()) {
      showToast("Please fill in the Google Drive Link.", "error");
      return;
    }
    if (!user?.id) {
      showToast("User session not found. Please log in again.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title: docTitle.trim(),
        driveLink: driveLink.trim(),
        studentId: user.id,
      };
      if (selectedAdviserId) {
        body.adviserId = selectedAdviserId;
      }

      const res = await fetch(`${API}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setRequests(prev => [{
        id: data.id,
        title: data.title,
        type: "Certification Request",
        submitted: data.submittedDate ? data.submittedDate.split("T")[0] : new Date().toISOString().split("T")[0],
        status: data.status,
        note: data.remarks || "",
        driveLink: data.driveLink || driveLink.trim() || null,
        mode: data.mode,
        modeStr: data.mode ? `Mode ${data.mode}` : "—",
      }, ...prev]);

      setDocTitle("");
      setDriveLink("");
      showToast(`"${data.title}" submitted successfully (${data.id}).`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit document ─────────────────────────────────────────────────────────
  const handleEdit = async (req) => {
    setEditingDoc(req);
    setEditTitle(req.title);
    setEditDriveLink(req.driveLink || "");
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDriveLink.trim()) return;

    try {
      const res = await fetch(`${API}/api/documents/${editingDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), driveLink: editDriveLink.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update document");

      setRequests(prev => prev.map(r =>
        r.id === editingDoc.id
          ? { ...r, title: editTitle.trim(), driveLink: editDriveLink.trim() }
          : r
      ));
      setEditingDoc(null);
      showToast("Document updated.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ── Delete (cancel) document ──────────────────────────────────────────────
  const handleDelete = async (req) => {
    if (!window.confirm(`Cancel document "${req.id}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/documents/${req.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel document");

      setRequests(prev => prev.filter(r => r.id !== req.id));
      showToast(`"${req.id}" cancelled.`);
    } catch (err) {
      showToast(err.message, "error");
    }
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
      onLogout={onLogout}
      sidebarIcons={sidebarIcons}
      activeSidebarIndex={activeSidebarIndex}
      userProgram={user.program}
    >
      {view === "Workflow Guide" ? (
        <WorkflowGuide />
      ) : (
        <>
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
            <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
            <p className="mt-1 max-w-xl text-sm text-white/85">
              Track your certification document submissions, monitor approval status,
              and manage the certification workflow.
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

          <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Submit New Document</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  DOCUMENT TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thesis Certification Request"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  disabled={submitting}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 outline-none transition-all focus:border-[#7a1f2b] focus:bg-white disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  ADVISER
                </label>
                <select
                  value={selectedAdviserId}
                  onChange={e => setSelectedAdviserId(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 outline-none transition-all focus:border-[#7a1f2b] focus:bg-white disabled:opacity-60"
                >
                  {advisers.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  GOOGLE DRIVE LINK
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/…"
                    value={driveLink}
                    onChange={e => setDriveLink(e.target.value)}
                    disabled={submitting}
                    required
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 outline-none transition-all focus:border-[#7a1f2b] focus:bg-white disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#7a1f2b] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5a121d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? <><SpinnerIcon size={14} /> Submitting…</>
                      : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Edit Modal */}
          {editingDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form onSubmit={handleEditSave} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Edit Document</h3>
                <p className="mb-4 text-xs text-slate-500">{editingDoc.id}</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
                  />
                  <input
                    type="url"
                    value={editDriveLink}
                    onChange={e => setEditDriveLink(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingDoc(null)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {loadingDocs ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400">
              <SpinnerIcon size={16} className="mr-2" /> Loading your submissions…
            </div>
          ) : (
            <DashboardCertStatus
              requests={requests}
              title="My Submissions"
              role="student"
              onDownload={req => showToast(`Downloading certificate for ${req.id}…`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${toastType === "error" ? "bg-red-700" : "bg-slate-900"}`}>
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
