import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import { FileTextIcon, HomeIcon, RotateIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from "../../components/icons.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import { accounts, ROLE_NAMES } from "../../data/accounts.js";

// Simple Inline Search Icon
const SearchIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// Simple Inline Upload Icon
const UploadIcon = ({ size = 16, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export default function ITAdminDashboard({ user = { name: "Admin Dela Rosa", initials: "AD" }, onLogout = () => {}, view, setView }) {
    const [activeTab, setActiveTab] = useState(0);
    const [usersList, setUsersList] = useState(() => accounts.map(acc => ({ ...acc })));
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    
    // Track edit roles locally
    const [editRole, setEditRole] = useState({});

    const totalAccounts = usersList.length;
    const whitelistedCount = usersList.filter((u) => u.whitelisted).length;
    const blockedCount = usersList.filter((u) => !u.whitelisted).length;

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2500);
    };

    const handleSaveRole = (email) => {
        const newRole = editRole[email];
        if (newRole === undefined) return;
        
        setUsersList(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
        // Update source array as well so logout/login picks it up
        const accIdx = accounts.findIndex(a => a.email === email);
        if (accIdx !== -1) accounts[accIdx].role = newRole;
        
        showToast(`Role updated successfully for ${email}.`);
    };

    const handleToggleWhitelist = (email) => {
        setUsersList(prev => prev.map(u => {
            if (u.email === email) {
                const nextState = !u.whitelisted;
                // Update source array
                const accIdx = accounts.findIndex(a => a.email === email);
                if (accIdx !== -1) accounts[accIdx].whitelisted = nextState;
                showToast(`${u.name} is now ${nextState ? "WHITELISTED" : "BLOCKED"}.`);
                return { ...u, whitelisted: nextState };
            }
            return u;
        }));
    };

    const handleCsvSimulate = () => {
        if (!csvFile) {
            showToast("Please choose a simulated file first.");
            return;
        }
        
        // Let's add a couple of new mock users to simulate CSV upload
        const newUsers = [
            { initials: "KT", name: "Katherine Torres", email: "k.torres@university.edu.ph", role: 1, whitelisted: true }
        ];

        let addedCount = 0;
        setUsersList(prev => {
            const nextList = [...prev];
            newUsers.forEach(nu => {
                if (!nextList.some(u => u.email === nu.email)) {
                    nextList.push(nu);
                    accounts.push(nu);
                    addedCount++;
                }
            });
            return nextList;
        });

        setCsvFile(null);
        showToast(`CSV Upload complete: Imported and Whitelisted ${addedCount} user(s).`);
    };

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
            {view === "Accounts" || view === "Dashboard" ? (
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white shadow-sm">
                        <h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
                        <p className="mt-1 max-w-xl text-sm text-white/85">
                            Manage whitelisted accounts, assign roles, and audit system access.
                        </p>
                        <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                            {user.initials}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <StatCard label="TOTAL ACCOUNTS" value={totalAccounts} valueColor="text-slate-800" />
                        <StatCard label="WHITELISTED" value={whitelistedCount} valueColor="text-emerald-600" />
                        <StatCard label="BLOCKED" value={blockedCount} valueColor="text-red-600" />
                    </div>

                    {/* CSV Upload Section */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-slate-800">Upload Login Credentials</h3>
                        <div className="mb-4 flex items-start gap-2 rounded-lg border !border-blue-200 !bg-blue-50 px-4 py-3 text-sm !text-blue-800">
                            <InfoIcon size={16} className="mt-0.5 shrink-0 !text-blue-400" />
                            <p>
                                Upload a CSV file with columns: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">name, email, role, program</span>.
                                Only whitelisted Google accounts will be able to log in to the system.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setCsvFile("credentials.csv")}
                                className="flex-1 flex items-center justify-between px-3 py-2 rounded border border-slate-200 bg-slate-50 text-sm text-slate-500 text-left hover:bg-slate-100 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <UploadIcon size={14} className="text-slate-400" />
                                    {csvFile || "Choose simulated credentials.csv"}
                                </span>
                            </button>
                            <button 
                                onClick={handleCsvSimulate}
                                className="rounded-md bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a121d] transition-colors cursor-pointer"
                            >
                                Upload & Whitelist
                            </button>
                        </div>
                    </div>

                    {/* Users Management Section */}
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
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg z-50">
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}
