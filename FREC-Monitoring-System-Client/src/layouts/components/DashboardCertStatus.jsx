import { useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { EyeIcon } from "../../components/icons";
import RequestProgress from "../../components/RequestProgress";
import ModeBadge from "../../components/ModeBadge";

// Inline Download SVG Icon
const DownloadIcon = ({ size = 14, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const TABLE_HEADERS = [
  "No.",
  "Document ID",
  "Title",
  "Mode",
  "Status",
  "Date Submitted",
  "Action",
];

export default function DashboardCertStatus({
  requests = [],
  title = "Recent Requests",
  role = "student",
  onViewDetails,
  onDownload,
}) {
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const handleActionClick = (request) => {
    if (role === "student") {
      setExpandedRequestId(expandedRequestId === request.id ? null : request.id);
    } else {
      onViewDetails?.(request);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 className="!text-sm !font-semibold !text-slate-800">{title}</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">{requests.length} items</span>
          <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-[#7a1f2b] text-white"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "card"
                  ? "bg-[#7a1f2b] text-white"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Card
            </button>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          No requests yet.
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-[56px_140px_1.4fr_100px_150px_150px_150px] border-b border-slate-100 bg-slate-50 px-5 py-3 text-[13px] font-semibold tracking-wide text-slate-500">
            {TABLE_HEADERS.map((header) => (
              <div key={header}>{header}</div>
            ))}
          </div>

          {requests.map((request, index) => (
            <div key={request.id}>
              <div className="grid min-w-[860px] grid-cols-[56px_140px_1.4fr_100px_150px_150px_150px] items-center border-t border-slate-100 px-5 py-4 first:border-t-0 hover:bg-slate-50/10">
                <div className="text-[13px] font-medium text-slate-500">{index + 1}</div>
                <div className="font-mono text-[13px] font-medium text-slate-700">{request.id}</div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{request.title}</p>
                  {request.type && (
                    <p className="mt-1 text-[12px] text-slate-500">{request.type}</p>
                  )}
                </div>
                <div className="text-[13px] text-slate-600">
                  <ModeBadge mode={request.mode} />
                </div>
                <div>
                  <StatusBadge status={request.status} />
                </div>
                <div className="text-[13px] text-slate-600">{request.submitted}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleActionClick(request)}
                      aria-label={`View ${request.id}`}
                      title="View details"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white transition-colors hover:bg-teal-700"
                    >
                      <EyeIcon size={16} />
                    </button>
                    {role === "student" && ["APPROVED", "COMPLETED"].includes(request.status) && (
                      <button
                        type="button"
                        onClick={() => onDownload?.(request)}
                        title="Download Certificate"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7a1f2b] text-white hover:bg-[#5a121d] transition-colors"
                      >
                        <DownloadIcon size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {role === "student" && expandedRequestId === request.id && (
                <div className="border-t border-slate-100 pb-2">
                  <RequestProgress mode={request.mode} modeStr={request.modeStr} status={request.status} />
                  {request.note && (
                    <div className="mx-6 mt-2 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <p>{request.note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <div key={request.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-xs font-semibold text-slate-500">{request.id}</div>
                <StatusBadge status={request.status} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">{request.title}</h3>
              {request.type && (
                <p className="mb-2 text-xs text-slate-500">{request.type}</p>
              )}
              <div className="mb-3">
                <ModeBadge mode={request.mode} />
              </div>
              
              <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-400">DATE SUBMITTED</span>
                  <span className="text-xs text-slate-700">{request.submitted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleActionClick(request)}
                    aria-label={`View ${request.id}`}
                    title="View details"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white transition-colors hover:bg-teal-700"
                  >
                    <EyeIcon size={16} />
                  </button>
                  {role === "student" && ["APPROVED", "COMPLETED"].includes(request.status) && (
                    <button
                      type="button"
                      onClick={() => onDownload?.(request)}
                      title="Download Certificate"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7a1f2b] text-white hover:bg-[#5a121d] transition-colors"
                    >
                      <DownloadIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              {role === "student" && expandedRequestId === request.id && (
                <div className="mt-4 border-t border-slate-100 pt-2">
                  <RequestProgress mode={request.mode} modeStr={request.modeStr} status={request.status} compact={true} />
                  {request.note && (
                    <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded">{request.note}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
