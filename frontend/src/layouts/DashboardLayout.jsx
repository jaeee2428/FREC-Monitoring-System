import React from "react";
import {
    HomeIcon,
    FileTextIcon,
    CheckCircleIcon,
    RotateIcon,
} from "../components/icons";
import DashboardHeader from "./components/DashboardHeader";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardTabsBar from "./components/DashboardTabsBar";
import DashboardFooter from "./components/DashboardFooter";

const DEFAULT_TABS = ["Thesis Certification", "Research Certification", "Project Endorsement"];

const ADVISER_SIDEBAR_ICONS = [
    { icon: HomeIcon, label: "Home" },
    { icon: FileTextIcon, label: "Documents" },
    { icon: CheckCircleIcon, label: "Review" },
    { icon: RotateIcon, label: "Workflow Guide" },
];

const STUDENT_SIDEBAR_ICONS = [
    { icon: HomeIcon, label: "Home" },
    { icon: RotateIcon, label: "Workflow Guide" },
];

export default function DashboardLayout({
    userName,
    userInitials,
    tabs = DEFAULT_TABS,
    activeTab = 0,
    onTabChange = () => { },
    showAddButton = false,
    onAddClick = () => { },
    sidebarIcons,
    activeSidebarIndex = 0,
    onLogout,
    role,
    children,
}) {
    const resolvedSidebarIcons = sidebarIcons ?? (role === "student" ? STUDENT_SIDEBAR_ICONS : ADVISER_SIDEBAR_ICONS);
    const resolvedShowAddButton = role === "student" ? false : (showAddButton ?? true);

    return (
        <div
            className="h-screen overflow-hidden bg-[#f7f7f8] font-sans text-slate-800"
            style={{
                width: "100vw",
                position: "relative",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <DashboardHeader userName={userName} userInitials={userInitials} />

            <div className="flex flex-1 overflow-hidden">
                <DashboardSidebar
                    sidebarIcons={resolvedSidebarIcons}
                    activeSidebarIndex={activeSidebarIndex}
                    onLogout={onLogout}
                />

                <main className="flex-1 px-0 pb-6 pt-0">
                    <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#f7f7f8] px-8 pt-0">
                        <DashboardTabsBar
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                            showAddButton={resolvedShowAddButton}
                            onAddClick={onAddClick}
                            role={role}
                        />
                    </div>

                    <div className="max-h-[calc(100vh-7rem)] overflow-y-auto px-8 pr-2 pt-3">
                        {children}
                    </div>
                </main>
            </div>

            <DashboardFooter />
        </div>
    );
}
