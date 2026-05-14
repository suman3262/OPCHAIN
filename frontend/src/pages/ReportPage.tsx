import { useState } from "react";
import { useEngagementStore } from "../store/engagementStore";
import { reportsAPI } from "../api";
import toast from "react-hot-toast";

export default function ReportPage() {
  const { activeEngagement } = useEngagementStore();
  const [externalSafe, setExternalSafe] = useState(false);

  if (!activeEngagement) return <div className="text-gray-500 text-center py-16">Select an engagement first</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-100">Report Generator</h1>
      <div className="text-gray-400 text-sm">
        The report is assembled from everything you logged during the engagement — OPLOG entries, findings, evidence, and scope.
      </div>

      <div className="card space-y-4">
        <div className="text-gray-400 text-xs uppercase">Report Options</div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={externalSafe} onChange={e => setExternalSafe(e.target.checked)} />
          <div>
            <div className="text-gray-200 text-sm">External-Safe Mode</div>
            <div className="text-gray-500 text-xs">Exclude OPLOG entries marked as "Internal Only" from report output</div>
          </div>
        </label>
      </div>

      <div className="card space-y-4">
        <div className="text-gray-400 text-xs uppercase">Report Structure</div>
        <div className="text-gray-500 text-xs space-y-1">
          {[
            "1. Cover Page — Client, engagement name, dates, classification",
            "2. Executive Summary — Engagement overview, scope, objectives, risk rating",
            "3. Findings Summary Table — All findings sorted by severity",
            "4. Detailed Findings — Description, impact, evidence, remediation, references",
            "5. Attack Path — Kill chain diagram from OPLOG",
            "6. OPLOG Appendix — Full timestamped operations log",
            "7. Scope Reference — In-scope and out-of-scope target lists",
          ].map(s => <div key={s} className="flex gap-2"><span className="text-sky-400">▪</span>{s}</div>)}
        </div>
      </div>

      <div className="card space-y-3">
        <div className="text-gray-400 text-xs uppercase">Export</div>
        <div className="flex gap-3">
          <button
            className="btn-primary"
            onClick={() => { reportsAPI.downloadMd(activeEngagement.id, externalSafe); toast.success("Generating Markdown report..."); }}
          >
            Download Markdown
          </button>
          <div className="flex items-center text-gray-600 text-xs">HTML and DOCX formats coming in Phase 2</div>
        </div>
        <div className="text-gray-600 text-xs">
          Generating report for: <span className="text-gray-400">{activeEngagement.name}</span> — {activeEngagement.client_name}
        </div>
      </div>
    </div>
  );
}
