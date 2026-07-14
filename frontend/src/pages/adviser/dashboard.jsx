<<<<<<< HEAD
import { useState } from 'react'

const IconBase = ({ children, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
)

const HomeIcon = (props) => (
  <IconBase {...props}>
    <path d="M3 9.5 12 3l9 6.5" />
    <path d="M5 9.5V21h14V9.5" />
  </IconBase>
)

const FileTextIcon = (props) => (
  <IconBase {...props}>
    <path d="M6 2h9l5 5v15H6z" />
    <path d="M14 2v6h6" />
  </IconBase>
)

const CheckCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3L16 10" />
  </IconBase>
)

const RotateIcon = (props) => (
  <IconBase {...props}>
    <path d="M3 12a9 9 0 1 1 3 6.7" />
    <path d="M3 21v-6h6" />
  </IconBase>
)

const LogOutIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
)

const BellIcon = (props) => (
  <IconBase {...props}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10.5 20a1.5 1.5 0 0 0 3 0" />
  </IconBase>
)

const PlusIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 5v14M5 12h14" />
  </IconBase>
)

const XCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9.5 9.5 5 5m0-5-5 5" />
  </IconBase>
)

const ArrowRightCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12h6m0 0-2.5-2.5M15 12l-2.5 2.5" />
  </IconBase>
)

const InfoIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </IconBase>
)

const TABS = ['Thesis Certification', 'Research Certification', 'Project Endorsement']

const INITIAL_SUBMISSIONS = [
  {
    id: 'DOC-2024-004',
    title: 'Thesis Certification Request',
    student: 'Carlos Mendoza',
    studentNo: '2020-00312',
    program: 'BS Computer Science',
    submitted: '2024-06-06',
    status: 'SUBMITTED',
    mode: null,
  },
]

function SidebarIcon({ icon: Icon, active, label, onClick }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-[#fbe9e7] text-[#7a1f2b]'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
      }`}
    >
      <Icon size={18} />
    </button>
  )
}

function StatCard({ label, value, valueColor }) {
  return (
    <div className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <p className="text-[11px] font-semibold tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  )
}

function ModeButton({ mode, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-[#7a1f2b] bg-[#7a1f2b] text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:border-[#7a1f2b] hover:text-[#7a1f2b]'
      }`}
    >
      Mode {mode}
    </button>
  )
}

export default function AdviserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(0)
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS)
  const [toast, setToast] = useState(null)

  const pendingCount = submissions.filter((s) => s.status === 'SUBMITTED').length
  const forwardedCount =
    submissions.filter((s) => s.status === 'FORWARDED-FREC').length + 1
  const disapprovedCount =
    submissions.filter((s) => s.status === 'DISAPPROVED').length + 1

  const setMode = (id, mode) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, mode } : s)))
  }

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const approve = (id) => {
    const sub = submissions.find((s) => s.id === id)
    if (!sub.mode) {
      showToast('Select a Mode before forwarding to FREC.')
      return
    }
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'FORWARDED-FREC' } : s)),
    )
    showToast(`${sub.title} forwarded to FREC (Mode ${sub.mode}).`)
  }

  const disapprove = (id) => {
    const sub = submissions.find((s) => s.id === id)
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'DISAPPROVED' } : s)),
    )
    showToast(`${sub.title} disapproved.`)
  }

  const pending = submissions.filter((s) => s.status === 'SUBMITTED')

  return (
    <div className="dashboard-page min-h-screen w-full bg-[#f7f7f8] font-sans text-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a1f2b] text-xs font-bold text-white">
            CT
          </div>
          <span className="text-sm">
            <span className="font-bold text-[#7a1f2b]">CertTrack:</span>{' '}
            <span className="text-slate-700">Certification Monitoring and Tracking System</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="relative text-slate-500 hover:text-slate-700">
            <BellIcon size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#7a1f2b]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7a1f2b] text-[11px] font-bold text-white">
              {user.initials}
            </div>
            <span className="text-sm font-medium text-slate-700">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <aside className="flex w-16 flex-col items-center justify-between border-r border-slate-200 bg-white py-4">
          <div className="flex flex-col gap-2">
            <SidebarIcon icon={HomeIcon} active label="Home" />
            <SidebarIcon icon={FileTextIcon} label="Documents" />
            <SidebarIcon icon={CheckCircleIcon} label="Review" />
            <SidebarIcon icon={RotateIcon} label="History" />
          </div>
          <SidebarIcon icon={LogOutIcon} label="Log out" onClick={onLogout} />
        </aside>

        <main className="flex-1 px-8 py-6">
          <div className="mb-5 flex items-center justify-between">
            <nav className="flex gap-8">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-1.5 border-b-2 pb-2 text-sm font-medium transition-colors ${
                    activeTab === i
                      ? 'border-[#7a1f2b] text-[#7a1f2b]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileTextIcon size={14} />
                  {tab}
                </button>
              ))}
            </nav>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#671a24]"
            >
              <PlusIcon size={15} /> Add
            </button>
          </div>

          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
            <h3 className="text-xl font-bold">Welcome, {user.name}!</h3>
            <p className="mt-1 max-w-xl text-sm text-white/85">
              This is CertTrack, your certification monitoring dashboard. Track document
              submissions, monitor approval status, and manage the certification workflow.
            </p>
            <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
              {user.initials}
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            <StatCard label="PENDING REVIEW" value={pendingCount} valueColor="text-[#7a1f2b]" />
            <StatCard
              label="FORWARDED TO FREC"
              value={forwardedCount}
              valueColor="text-violet-600"
            />
            <StatCard label="DISAPPROVED" value={disapprovedCount} valueColor="text-red-600" />
          </div>

          <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <InfoIcon size={16} className="mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold">Adviser Instructions:</span> Select a processing mode
              (1, 2, or 3) for each submission before forwarding to FREC. Disapproved submissions
              will end the process. Mode determines the certificate routing path.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-800">Pending Submissions</h2>
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
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-600">
                      {sub.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => disapprove(sub.id)}
                        className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <XCircleIcon size={14} /> Disapprove
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(sub.id)}
                        disabled={!sub.mode}
                        title={!sub.mode ? 'Select a Mode before forwarding to FREC' : undefined}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                          sub.mode
                            ? 'cursor-pointer bg-[#e6b8bd] text-[#7a1f2b] hover:bg-[#dba3aa]'
                            : 'pointer-events-none cursor-not-allowed bg-slate-100 text-slate-400'
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
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        © Developed by the University ICT Development Office. All rights reserved 2025.
      </footer>
    </div>
  )
}
=======
import React, { useState } from "react";
import "../../App.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import { InfoIcon, XCircleIcon, ArrowRightCircleIcon } from "../../components/icons";

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

export default function AdviserDashboard() {
    const [activeTab, setActiveTab] = useState(0);
    const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
    const [toast, setToast] = useState(null);

    const pendingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
    const forwardedCount = submissions.filter((s) => s.status === "FORWARDED-FREC").length + 1;
    const disapprovedCount = submissions.filter((s) => s.status === "DISAPPROVED").length + 1;

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

    return (
        <DashboardLayout
            userName="Dr. Elena Reyes"
            userInitials="DE"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showAddButton
            onAddClick={() => showToast("Add document form would open here.")}
        >
            {/* Welcome banner */}
            <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
                <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, Dr. Elena Reyes!</h1>
                <p className="mt-1 max-w-xl text-sm text-white/85">
                    This is CertTrack, your certification monitoring dashboard. Track document
                    submissions, monitor approval status, and manage the certification workflow.
                </p>
                <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                    DE
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
                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-600">
                                    {sub.status}
                                </span>
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

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}
>>>>>>> adviser
