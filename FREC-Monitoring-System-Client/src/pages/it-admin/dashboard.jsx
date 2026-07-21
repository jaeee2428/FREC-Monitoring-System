import { useState, useRef, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import { FileTextIcon, HomeIcon, RotateIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from "../../components/icons.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import { accounts, ROLE_NAMES } from "../../data/accounts.js";

// ─── Inline Icons ─────────────────────────────────────────────────────────────
const SearchIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const UploadCloudIcon = ({ size = 36, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 16 12 12 8 16"></polyline>
        <line x1="12" y1="12" x2="12" y2="21"></line>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    </svg>
);

const AlertTriangleIcon = ({ size = 14, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const XIcon = ({ size = 14, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// ─── Role Code Reference Table ────────────────────────────────────────────────
const ROLE_CODE_GUIDE = [
    { code: "01", alias: "1  /  student",        label: "Student",       color: "bg-blue-50 text-blue-700 border-blue-200" },
    { code: "02", alias: "2  /  adviser",         label: "Adviser",       color: "bg-purple-50 text-purple-700 border-purple-200" },
    { code: "03", alias: "3  /  program chair",   label: "Program Chair", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { code: "04", alias: "4  /  dean",            label: "Dean",          color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const ROLE_BADGE_COLORS = {
    "Student":       "bg-blue-50 text-blue-700 border-blue-200",
    "Adviser":       "bg-purple-50 text-purple-700 border-purple-200",
    "Program Chair": "bg-amber-50 text-amber-700 border-amber-200",
    "Dean":          "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─── CSV Preview Modal ────────────────────────────────────────────────────────
function CsvPreviewModal({ preview, onConfirm, onCancel, uploading }) {
    const valid = preview.filter(r => r.valid);
    const invalid = preview.filter(r => !r.valid);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">CSV Import Preview</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {valid.length} valid row{valid.length !== 1 ? "s" : ""} will be imported
                            {invalid.length > 0 && `, ${invalid.length} will be skipped`}.
                        </p>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100">
                        <XIcon size={16} />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1 px-2">
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-slate-100 text-xs text-slate-500">
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Role</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.map((row, i) => (
                                <tr key={i} className={`border-b border-slate-50 last:border-0 ${!row.valid ? "bg-red-50/40" : ""}`}>
                                    <td className="px-4 py-2.5 text-slate-800 font-medium">{row.name}</td>
                                    <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{row.email}</td>
                                    <td className="px-4 py-2.5">
                                        {row.roleName && row.roleName !== "Unknown" ? (
                                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE_COLORS[row.roleName] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                {row.roleName}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-red-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.valid ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                <CheckCircleIcon size={12} /> Valid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600" title={row.error}>
                                                <AlertTriangleIcon size={12} /> {row.error}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 gap-3">
                    <p className="text-xs text-slate-400">
                        {invalid.length > 0 && "Rows with errors will be skipped."}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onCancel} disabled={uploading} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={uploading || valid.length === 0}
                            className="rounded-lg bg-[#7a1f2b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#5a121d] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? "Importing…" : `Confirm & Import ${valid.length} User${valid.length !== 1 ? "s" : ""}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function ITAdminDashboard({ user = { name: "Admin Dela Rosa", initials: "AD" }, onLogout = () => {}, view, setView }) {
    const [activeTab, setActiveTab] = useState(0);
    const [usersList, setUsersList] = useState(() => accounts.map(acc => ({ ...acc })));
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [editRole, setEditRole] = useState({});

    // CSV state
    const [csvFile, setCsvFile] = useState(null);            // File object
    const [isDragging, setIsDragging] = useState(false);
    const [csvPreview, setCsvPreview] = useState(null);       // array of preview rows from server
    const [previewUploading, setPreviewUploading] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const totalAccounts = usersList.length;
    const whitelistedCount = usersList.filter(u => u.whitelisted).length;
    const blockedCount = usersList.filter(u => !u.whitelisted).length;

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    // ─── User Management Handlers ──────────────────────────────────────────────
    const handleSaveRole = (email) => {
        const newRole = editRole[email];
        if (newRole === undefined) return;
        setUsersList(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
        const accIdx = accounts.findIndex(a => a.email === email);
        if (accIdx !== -1) accounts[accIdx].role = newRole;
        showToast(`Role updated for ${email}.`);
    };

    const handleToggleWhitelist = (email) => {
        setUsersList(prev => prev.map(u => {
            if (u.email === email) {
                const nextState = !u.whitelisted;
                const accIdx = accounts.findIndex(a => a.email === email);
                if (accIdx !== -1) accounts[accIdx].whitelisted = nextState;
                showToast(`${u.name} is now ${nextState ? "WHITELISTED" : "BLOCKED"}.`);
                return { ...u, whitelisted: nextState };
            }
            return u;
        }));
    };

    // ─── CSV Drag & Drop ───────────────────────────────────────────────────────
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
        e.target.value = "";
    };

    function processFile(file) {
        if (!file.name.endsWith('.csv')) {
            showToast("Only .csv files are accepted.", "error");
            return;
        }
        setCsvFile(file);
    }

    // ─── CSV Preview: sends file to /api/users/preview-csv ────────────────────
    const handlePreview = async () => {
        if (!csvFile) {
            showToast("Please select or drop a CSV file first.", "error");
            return;
        }
        setPreviewUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", csvFile);
            const res = await fetch("/api/users/preview-csv", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || "Preview failed.", "error");
                return;
            }
            setCsvPreview(data.preview);
        } catch (err) {
            showToast("Could not reach server for preview.", "error");
        } finally {
            setPreviewUploading(false);
        }
    };

    // ─── CSV Confirm & Import: sends file to /api/users/upload-csv ────────────
    const handleConfirmImport = async () => {
        if (!csvFile) return;
        setImporting(true);
        try {
            const formData = new FormData();
            formData.append("file", csvFile);
            const res = await fetch("/api/users/upload-csv", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || "Import failed.", "error");
                return;
            }
            showToast(`✓ ${data.importedCount} user(s) imported & whitelisted.`);
            setCsvPreview(null);
            setCsvFile(null);
        } catch (err) {
            showToast("Server unreachable. Import failed.", "error");
        } finally {
            setImporting(false);
        }
    };

    const handleCancelPreview = () => {
        setCsvPreview(null);
    };

    // ─── Filtered Users ────────────────────────────────────────────────────────
    const filtered = usersList.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const sidebarIcons = [
        { icon: HomeIcon, label: "Dashboard", onClick: () => setView("Dashboard") },
        { icon: FileTextIcon, label: "Accounts", onClick: () => setView("Accounts") },
        { icon: RotateIcon, label: "Workflow Guide", onClick: () => setView("Workflow Guide") },
    ];
    const activeSidebarIndex = view === "Accounts" ? 1 : view === "Workflow Guide" ? 2 : 0;

    return (
        <DashboardLayout
            userName={user.name}
            userInitials={user.initials}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showTabs={false}
            title={view === "Accounts" ? "User Management — Accounts" : view === "Workflow Guide" ? "Workflow Guide" : "Dashboard"}
            showAddButton={false}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
            role="it-admin"
        >
            {/* CSV Preview Modal */}
            {csvPreview && (
                <CsvPreviewModal
                    preview={csvPreview}
                    onConfirm={handleConfirmImport}
                    onCancel={handleCancelPreview}
                    uploading={importing}
                />
            )}

            {view === "Accounts" || view === "Dashboard" ? (
                <div className="space-y-6">
                    {/* Hero Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white shadow-sm">
                        <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
                        <p className="mt-1 max-w-xl text-sm text-white/85">
                            Manage whitelisted accounts, assign roles, and audit system access.
                        </p>
                        <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                            {user.initials}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <StatCard label="TOTAL ACCOUNTS" value={totalAccounts} valueColor="text-slate-800" />
                        <StatCard label="WHITELISTED" value={whitelistedCount} valueColor="text-emerald-600" />
                        <StatCard label="BLOCKED" value={blockedCount} valueColor="text-red-600" />
                    </div>

                    {/* ─── CSV Upload Section ──────────────────────────────────────── */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-1 text-sm font-bold text-slate-800">Bulk Upload Users via CSV</h3>
                        <p className="mb-4 text-xs text-slate-500">Upload a CSV to bulk-import and whitelist user accounts.</p>

                        {/* Role Code Guide */}
                        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <InfoIcon size={14} className="text-blue-500 shrink-0" />
                                <p className="text-xs font-semibold text-blue-800">CSV Format Guide</p>
                            </div>
                            <p className="text-xs text-blue-700 mb-2">
                                Required columns: <span className="font-mono bg-blue-100 px-1 rounded">name</span>, <span className="font-mono bg-blue-100 px-1 rounded">email</span>, <span className="font-mono bg-blue-100 px-1 rounded">role</span>. Column headers are case-insensitive.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {ROLE_CODE_GUIDE.map(r => (
                                    <div key={r.code} className={`rounded-md border px-2.5 py-1.5 text-xs ${r.color}`}>
                                        <p className="font-mono font-bold">{r.code}</p>
                                        <p className="opacity-70 text-[10px]">or: {r.alias}</p>
                                        <p className="font-semibold mt-0.5">{r.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all select-none ${
                                isDragging
                                    ? "border-[#7a1f2b] bg-[#7a1f2b]/5"
                                    : csvFile
                                    ? "border-emerald-400 bg-emerald-50"
                                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileInputChange}
                            />
                            <UploadCloudIcon size={32} className={csvFile ? "text-emerald-500" : "text-slate-400"} />
                            {csvFile ? (
                                <>
                                    <p className="text-sm font-semibold text-emerald-700">{csvFile.name}</p>
                                    <p className="text-xs text-emerald-600">{(csvFile.size / 1024).toFixed(1)} KB · Click to replace</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-semibold text-slate-700">Drag & drop your CSV here</p>
                                    <p className="text-xs text-slate-400">or click to browse · .csv files only</p>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 flex items-center justify-end gap-2">
                            {csvFile && (
                                <button
                                    onClick={() => { setCsvFile(null); setCsvPreview(null); }}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={handlePreview}
                                disabled={!csvFile || previewUploading}
                                className="rounded-lg bg-[#7a1f2b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5a121d] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {previewUploading ? "Parsing…" : "Preview & Import"}
                            </button>
                        </div>
                    </div>

                    {/* ─── User Management Table ───────────────────────────────────── */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-5 py-3.5 gap-4">
                            <h2 className="!text-sm !font-semibold !text-slate-800">User Management — Role Assignment</h2>
                            <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 bg-slate-50">
                                <SearchIcon size={14} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-transparent text-xs text-slate-700 outline-none placeholder-slate-400 w-40"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-xs text-slate-500">
                                        <th className="px-5 py-3 font-semibold">No.</th>
                                        <th className="px-5 py-3 font-semibold">User</th>
                                        <th className="px-5 py-3 font-semibold">Role</th>
                                        <th className="px-5 py-3 font-semibold">Whitelist Status</th>
                                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((account, idx) => {
                                            const currentRoleVal = editRole[account.email] !== undefined ? editRole[account.email] : account.role;
                                            return (
                                                <tr key={account.email} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                                                    <td className="px-5 py-3 text-slate-400">{idx + 1}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a1f2b] text-[11px] font-bold text-white shrink-0">
                                                                {account.initials}
                                                            </span>
                                                            <div>
                                                                <p className="font-semibold text-slate-800 leading-tight">{account.name}</p>
                                                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{account.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <select
                                                            value={currentRoleVal}
                                                            onChange={(e) => setEditRole(prev => ({ ...prev, [account.email]: parseInt(e.target.value) }))}
                                                            className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
                                                        >
                                                            {[1, 2, 3, 4, 5, 6].map((roleId) => (
                                                                <option key={roleId} value={roleId}>
                                                                    {ROLE_NAMES[roleId]}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <button
                                                            onClick={() => handleToggleWhitelist(account.email)}
                                                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer ${
                                                                account.whitelisted
                                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                                                    : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                                            }`}
                                                        >
                                                            {account.whitelisted ? <CheckCircleIcon size={12} /> : <XCircleIcon size={12} />}
                                                            {account.whitelisted ? "WHITELISTED" : "BLOCKED"}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button
                                                            disabled={editRole[account.email] === undefined || editRole[account.email] === account.role}
                                                            onClick={() => handleSaveRole(account.email)}
                                                            className="rounded bg-[#7a1f2b] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#5a121d] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                                        >
                                                            Save Role
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : view === "Workflow Guide" ? (
                <WorkflowGuide />
            ) : null}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg z-50 transition-all ${
                    toast.type === "error" ? "bg-red-700" : "bg-slate-900"
                }`}>
                    {toast.message}
                </div>
            )}
        </DashboardLayout>
    );
}
