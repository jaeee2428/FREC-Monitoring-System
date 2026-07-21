import { FileTextIcon, PlusIcon } from "../../components/icons";

export default function DashboardTabsBar({
  tabs,
  activeTab,
  onTabChange,
  showAddButton,
  onAddClick,
  role,
  showTabs = true,
  title = "",
}) {
  const isStudentRole = role === "student";
  const shouldShowAddButton = !isStudentRole && showAddButton;

  return (
    <div className="flex w-full items-center justify-between">
      {showTabs ? (
        <nav className="relative flex gap-8">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => onTabChange(i)}
              className={`relative flex items-center gap-1.5 pt-2 pb-1 text-sm font-medium transition-colors ${activeTab === i
                ? "text-[#7a1f2b]"
                : "text-slate-500 hover:text-slate-700"
                }`}

            >
              <FileTextIcon size={14} />
              {tab}
              {activeTab === i && (
                <span className="absolute bottom-[-14px] left-0 h-[2px] w-full rounded-full bg-[#7a1f2b]" />
              )}
            </button>
          ))}
        </nav>
      ) : (
        <h1 className="font-bold !text-slate-900 text-[16px] py-1.5 leading-none">{title}</h1>

      )}

      {shouldShowAddButton && (
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-lg bg-[#7a1f2b] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#671a24]"
          type="button"
        >
          <PlusIcon size={14} /> New Submission
        </button>
      )}
    </div>
    );
}