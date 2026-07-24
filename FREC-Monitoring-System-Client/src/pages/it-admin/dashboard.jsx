import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import {
    FileTextIcon, HomeIcon, RotateIcon,
    CheckCircleIcon, XCircleIcon, InfoIcon,
    PencilIcon, TrashIcon,
} from "../../components/icons.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import { ROLE_NAMES } from "../../data/accounts.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ROLE_IDS = Object.keys(ROLE_NAMES).map(Number);

const SearchIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const UploadIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
const SpinnerIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default function ITAdminDashboard({
    user = { name: "Admin Dela Rosa", initials: "AD" },
    onLogout = () => { },
    view,
    setView,
}) {
    const [activeTab, setActiveTab] = useState(0);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [toastType, setToastType] = useState("success"); // "success" | "error"
    const [csvFile, setCsvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [editRole, setEditRole] = useState({});
    const [savingRole, setSavingRole] = useState({});
    const [editingUser, setEditingUser] = useState(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editProgram, setEditProgram] = useState("");
    const [csvPreview, setCsvPreview] = useState(null);
    const fileInputRef = useRef(null);

    // ── Derived counts ────────────────────────────────────────────────────────
    const totalAccounts = usersList.length;
    const whitelistedCount = usersList.filter(u => u.whitelisted).length;
    const blockedCount = usersList.filter(u => !u.whitelisted).length;

    const filtered = usersList.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    // ── Helpers ───────────────────────────────────────────────────────────────
    const showToast = (message, type = "success") => {
        setToast(message);
        setToastType(type);
        window.setTimeout(() => setToast(null), 3000);
    };

    const initialsFor = (name = "") =>
        name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    // ── Fetch users from DB ───────────────────────────────────────────────────
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/users`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch users");
            setUsersList(data.users);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Toggle whitelist ──────────────────────────────────────────────────────
    const handleToggleWhitelist = async (userId, currentState, name) => {
        const next = !currentState;
        // Optimistic update
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, whitelisted: next } : u));

        try {
            const res = await fetch(`${API}/api/users/${userId}/whitelist`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ whitelisted: next }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");
            showToast(`${name} is now ${next ? "WHITELISTED" : "BLOCKED"}.`);
        } catch (err) {
            // Roll back on failure
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, whitelisted: currentState } : u));
            showToast(err.message, "error");
        }
    };

    // ── Save role ─────────────────────────────────────────────────────────────
    const handleSaveRole = async (userId, email) => {
        const newRoleId = editRole[email];
        if (newRoleId === undefined) return;

        setSavingRole(prev => ({ ...prev, [email]: true }));
        try {
            const res = await fetch(`${API}/api/users/${userId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_id: newRoleId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Role update failed");

            setUsersList(prev => prev.map(u =>
                u.id === userId ? { ...u, role: data.user.role, role_id: newRoleId } : u
            ));
            setEditRole(prev => { const n = { ...prev }; delete n[email]; return n; });
            showToast(`Role updated for ${email}.`);

            if (user?.id === userId && newRoleId !== 6) {
                window.setTimeout(() => onLogout(), 800);
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSavingRole(prev => { const n = { ...prev }; delete n[email]; return n; });
        }
    };

    // ── CSV upload ────────────────────────────────────────────────────────────
    const handleCsvUpload = async () => {
        if (!csvFile) {
            showToast("Please choose a CSV file first.", "error");
            return;
        }
        setUploading(true);
        try {
            const form = new FormData();
            form.append("file", csvFile);

            const res = await fetch(`${API}/api/users/import`, {
                method: "POST",
                body: form,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            // Refresh the user list from DB
            await fetchUsers();
            setCsvFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            showToast(`${data.message}`);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setUploading(false);
        }
    };

    // ── Edit user ────────────────────────────────────────────────────────────
    const handleEditUser = (u) => {
        setEditingUser(u);
        setEditName(u.name);
        setEditEmail(u.email);
        setEditProgram(u.program || "");
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (!editName.trim() || !editEmail.trim()) return;
        try {
            const res = await fetch(`${API}/api/users/${editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim(), email: editEmail.trim(), program: editProgram.trim() || null }),
            });
            if (!res.ok) throw new Error("Failed to update user");
            setUsersList(prev => prev.map(u =>
                u.id === editingUser.id
                    ? { ...u, name: editName.trim(), email: editEmail.trim(), program: editProgram.trim() || null }
                    : u
            ));
            setEditingUser(null);
            showToast("User updated.");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // ── Delete user ──────────────────────────────────────────────────────────
    const handleDeleteUser = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}" (${userId})? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API}/api/users/${userId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete user");
            setUsersList(prev => prev.filter(u => u.id !== userId));
            showToast(`"${name}" deleted.`);
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // ── CSV preview ──────────────────────────────────────────────────────────
    const handleFileChangeWithPreview = (e) => {
        const f = e.target.files?.[0];
        if (f) {
            setCsvFile(f);
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target.result;
                const lines = text.split("\n").filter(l => l.trim());
                const previewRows = lines.slice(0, 6);
                setCsvPreview(previewRows);
            };
            reader.readAsText(f.slice(0, 4096));
        }
    };

    // ── Sidebar ───────────────────────────────────────────────────────────────
    const sidebarIcons = [
        { icon: HomeIcon, label: "Dashboard", onClick: () => setView("Dashboard") },
        { icon: FileTextIcon, label: "Accounts", onClick: () => setView("Accounts") },
        { icon: RotateIcon, label: "Workflow Guide", onClick: () => setView("Workflow Guide") },
    ];
    const activeSidebarIndex = view === "Accounts" ? 1 : view === "Workflow Guide" ? 2 : 0;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout
            userName={user.name}
            userInitials={user.initials}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showTabs={false}
            title={
                view === "Accounts"
                    ? "User Management — Accounts"
                    : view === "Workflow Guide"
                        ? "Workflow Guide"
                        : "Dashboard"
            }
            showAddButton={false}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
            role="it-admin"
            userProgram={user.program}
        >
            {view === "Workflow Guide" ? (
                <WorkflowGuide />
            ) : (
                <div className="space-y-6">
                    {/* Hero banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white shadow-sm">
                        <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
                        <p className="mt-1 max-w-xl text-sm text-white/85">
                            Manage whitelisted accounts, assign roles, and audit system access.
                        </p>
                        <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                            {user.initials}
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="flex gap-4">
                        <StatCard label="TOTAL ACCOUNTS" value={totalAccounts} valueColor="text-slate-800" />
                        <StatCard label="WHITELISTED" value={whitelistedCount} valueColor="text-emerald-600" />
                        <StatCard label="BLOCKED" value={blockedCount} valueColor="text-red-600" />
                    </div>

                    {/* CSV Upload */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-slate-800">Upload Login Credentials via CSV</h3>
                        <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                            <InfoIcon size={16} className="mt-0.5 shrink-0 text-blue-400" />
                            <p>
                                CSV columns:{" "}
                                <span className="rounded bg-blue-100 px-1 py-0.5 font-mono">
                                    name, email, role, program
                                </span>
                                . All imported users are automatically <strong>whitelisted</strong>.
                                Existing emails are updated in-place.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 transition-colors">
                                    <span className="flex items-center gap-2">
                                        <UploadIcon size={14} className="text-slate-400" />
                                        {csvFile ? csvFile.name : "Choose credentials CSV…"}
                                    </span>
                                    {csvFile && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); setCsvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                            className="ml-2 text-slate-400 hover:text-red-500"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="hidden"
                                        onChange={handleFileChangeWithPreview}
                                    />
                            </label>
                            <button
                                onClick={handleCsvUpload}
                                disabled={uploading || !csvFile}
                                className="flex items-center gap-2 rounded-md bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a121d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {uploading ? <><SpinnerIcon size={14} /> Importing…</> : <><UploadIcon size={14} /> Upload & Whitelist</>}
                            </button>
                        </div>
                    </div>

                    {/* CSV Preview */}
                    {csvPreview && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-2 text-sm font-semibold text-slate-800">CSV Preview</h3>
                            <div className="overflow-x-auto rounded border border-slate-100">
                                <table className="w-full text-left text-xs">
                                    <tbody>
                                        {csvPreview.map((line, i) => (
                                            <tr key={i} className={i === 0 ? "bg-slate-50 font-semibold text-slate-600" : "text-slate-700 border-t border-slate-50"}>
                                                {line.split(",").map((cell, j) => (
                                                    <td key={j} className="px-3 py-1.5 whitespace-nowrap">{cell.trim()}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {csvPreview.length >= 6 && (
                                <p className="mt-2 text-[11px] text-slate-400">Showing first 5 data rows.</p>
                            )}
                        </div>
                    )}

                    {/* Users table */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-5 py-3.5 gap-4">
                            <h2 className="!text-sm !font-semibold !text-slate-800">
                                User Accounts
                                {!loading && (
                                    <span className="ml-2 text-xs font-normal text-slate-400">
                                        ({filtered.length} shown)
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5">
                                <SearchIcon size={14} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-40 bg-transparent text-xs text-slate-700 outline-none placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-xs text-slate-500">
                                        <th className="px-5 py-3 font-semibold">No.</th>
                                        <th className="px-5 py-3 font-semibold">User</th>
                                        <th className="px-5 py-3 font-semibold">Role</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                                                <span className="inline-flex items-center gap-2">
                                                    <SpinnerIcon size={14} /> Loading accounts…
                                                </span>
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((account, idx) => {
                                            const roleVal = editRole[account.email] !== undefined
                                                ? editRole[account.email]
                                                : account.role_id;
                                            const isDirty = editRole[account.email] !== undefined && editRole[account.email] !== account.role_id;
                                            const isSaving = savingRole[account.email];

                                            return (
                                                <tr key={account.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                                                    <td className="px-5 py-3 text-slate-400">{idx + 1}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7a1f2b] text-[11px] font-bold text-white">
                                                                {initialsFor(account.name)}
                                                            </span>
                                                            <div>
                                                                <p className="font-semibold leading-tight text-slate-800">{account.name}</p>
                                                                <p className="mt-0.5 font-mono text-[11px] text-slate-400">{account.email}</p>
                                                                {account.program && (
                                                                    <p className="text-[10px] text-slate-400">{account.program}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <select
                                                            value={roleVal}
                                                            onChange={e => setEditRole(prev => ({ ...prev, [account.email]: parseInt(e.target.value) }))}
                                                            className="cursor-pointer rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300"
                                                        >
                                                            {ROLE_IDS.map(id => (
                                                                <option key={id} value={id}>{ROLE_NAMES[id]}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <button
                                                            onClick={() => handleToggleWhitelist(account.id, account.whitelisted, account.name)}
                                                            className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold transition-all ${account.whitelisted
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                                                }`}
                                                        >
                                                            {account.whitelisted
                                                                ? <><CheckCircleIcon size={12} /> WHITELISTED</>
                                                                : <><XCircleIcon size={12} /> BLOCKED</>}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                disabled={!isDirty || isSaving}
                                                                onClick={() => handleSaveRole(account.id, account.email)}
                                                                className="inline-flex items-center gap-1.5 rounded bg-[#7a1f2b] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#5a121d] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                                            >
                                                                {isSaving ? <><SpinnerIcon size={12} /> Saving…</> : "Save Role"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditUser(account)}
                                                                title="Edit user"
                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 cursor-pointer"
                                                            >
                                                                <PencilIcon size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(account.id, account.name)}
                                                                title="Delete user"
                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700 cursor-pointer"
                                                            >
                                                                <TrashIcon size={13} />
                                                            </button>
                                                        </div>
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
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <form onSubmit={handleSaveUser} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-sm font-semibold text-slate-800">Edit User</h3>
                        <p className="mb-4 text-xs text-slate-500">{editingUser.id}</p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                                placeholder="Name"
                                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
                            />
                            <input
                                type="email"
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                required
                                placeholder="Email"
                                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
                            />
                            <input
                                type="text"
                                value={editProgram}
                                onChange={e => setEditProgram(e.target.value)}
                                placeholder="Program"
                                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${toastType === "error" ? "bg-red-700" : "bg-slate-900"}`}>
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}
