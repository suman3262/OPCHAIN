import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEngagementStore } from "../store/engagementStore";
import { oplogAPI, findingsAPI, evidenceAPI } from "../api";
import type { OPLOGEntry, EngagementFinding } from "../types";
import SeverityBadge from "../components/SeverityBadge";

const SEV_ORDER = ["Critical", "High", "Medium", "Low", "Informational"];
const SEV_COLORS: Record<string, string> = {
  Critical: "bg-red-600",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-blue-500",
  Informational: "bg-gray-500",
};

export default function DashboardPage() {
  const { activeEngagement } = useEngagementStore();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<OPLOGEntry[]>([]);
  const [findings, setFindings] = useState<EngagementFinding[]>([]);
  const [evCount, setEvCount] = useState(0);

  useEffect(() => {
    if (!activeEngagement) return;
    oplogAPI.list(activeEngagement.id).then((r) => setEntries(r.data)).catch(() => {});
    findingsAPI.listEngagement(activeEngagement.id).then((r) => setFindings(r.data)).catch(() => {});
    evidenceAPI.list(activeEngagement.id).then((r) => setEvCount(r.data.length)).catch(() => {});
  }, [activeEngagement?.id]);

  if (!activeEngagement) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-4xl mb-4">◎</div>
        <div className="text-lg mb-2">No active engagement</div>
        <div className="text-sm">Create or select an engagement from the sidebar</div>
      </div>
    );
  }

  const sevCounts = SEV_ORDER.reduce((acc, s) => ({
    ...acc, [s]: findings.filter(f => f.severity === s).length
  }), {} as Record<string, number>);

  const totalFindings = findings.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">{activeEngagement.name}</h1>
        <div className="text-gray-500 text-sm">{activeEngagement.client_name} — {activeEngagement.status}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "OPLOG Entries", value: entries.length, color: "text-sky-400" },
          { label: "Findings", value: totalFindings, color: "text-orange-400" },
          { label: "Evidence Files", value: evCount, color: "text-purple-400" },
          { label: "Engagement Status", value: activeEngagement.status, color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Findings Severity */}
      {totalFindings > 0 && (
        <div className="card">
          <div className="text-gray-400 text-xs uppercase mb-3">Finding Severity Breakdown</div>
          <div className="space-y-2">
            {SEV_ORDER.map((s) => (
              sevCounts[s] > 0 && (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-gray-400">{s}</div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className={`${SEV_COLORS[s]} h-2 rounded-full`}
                      style={{ width: `${(sevCounts[s] / totalFindings) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 w-8 text-right">{sevCounts[s]}</div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="text-gray-400 text-xs uppercase mb-3">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => navigate("/oplog")}>+ OPLOG Entry</button>
          <button className="btn-secondary" onClick={() => navigate("/findings")}>+ Finding</button>
          <button className="btn-secondary" onClick={() => navigate("/evidence")}>Upload Evidence</button>
          <button className="btn-secondary" onClick={() => navigate("/report")}>Generate Report</button>
        </div>
      </div>

      {/* Recent OPLOG */}
      <div className="card">
        <div className="text-gray-400 text-xs uppercase mb-3">Recent OPLOG Entries</div>
        {entries.length === 0 ? (
          <div className="text-gray-600 text-sm">No entries yet. Start logging operations.</div>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-sm border-l-2 border-gray-700 pl-3 py-1">
                <span className="text-gray-600 text-xs font-mono shrink-0">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-sky-400 shrink-0">{e.target}</span>
                <span className="text-gray-500 shrink-0">{e.action_type}</span>
                <span className="text-gray-400 truncate font-mono text-xs">{e.command_action}</span>
                <span className={`shrink-0 text-xs ${e.outcome === "Success" ? "text-green-400" : e.outcome === "Failed" ? "text-red-400" : "text-yellow-400"}`}>
                  {e.outcome}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Findings */}
      {findings.length > 0 && (
        <div className="card">
          <div className="text-gray-400 text-xs uppercase mb-3">Engagement Findings</div>
          <div className="space-y-2">
            {findings.slice(0, 6).map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <SeverityBadge severity={f.severity} />
                <span className="text-gray-200 text-sm">{f.title}</span>
                <span className="text-gray-500 text-xs ml-auto">{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
