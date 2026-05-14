import { useEffect, useState } from "react";
import { useEngagementStore } from "../store/engagementStore";
import { oplogAPI } from "../api";
import type { OPLOGEntry } from "../types";
import { ACTION_COLORS } from "../types";

const TACTIC_ORDER = [
  "Recon", "Initial Access", "Execution", "Persistence",
  "Privilege Escalation", "Lateral Movement", "Collection",
  "Exfiltration", "Social Engineering", "Physical",
];

export default function AttackPathPage() {
  const { activeEngagement } = useEngagementStore();
  const [entries, setEntries] = useState<OPLOGEntry[]>([]);
  const [selected, setSelected] = useState<OPLOGEntry | null>(null);

  useEffect(() => {
    if (!activeEngagement) return;
    oplogAPI.list(activeEngagement.id).then(r => setEntries(r.data)).catch(() => {});
  }, [activeEngagement?.id]);

  const grouped = TACTIC_ORDER.reduce((acc, tactic) => ({
    ...acc,
    [tactic]: entries.filter(e => e.action_type === tactic),
  }), {} as Record<string, OPLOGEntry[]>);

  const activeTactics = TACTIC_ORDER.filter(t => grouped[t].length > 0);

  if (!activeEngagement) return <div className="text-gray-500 text-center py-16">Select an engagement first</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-100">Attack Path Visualizer</h1>
        <div className="text-gray-500 text-xs">{entries.length} OPLOG entries mapped</div>
      </div>

      {activeTactics.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-4xl mb-4">◀</div>
          <div>No OPLOG entries yet. Start logging operations to build the attack path.</div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {activeTactics.map((tactic, i) => (
              <div key={tactic} className="flex items-start gap-3">
                <div className="w-48">
                  <div className={`text-xs font-bold uppercase border-b-2 ${(ACTION_COLORS[tactic] || "border-gray-600").replace("border-l-4", "border-b-2")} pb-1 mb-2`}>
                    {tactic}
                    <span className="text-gray-500 font-normal ml-1">({grouped[tactic].length})</span>
                  </div>
                  <div className="space-y-2">
                    {grouped[tactic].map(entry => (
                      <div
                        key={entry.id}
                        className={`p-2 bg-gray-900 border rounded text-xs cursor-pointer hover:border-sky-600 transition-colors ${
                          selected?.id === entry.id ? "border-sky-500" : "border-gray-800"
                        }`}
                        onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                      >
                        <div className="text-sky-400 font-medium truncate">{entry.target}</div>
                        <div className="text-gray-500 truncate mt-0.5">{entry.command_action.substring(0, 40)}{entry.command_action.length > 40 ? "..." : ""}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`${entry.outcome === "Success" ? "text-green-400" : "text-red-400"}`}>
                            {entry.outcome}
                          </span>
                          {entry.mitre_technique_id && (
                            <span className="text-purple-400 font-mono ml-auto">{entry.mitre_technique_id}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {i < activeTactics.length - 1 && (
                  <div className="text-gray-700 text-xl self-center mt-4">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entry detail */}
      {selected && (
        <div className="card border-sky-800">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-gray-200 font-bold">{selected.target} — {selected.action_type}</h3>
            <button className="text-gray-600" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">Timestamp</div>
              <div className="text-gray-300 font-mono text-xs">{new Date(selected.timestamp).toISOString()}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Operator</div>
              <div className="text-gray-300">{selected.operator.display_name}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Outcome</div>
              <div className={selected.outcome === "Success" ? "text-green-400" : "text-red-400"}>{selected.outcome}</div>
            </div>
            {selected.mitre_technique && (
              <div>
                <div className="text-gray-500 text-xs mb-1">MITRE Technique</div>
                <div className="text-purple-400 font-mono text-xs">{selected.mitre_technique.id} — {selected.mitre_technique.name}</div>
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="text-gray-500 text-xs mb-1">Command / Action</div>
            <pre className="bg-gray-950 text-gray-300 font-mono text-xs p-3 rounded whitespace-pre-wrap">{selected.command_action}</pre>
          </div>
          {selected.notes && <div className="mt-2 text-gray-400 text-sm">{selected.notes}</div>}
        </div>
      )}
    </div>
  );
}
