import React from "react";
import StatusBadge from "../../components/StatusBadge";
import { EyeIcon } from "../../components/icons";

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
  onViewDetails,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 className="!text-sm !font-semibold !text-slate-800">{title}</h2>
        <span className="text-xs text-slate-400">{requests.length} items</span>
      </div>

      {requests.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          No requests yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-[56px_140px_1.4fr_100px_150px_150px_150px] border-b border-slate-100 bg-slate-50 px-5 py-3 text-[13px] font-semibold tracking-wide text-slate-500">
            {TABLE_HEADERS.map((header) => (
              <div key={header}>{header}</div>
            ))}
          </div>

          {requests.map((request, index) => (
            <div
              key={request.id}
              className="grid min-w-[860px] grid-cols-[56px_140px_1.4fr_100px_150px_150px_150px] items-center border-t border-slate-100 px-5 py-4 first:border-t-0"
            >
              <div className="text-[13px] font-medium text-slate-500">{index + 1}</div>
              <div className="font-mono text-[13px] font-medium text-slate-700">{request.id}</div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{request.title}</p>
                {request.type && (
                  <p className="mt-1 text-[12px] text-slate-500">{request.type}</p>
                )}
              </div>
              <div className="text-[13px] text-slate-600">{request.mode ?? "-"}</div>
              <div>
                <StatusBadge status={request.status} />
              </div>
              <div className="text-[13px] text-slate-600">{request.submitted}</div>
              <div>
                <button
                  type="button"
                  onClick={() => onViewDetails?.(request)}
                  aria-label={`View ${request.id}`}
                  title="View details"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white transition-colors hover:bg-teal-700"
                >
                  <EyeIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
