export function StatCard({ label, value, valueColor = "text-slate-800" }) {
    return (
        <div className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </p>
            <p className={`mt-1.5 text-3xl font-bold tracking-tight ${valueColor}`}>
                {value}
            </p>
        </div>
    );
}