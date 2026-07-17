import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import { FileTextIcon, HomeIcon, RotateIcon } from "../../components/icons.jsx";
import WorkflowGuide from "../../components/WorkflowGuide.jsx";
import { accounts, ROLE_NAMES } from "../../data/accounts.js";

export default function ITAdminDashboard({ user = { name: "Admin Dela Rosa", initials: "AD" }, onLogout = () => {} }) {
    const [view, setView] = useState("Dashboard");
    const [activeTab, setActiveTab] = useState(0);
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.length;
    const rolesCount = new Set(accounts.map((a) => a.role)).size;

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
            showAddButton={false}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
            role="it-admin"
        >
            {view === "Accounts" ? (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                        <h2 className="!text-sm !font-semibold !text-slate-800">All Accounts</h2>
                        <span className="text-xs text-slate-400">{totalAccounts} accounts</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                                    <th className="px-5 py-3 font-medium">Name</th>
                                    <th className="px-5 py-3 font-medium">Email</th>
                                    <th className="px-5 py-3 font-medium">Role</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account) => (
                                    <tr key={account.email} className="border-b border-slate-50 last:border-0">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7a1f2b] text-[11px] font-bold text-white">
                                                    {account.initials}
                                                </span>
                                                <span className="font-medium text-slate-800">{account.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">{account.email}</td>
                                        <td className="px-5 py-3">
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                {ROLE_NAMES[account.role] || account.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : view === "Workflow Guide" ? (
                <WorkflowGuide />
            ) : (
                <>
                    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#4a1319] px-8 py-6 text-white">
<h1 className="!m-0 !text-xl !font-bold !text-white">Welcome, {user.name}!</h1>
                            <p className="mt-1 max-w-xl text-sm text-white/85">
                                Manage whitelisted accounts, assign roles, and audit system access.
                            </p>
                            <div className="absolute right-8 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 text-lg font-bold">
                                {user.initials}
                            </div>
                    </div>

                    <div className="mb-6 flex gap-4">
                        <StatCard label="TOTAL ACCOUNTS" value={totalAccounts} valueColor="text-[#7a1f2b]" />
                        <StatCard label="ACTIVE" value={activeAccounts} valueColor="text-emerald-600" />
                        <StatCard label="ROLES" value={rolesCount} valueColor="text-blue-600" />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <h2 className="!text-sm !font-semibold !text-slate-800">Recent Accounts</h2>
                            <span className="text-xs text-slate-400">{totalAccounts} registered</span>
                        </div>
                        {accounts.map((account, i) => (
                            <div key={account.email} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 w-5">{i + 1}.</span>
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7a1f2b] text-[11px] font-bold text-white">
                                        {account.initials}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{account.name}</p>
                                        <p className="text-xs text-slate-400">{account.email}</p>
                                    </div>
                                </div>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                    {ROLE_NAMES[account.role] || account.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
