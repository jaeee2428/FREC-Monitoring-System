import React from "react";
import { FileTextIcon, PlusIcon } from "../../components/icons";

export default function DashboardTabsBar({
  tabs,
  activeTab,
  onTabChange,
  showAddButton,
  onAddClick,
  role,
}) {
  const isStudentRole = role === "student";
  const shouldShowAddButton = !isStudentRole && showAddButton;

  return (
    <div className="flex items-center justify-between pt-2">
      <nav className="relative flex gap-8">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => onTabChange(i)}
            className={`relative flex items-center gap-1.5 pt-2 pb-4 text-sm font-medium transition-colors ${activeTab === i
              ? "text-[#7a1f2b]"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            <FileTextIcon size={14} />
            {tab}
            {activeTab === i && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#7a1f2b]" />
            )}
          </button>
        ))}
      </nav>
      {shouldShowAddButton && (
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-lg bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#671a24]"
          type="button"
        >
          <PlusIcon size={15} /> Add
        </button>
      )}
    </div>
  );
}
