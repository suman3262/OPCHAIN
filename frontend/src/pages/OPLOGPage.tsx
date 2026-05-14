import { useEffect, useState, useRef } from "react";
import { useEngagementStore } from "../store/engagementStore";
import { oplogAPI, scopeAPI } from "../api";
import type { OPLOGEntry } from "../types";
import { ACTION_TYPES, OUTCOMES, ACTION_COLORS, OUTCOME_COLORS } from "../types";
import MITRESearch from "../components/MITRESearch";
import ScopeIndicator from "../components/ScopeIndicator";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  target: "", action_type: "Recon", command_action: "",
  outcome: "Success", mitre_technique_id: null as string | null,
  notes: "", is_internal_only: false,
};

export default function OPLOGPage() {
  const { activeEngagement } = useEngagementStore();
  
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [entries, setEntries] = useState<OPLOGEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("");
  const [scopeResult, setScopeResult] = useState<{ status: string; matched_rule: string | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const scopeTimer = useRef<ReturnType<typeof setTimeout>>();

  const load = async () => {
    if (!activeEngagement) return;
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterAction) params.action_type = filterAction;
    if (filterOutcome) params.outcome = filterOutcome;
    const r = await oplogAPI.list(activeEngagement.id, params);
    setEntries(r.data);
  };

  useEffect(() => { load(); }, [activeEngagement?.id, search, filterAction, filterOutcome]);

  const checkScope = (target: string) => {
    clearTimeout(scopeTimer.current);
    if (!target || !activeEngagement) { setScopeResult(null); return; }
    scopeTimer.current = setTimeout(async () => {
      try {
        const r = await scopeAPI.check(activeEngagement.id, target);
        setScopeResult({ status: r.data.status, matched_rule: r.data.matched_rule });
      } catch { setScopeResult(null); }
    }, 500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEngagement) return;
    setSubmitting(true);
    try {
      const r = await oplogAPI.create(activeEngagement.id, {
        target: form.target,
        action_type: form.action_type,
        command_action: form.command_action,
        outcome: form.outcome,
        mitre_technique_id: form.mitre_technique_id || undefined,
        notes: form.notes || undefined,
        is_internal_only: form.is_internal_only,
      } as Partial<OPLOGEntry>);
      setEntries([r.data, ...entries]);
      setForm({ ...EMPTY_FORM });
      setScopeResult(null);
      toast.success("Entry logged");
    } catch { toast.error("Failed to log entry"); }
    finally { setSubmitting(false); }
  };

  const deleteEntry = async (id: string) => {
    await oplogAPI.delete(id);
    setEntries(entries.filter(e => e.id !== id));
    toast.success("Entry deleted");
  };

  if (!activeEngagement) return <div className="text-gray-500 text-center py-16">Select an engagement first</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-100">OPLOG — {activeEngagement.name}</h1>

      {/* Entry Form */}
      <form onSubmit={submit} className="card space-y-3">
        <div className="text-gray-400 text-xs uppercase mb-1">New Entry</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="text-gray-500 text-xs">Target *</label>
            <input
              className="input"
              placeholder="10.0.0.1 or hostname"
              value={form.target}
              onChange={e => { setForm(f => ({ ...f, target: e.target.value })); checkScope(e.target.value); }}
              required
            />
            {scopeResult && (
              <div className="mt-1">
                <ScopeIndicator status={scopeResult.status} rule={scopeResult.matched_rule} />
              </div>
            )}
          </div>
          <div>
            <label className="text-gray-500 text-xs">Action Type *</label>
            <select className="input" value={form.action_type} onChange={e => setForm(f => ({ ...f, action_type: e.target.value }))}>
              {ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-xs">Outcome *</label>
            <select className="input" value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}>
              {OUTCOMES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-gray-500 text-xs">Command / Action *</label>
          <textarea
            className="input font-mono text-xs"
            rows={3}
            placeholder="nmap -sV -p- 10.0.0.1"
            value={form.command_action}
            onChange={e => setForm(f => ({ ...f, command_action: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-gray-500 text-xs">MITRE ATT&CK Technique</label>
          <MITRESearch value={form.mitre_technique_id} onChange={tid => setForm(f => ({ ...f, mitre_technique_id: tid }))} />
        </div>
        <div>
          <label className="text-gray-500 text-xs">Notes</label>
          <input className="input" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={form.is_internal_only} onChange={e => setForm(f => ({ ...f, is_internal_only: e.target.checked }))} />
            Internal Only (excluded from client report)
          </label>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Logging..." : "Log Entry (Enter)"}</button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input className="input w-48 text-xs" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-40 text-xs" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="">All Actions</option>
          {ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="input w-36 text-xs" value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}>
          <option value="">All Outcomes</option>
          {OUTCOMES.map(o => <option key={o}>{o}</option>)}
        </select>
        <span className="text-gray-500 text-xs self-center">{entries.length} entries</span>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {entries.length === 0 && <div className="text-gray-600 text-center py-8">No entries yet</div>}
        {entries.map((e) => (
          <div
            key={e.id}
            className={`card border-l-4 ${ACTION_COLORS[e.action_type] || "border-gray-600"} cursor-pointer hover:border-opacity-100`}
            onClick={() => setExpanded(expanded === e.id ? null : e.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-gray-600 font-mono text-xs shrink-0 pt-0.5">
                {new Date(e.timestamp).toISOString().replace("T", " ").substring(0, 19)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sky-400 font-medium">{e.target}</span>
                  <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded">{e.action_type}</span>
                  <span className={`text-xs font-medium ${OUTCOME_COLORS[e.outcome]}`}>{e.outcome}</span>
                  {e.mitre_technique_id && (
                    <span className="text-xs bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded font-mono">{e.mitre_technique_id}</span>
                  )}
                  {e.is_internal_only && <span className="text-xs bg-red-950 text-red-400 px-1.5 py-0.5 rounded">🔒 Internal</span>}
                  <span className="text-gray-600 text-xs ml-auto">{e.operator.display_name}</span>
                </div>
                <div className="text-gray-400 font-mono text-xs mt-1 truncate">{e.command_action}</div>
                {expanded === e.id && (
                  <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
                    <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap bg-gray-950 p-3 rounded">{e.command_action}</pre>
                    {e.mitre_technique && (
                      <div className="text-xs text-gray-400">
                        <span className="text-purple-400">{e.mitre_technique.id}</span> — {e.mitre_technique.name}
                        <span className="text-gray-600 ml-2">({e.mitre_technique.tactic})</span>
                      </div>
                    )}
                    {e.notes && <div className="text-gray-400 text-xs">{e.notes}</div>}
                    <button className="text-red-400 text-xs hover:text-red-300" onClick={(ev) => { ev.stopPropagation(); deleteEntry(e.id); }}>
                      Delete entry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
