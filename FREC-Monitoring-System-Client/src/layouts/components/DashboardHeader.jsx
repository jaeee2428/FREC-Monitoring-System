import { BellIcon } from "../../components/icons";

export default function DashboardHeader({ userName, userInitials, role, program }) {
  return (
    <header className="z-10 flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
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
        <button className="relative text-slate-500 hover:text-slate-700" type="button">
          <BellIcon size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#7a1f2b]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7a1f2b] text-[11px] font-bold text-white">
            {userInitials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-slate-700">{userName}</span>
            <span className="text-[10px] leading-tight text-slate-400">
              {role}
              {program && ` · ${program}`}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
