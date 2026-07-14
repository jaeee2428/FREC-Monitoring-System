import React from "react";
import {
    HomeIcon,
    FileTextIcon,
    CheckCircleIcon,
    RotateIcon,
    LogOutIcon,
    BellIcon,
    PlusIcon,
} from "../components/icons";

const DEFAULT_TABS = ["Thesis Certification", "Research Certification", "Project Endorsement"];

const DEFAULT_SIDEBAR_ICONS = [
    { icon: HomeIcon, label: "Home" },
    { icon: FileTextIcon, label: "Documents" },
    { icon: CheckCircleIcon, label: "Review" },
    { icon: RotateIcon, label: "History" },
];

function SidebarIcon({ icon: Icon, active, label }) {
    return (
        <button
            title={label}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${active
                    ? "bg-[#fbe9e7] text-[#7a1f2b]"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
        >
            <Icon size={18} />
        </button>
    );
}

/**
 * Shared shell for every role's dashboard: top bar, sidebar, tabs, and footer.
 * Each role page supplies its own header/content via `children`.
 *
 * Props:
 * - userName:        string, shown top-right and in the sidebar avatar
 * - userInitials:    string, e.g. "DE"
 * - tabs:            optional string[] override (defaults to the 3 certification tabs)
 * - activeTab:        controlled index of the active tab
 * - onTabChange:      (index) => void
 * - showAddButton:    bool — only Adviser/Admin roles show "+ Add"
 * - onAddClick:       () => void
 * - sidebarIcons:      optional override array of { icon, label }
 * - activeSidebarIndex: which sidebar icon is highlighted (defaults to 0 = Home)
 * - children:          the role-specific main content (banner, stats, panels, etc.)
 */
export default function DashboardLayout({
    userName,
    userInitials,
    tabs = DEFAULT_TABS,
    activeTab = 0,
    onTabChange = () => { },
    showAddButton = false,
    onAddClick = () => { },
    sidebarIcons = DEFAULT_SIDEBAR_ICONS,
    activeSidebarIndex = 0,
    children,
}) {
    return (
        <div
            className="bg-[#f7f7f8] font-sans text-slate-800"
            style={{
                width: "100vw",
                minHeight: "100vh",
                position: "relative",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Top bar */}
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a1f2b] text-xs font-bold text-white">
                        CT
                    </div>
                    <span className="text-sm">
                        <span className="font-bold text-[#7a1f2b]">CertTrack:</span>{" "}
                        <span className="text-slate-700">Certification Monitoring and Tracking System</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative text-slate-500 hover:text-slate-700">
                        <BellIcon size={18} />
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#7a1f2b]" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7a1f2b] text-[11px] font-bold text-white">
                            {userInitials}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{userName}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="flex w-16 flex-col items-center justify-between border-r border-slate-200 bg-white py-4">
                    <div className="flex flex-col gap-2">
                        {sidebarIcons.map((item, i) => (
                            <SidebarIcon
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                active={i === activeSidebarIndex}
                            />
                        ))}
                    </div>
                    <SidebarIcon icon={LogOutIcon} label="Log out" />
                </aside>

                {/* Main content */}
                <main className="flex-1 px-8 py-6">
                    {/* Tabs + optional Add button */}
                    <div className="mb-5 flex items-center justify-between">
                        <nav className="flex gap-8">
                            {tabs.map((tab, i) => (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange(i)}
                                    className={`flex items-center gap-1.5 border-b-2 pb-2 text-sm font-medium transition-colors ${activeTab === i
                                            ? "border-[#7a1f2b] text-[#7a1f2b]"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <FileTextIcon size={14} />
                                    {tab}
                                </button>
                            ))}
                        </nav>
                        {showAddButton && (
                            <button
                                onClick={onAddClick}
                                className="flex items-center gap-1.5 rounded-lg bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#671a24]"
                            >
                                <PlusIcon size={15} /> Add
                            </button>
                        )}
                    </div>

                    {/* Role-specific content goes here */}
                    {children}
                </main>
            </div>

            <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
                © Developed by the University ICT Development Office. All rights reserved 2025.
            </footer>
        </div>
    );
}