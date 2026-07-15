import React from "react";
import { LogOutIcon } from "../../components/icons";

function SidebarIcon({ icon: Icon, active, label, onClick }) {
  return (
    <button
      title={label}
      onClick={onClick}
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${active
        ? "bg-[#fbe9e7] text-[#7a1f2b]"
        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }`}
    >
      <Icon size={18} />
    </button>
  );
}

export default function DashboardSidebar({ sidebarIcons, activeSidebarIndex, onLogout }) {
  return (
    <aside className="z-20 flex h-full w-13 shrink-0 flex-col items-center justify-between border-r border-slate-200 bg-white py-4">
      <div className="flex flex-col gap-2">
        {sidebarIcons.map((item, i) => (
          <SidebarIcon
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={i === activeSidebarIndex}
            onClick={item.onClick}
          />
        ))}
      </div>

      <SidebarIcon icon={LogOutIcon} label="Sign out" onClick={onLogout} />
    </aside>
  );
}
