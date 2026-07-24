import { useState } from "react"
import { XCircleIcon } from "./icons.jsx"

export default function DisapproveModal({ title, onConfirm, onCancel }) {
  const [remarks, setRemarks] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">Disapprove Document</h3>
          <p className="mt-1 text-xs text-slate-500">{title}</p>
        </div>

        <div className="px-5 py-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Reason for disapproval
          </label>
          <textarea
            autoFocus
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Explain why this document is being disapproved..."
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-100"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(remarks || "No reason provided")}
            disabled={!remarks.trim()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            <XCircleIcon size={14} /> Disapprove
          </button>
        </div>
      </div>
    </div>
  )
}
