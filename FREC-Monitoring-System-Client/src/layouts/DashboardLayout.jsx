import DashboardHeader from "./components/DashboardHeader";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardTabsBar from "./components/DashboardTabsBar";
import DashboardFooter from "./components/DashboardFooter";

const DEFAULT_TABS = ["Thesis Certification", "Research Certification", "Project Endorsement"];

export default function DashboardLayout({
    userName,
    userInitials,
    tabs = DEFAULT_TABS,
    activeTab = 0,
    onTabChange = () => {},
    showTabs = true,
    showAddButton = false,
    onAddClick = () => {},
    sidebarIcons,
    activeSidebarIndex = 0,
    onLogout = () => {},
    role,
    userProgram,
    title = "",
    children,
}) {
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
            <DashboardHeader userName={userName} userInitials={userInitials} role={role} program={userProgram} />

            <div className="flex flex-1 overflow-hidden">
                <DashboardSidebar
                    sidebarIcons={sidebarIcons}
                    activeSidebarIndex={activeSidebarIndex}
                    onLogout={onLogout}
                />

                <main className="flex-1 px-0 pb-6 pt-0">
                    {(showTabs || title) && (
                        <div className="sticky top-0 z-10 flex h-12 w-full items-center border-b border-slate-200 bg-white px-8">
                            <DashboardTabsBar
                                tabs={tabs}
                                activeTab={activeTab}
                                onTabChange={onTabChange}
                                showAddButton={showAddButton}
                                onAddClick={onAddClick}
                                role={role}
                                showTabs={showTabs}
                                title={title}
                            />
                        </div>
                    )}
 
                    <div className={`${showTabs || title ? "max-h-[calc(100vh-7rem)]" : "max-h-[calc(100vh-4rem)]"} overflow-y-auto px-8 pt-3`}>
                        {children}
                    </div>
                </main>
            </div>

            <DashboardFooter />
        </div>
    );
}
