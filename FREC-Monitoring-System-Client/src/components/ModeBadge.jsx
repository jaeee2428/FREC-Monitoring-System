export default function ModeBadge({ mode }) {
    if (mode === 1) {
        return <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Mode 1</span>;
    }
    if (mode === 2) {
        return <span className="rounded border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700">Mode 2</span>;
    }
    if (mode === 3) {
        return <span className="rounded border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">Mode 3</span>;
    }
    return null;
}
