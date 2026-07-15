

const SYSTEM_STATUSES = {
  "SUBMITTED":        { label: "SUBMITTED",        color: "#374151", bg: "#F3F4F6" },
  "UNDER REVIEW":     { label: "UNDER REVIEW",     color: "#92400E", bg: "#FEF3C7" },
  "ADVISER APPROVED": { label: "ADVISER APPROVED", color: "#065F46", bg: "#D1FAE5" },
  "FORWARDED-FREC":   { label: "FORWARDED-FREC",   color: "#5B21B6", bg: "#EDE9FE" },
  "FREC APPROVED":    { label: "FREC APPROVED",    color: "#065F46", bg: "#D1FAE5" },
  "FREC DISAPPROVED": { label: "FREC DISAPPROVED", color: "#991B1B", bg: "#FEE2E2" },
  "CERT GENERATED":   { label: "CERT GENERATED",   color: "#065F46", bg: "#D1FAE5" },
  "FORWARDED-PC":     { label: "FORWARDED-PC",     color: "#1E40AF", bg: "#DBEAFE" },
  "PC APPROVED":      { label: "PC APPROVED",      color: "#065F46", bg: "#D1FAE5" },
  "FORWARDED-DEAN":   { label: "FORWARDED-DEAN",   color: "#5B21B6", bg: "#EDE9FE" },
  "DEAN ENDORSED":    { label: "DEAN ENDORSED",    color: "#1E40AF", bg: "#DBEAFE" },
  "FOR REVIEW":       { label: "FOR REVIEW",       color: "#92400E", bg: "#FEF3C7" },
  "DISAPPROVED":      { label: "DISAPPROVED",      color: "#991B1B", bg: "#FEE2E2" },
  "APPROVED":         { label: "APPROVED",         color: "#065F46", bg: "#D1FAE5" },
};

export default function StatusBadge({ status }) {
    const config = SYSTEM_STATUSES[status] || SYSTEM_STATUSES["SUBMITTED"];
    return (
        <span
            className="inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.label}
        </span>
    );
}
