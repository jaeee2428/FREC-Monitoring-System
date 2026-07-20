export default function ModeBadge({ mode }) {
  if (!mode) return null;

  return (
    <span className="inline-flex items-center rounded border border-rose-900/20 bg-rose-900/10 px-2.5 py-0.5 text-xs font-semibold text-rose-950">
      Mode {mode}
    </span>
  );
}