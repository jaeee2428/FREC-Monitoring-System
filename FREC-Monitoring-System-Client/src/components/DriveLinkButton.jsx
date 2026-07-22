/**
 * DriveLinkButton
 * Renders a consistent "Open in Drive" anchor button for any component that
 * receives a driveLink string. Renders nothing when driveLink is falsy.
 */

const ExternalLinkIcon = ({ size = 13, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function DriveLinkButton({ driveLink, compact = false }) {
  if (!driveLink) return null;

  if (compact) {
    return (
      <a
        href={driveLink}
        target="_blank"
        rel="noopener noreferrer"
        title="Open Google Drive document"
        onClick={(e) => e.stopPropagation()}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
      >
        <ExternalLinkIcon size={12} />
      </a>
    );
  }

  return (
    <a
      href={driveLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-800"
    >
      <ExternalLinkIcon size={12} />
      Open in Drive
    </a>
  );
}
