import { useState } from "react";
import AllDocuments from "../../components/AllDocuments.jsx";
import { StatCard } from "../../components/StatCard.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    FileTextIcon,
    HomeIcon,
    InfoIcon,
    PlusIcon,
    SearchIcon,
    UploadIcon,
    UsersIcon,
} from "../../components/icons.jsx";

const ALL_DOCUMENTS = [
    { id: 1, docId: "DOC-2024-001", title: "Thesis Certification Request", student: "Maria Santos", studentNo: "2021-00145", adviser: "Dr. Reyes", mode: 1, status: "FORWARDED-FREC", dateUpdated: "2024-06-08" },
    { id: 2, docId: "DOC-2024-002", title: "Research Certification", student: "Juan dela Cruz", studentNo: "2021-00203", adviser: "Dr. Lim", mode: 2, status: "CERT GENERATED", dateUpdated: "2024-06-10" },
    { id: 3, docId: "DOC-2024-003", title: "Project Endorsement", student: "Ana Reyes", studentNo: "2022-00087", adviser: "Prof. Garcia", mode: 3, status: "FOR REVIEW", dateUpdated: "2024-06-11" },
    { id: 4, docId: "DOC-2024-004", title: "Thesis Certification Request", student: "Carlos Mendoza", studentNo: "2020-00312", adviser: "Dr. Reyes", mode: null, status: "SUBMITTED", dateUpdated: "2024-06-06" },
    { id: 5, docId: "DOC-2024-005", title: "Research Certification", student: "Lisa Tan", studentNo: "2021-00421", adviser: "Dr. Lim", mode: 1, status: "DISAPPROVED", dateUpdated: "2024-06-09" },
    { id: 6, docId: "DOC-2024-006", title: "Project Endorsement", student: "Miguel Cruz", studentNo: "2022-00156", adviser: "Prof. Garcia", mode: 2, status: "APPROVED", dateUpdated: "2024-06-12" },
    { id: 7, docId: "DOC-2024-007", title: "Thesis Certification Request", student: "Sofia Bautista", studentNo: "2021-00089", adviser: "Dr. Reyes", mode: 1, status: "ADVISER APPROVED", dateUpdated: "2024-06-09" },
    { id: 8, docId: "DOC-2024-008", title: "Research Certification", student: "Paolo Villanueva", studentNo: "2020-00445", adviser: "Dr. Lim", mode: 3, status: "DEAN ENDORSED", dateUpdated: "2024-06-11" },
];

const INITIAL_USERS = [
    { id: 1, initials: "MS", name: "Maria Santos", email: "m.santos@university.edu.ph", role: "Student", program: "BS Computer Science", whitelisted: true },
    { id: 2, initials: "DE", name: "Dr. Elena Reyes", email: "e.reyes@university.edu.ph", role: "Adviser", program: "BS Computer Science", whitelisted: true },
    { id: 3, initials: "AD", name: "Admin Dela Rosa", email: "it.admin@university.edu.ph", role: "IT Admin", program: "—", whitelisted: true },
    { id: 4, initials: "DJ", name: "Dr. Jose Santos", email: "j.santos@university.edu.ph", role: "Program Chair", program: "BS Computer Science", whitelisted: true },
    { id: 5, initials: "DA", name: "Dr. Amalia Cruz", email: "a.cruz@university.edu.ph", role: "Dean", program: "—", whitelisted: true },
    { id: 6, initials: "PR", name: "Prof. Ramon Dela Cruz", email: "r.delacruz@university.edu.ph", role: "Reviewer (FREC)", program: "—", whitelisted: true },
    { id: 7, initials: "JL", name: "Juan dela Cruz", email: "j.delacruz@university.edu.ph", role: "Student", program: "BS Information Systems", whitelisted: true },
    { id: 8, initials: "LT", name: "Lisa Tan", email: "l.tan@university.edu.ph", role: "Student", program: "BS Computer Science", whitelisted: false },
];

const ROLE_OPTIONS = ["Student", "Adviser", "IT Admin", "Program Chair", "Dean", "Reviewer (FREC)"];

function HeaderRow({ title, action }) {
    return (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="!m-0 !text-lg !font-bold !text-slate-800">{title}</h1>
            {action}
        </div>
    );
}

function WelcomeBanner({ userName, initials }) {
    return (
        <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-[#7a1f2b] via-[#891719] to-[#66431d] px-5 py-5 text-white sm:px-8 sm:py-6">
            <div className="relative pr-0 sm:pr-24">
                <h2 className="!m-0 !text-xl !font-bold !text-white">Welcome, {userName}!</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                    This is CertTrack, your certification monitoring dashboard. Track document
                    submissions, monitor approval status, and manage the certification workflow.
                </p>
            </div>
            <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 text-lg font-bold sm:absolute sm:right-8 sm:top-1/2 sm:mt-0 sm:h-16 sm:w-16 sm:-translate-y-1/2 sm:text-xl">
                {initials}
            </div>
        </div>
    );
}

function UploadCredentials({ onUpload }) {
    return (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <h2 className="!m-0 !mb-4 !text-sm !font-semibold !text-slate-800">Upload Login Credentials</h2>
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <InfoIcon size={16} className="mt-0.5 shrink-0" />
                <p>
                    Upload a CSV file with columns: <span className="font-mono">name, email, role, program</span>.
                    Only whitelisted Google accounts will be able to log in to the system.
                </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 hover:border-[#7a1f2b] hover:text-[#7a1f2b]">
                    <UploadIcon size={16} />
                    <span className="truncate font-mono">credentials.csv</span>
                    <input className="sr-only" type="file" accept=".csv" />
                </label>
                <button
                    type="button"
                    onClick={onUpload}
                    className="rounded-md bg-[#7a1f2b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#671a24]"
                >
                    Upload
                </button>
            </div>
        </section>
    );
}

function WhitelistBadge({ whitelisted }) {
    return (
        <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${whitelisted
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
                }`}
        >
            {whitelisted ? "✓ WHITELISTED" : "BLOCKED"}
        </span>
    );
}

function UserManagementTable({ users, onRoleChange, compact = false }) {
    const [search, setSearch] = useState("");
    const filtered = users.filter((user) => {
        const query = search.toLowerCase();
        return [user.name, user.email, user.role, user.program].some((value) =>
            value.toLowerCase().includes(query)
        );
    });
    const visibleUsers = compact ? filtered.slice(0, 5) : filtered;

    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="!m-0 !text-sm !font-semibold !text-slate-800">
                    User Management — Role Assignment
                </h2>
                <div className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 lg:w-64">
                    <SearchIcon size={15} />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
                        placeholder="Search users..."
                        type="search"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                            <th className="px-5 py-3">No.</th>
                            <th className="px-5 py-3">User</th>
                            <th className="px-5 py-3">Role</th>
                            <th className="px-5 py-3">Program</th>
                            <th className="px-5 py-3">Whitelist Status</th>
                            <th className="px-5 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                                    No users match this search.
                                </td>
                            </tr>
                        ) : (
                            visibleUsers.map((user, index) => (
                                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                                    <td className="px-5 py-4 text-slate-500">{index + 1}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7a1f2b] text-xs font-bold text-white">
                                                {user.initials}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">{user.name}</div>
                                                <div className="font-mono text-xs text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(event) => onRoleChange(user.id, event.target.value)}
                                            className="w-44 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none hover:border-[#7a1f2b] focus:border-[#7a1f2b]"
                                        >
                                            {ROLE_OPTIONS.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{user.program}</td>
                                    <td className="px-5 py-4">
                                        <WhitelistBadge whitelisted={user.whitelisted} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-[#7a1f2b] hover:text-[#671a24]"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function AdminStats({ totalUsers, whitelistedUsers, blockedUsers }) {
    return (
        <div className="mb-6 flex gap-4">
            <StatCard label="TOTAL USERS" value={totalUsers} valueColor="text-[#7a1f2b]" />
            <StatCard label="WHITELISTED" value={whitelistedUsers} valueColor="text-emerald-700" />
            <StatCard label="BLOCKED" value={blockedUsers} valueColor="text-red-600" />
        </div>
    );
}

export default function AdminDashboard({ user, onLogout = () => { } }) {
    const [view, setView] = useState("Dashboard");
    const [users, setUsers] = useState(INITIAL_USERS);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2200);
    };

    const handleRoleChange = (id, role) => {
        setUsers((current) => current.map((item) => (item.id === id ? { ...item, role } : item)));
    };

    const totalUsers = users.length;
    const whitelistedUsers = users.filter((item) => item.whitelisted).length;
    const blockedUsers = totalUsers - whitelistedUsers;
    const initials = user?.initials || "AD";
    const userName = user?.name || "Admin Dela Rosa";

    const sidebarIcons = [
        { icon: HomeIcon, label: "Dashboard", onClick: () => setView("Dashboard") },
        { icon: FileTextIcon, label: "All Documents", onClick: () => setView("All Documents") },
        { icon: UsersIcon, label: "User Management", onClick: () => setView("User Management") },
    ];
    const activeSidebarIndex = view === "All Documents" ? 1 : view === "User Management" ? 2 : 0;

    return (
        <DashboardLayout
            userName={userName}
            userInitials={initials}
            showTabs={false}
            sidebarIcons={sidebarIcons}
            activeSidebarIndex={activeSidebarIndex}
            onLogout={onLogout}
        >
            {view === "All Documents" ? (
                <AllDocuments documents={ALL_DOCUMENTS} />
            ) : view === "User Management" ? (
                <>
                    <HeaderRow
                        title="User Management"
                        action={
                            <button
                                type="button"
                                onClick={() => showToast("Add user form would open here.")}
                                className="flex items-center gap-2 rounded-lg bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#671a24]"
                            >
                                <PlusIcon size={16} /> Add User
                            </button>
                        }
                    />
                    <AdminStats
                        totalUsers={totalUsers}
                        whitelistedUsers={whitelistedUsers}
                        blockedUsers={blockedUsers}
                    />
                    <UploadCredentials onUpload={() => showToast("Credentials CSV queued for upload.")} />
                    <UserManagementTable users={users} onRoleChange={handleRoleChange} />
                </>
            ) : (
                <>
                    <HeaderRow title="Dashboard" />
                    <WelcomeBanner userName={userName} initials={initials} />
                    <AdminStats
                        totalUsers={totalUsers}
                        whitelistedUsers={whitelistedUsers}
                        blockedUsers={blockedUsers}
                    />
                    <UploadCredentials onUpload={() => showToast("Credentials CSV queued for upload.")} />
                    <UserManagementTable users={users} onRoleChange={handleRoleChange} compact />
                </>
            )}

            {toast && (
                <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
                    {toast}
                </div>
            )}
        </DashboardLayout>
    );
}
