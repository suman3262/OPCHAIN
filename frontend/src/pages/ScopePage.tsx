import { useEffect, useState } from "react";
import { useEngagementStore } from "../store/engagementStore";
import { scopeAPI } from "../api";
import type { ScopeItem } from "../types";
import toast from "react-hot-toast";

export default function ScopePage() {
  const { activeEngagement } = useEngagementStore();
  const [items, setItems] = useState<ScopeItem[]>([]);
  const [raw, setRaw] = useState("");
  const [addType, setAddType] = useState<"in_scope" | "out_of_scope">("in_scope");
  const [checkTarget, setCheckTarget] = useState("");
  const [checkResult, setCheckResult] = useState<{ status: string; matched_rule: string | null } | null>(null);

  const load = () => {
    if (!activeEngagement) return;
    scopeAPI.list(activeEngagement.id).then(r => setItems(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [activeEngagement?.id]);

  const addItems = async () => {
    if (!activeEngagement || !raw.trim()) return;
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    const itemPayloads = lines.map(v => ({ value: v, type: addType }));
    try {
      await scopeAPI.bulkAdd(activeEngagement.id, itemPayloads);
      setRaw("");
      load();
      toast.success(`Added ${itemPayloads.length} scope items`);
    } catch { toast.error("Failed to add scope items"); }
  };

  const removeItem = async (id: string) => {
    await scopeAPI.delete(id);
    setItems(items.filter(i => i.id !== id));
    toast.success("Removed");
  };

  const runCheck = async () => {
    if (!activeEngagement || !checkTarget) return;
    try {
      const r = await scopeAPI.check(activeEngagement.id, checkTarget);
      setCheckResult({ status: r.data.status, matched_rule: r.data.matched_rule });
    } catch { toast.error("Check failed"); }
  };

  const STATUS_STYLE: Record<string, string> = {
    in_scope: "text-green-400 bg-green-950",
    out_of_scope: "text-red-400 bg-red-950",
    unknown: "text-yellow-400 bg-yellow-950",
  };

  const inScope = items.filter(i => i.type === "in_scope");
  const outScope = items.filter(i => i.type === "out_of_scope");

  if (!activeEngagement) return <div className="text-gray-500 text-center py-16">Select an engagement first</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-100">Scope Guardian</h1>

      {/* Quick Checker */}
      <div className="card">
        <div className="text-gray-400 text-xs uppercase mb-3">Quick Scope Check</div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Enter any IP, CIDR, or hostname to check..."
            value={checkTarget}
            onChange={e => setCheckTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runCheck()}
          />
          <button className="btn-primary" onClick={runCheck}>Check</button>
        </div>
        {checkResult && (
          <div className={`mt-3 p-3 rounded text-sm ${STATUS_STYLE[checkResult.status] || ""}`}>
            <div className="font-bold capitalize">{checkResult.status.replace("_", " ")}</div>
            {checkResult.matched_rule && <div className="text-xs opacity-75">Matched rule: {checkResult.matched_rule}</div>}
          </div>
        )}
      </div>

      {/* Add Scope */}
      <div className="card">
        <div className="text-gray-400 text-xs uppercase mb-3">Add Scope Items</div>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="radio" value="in_scope" checked={addType === "in_scope"} onChange={() => setAddType("in_scope")} />
            In Scope
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="radio" value="out_of_scope" checked={addType === "out_of_scope"} onChange={() => setAddType("out_of_scope")} />
            Out of Scope
          </label>
        </div>
        <textarea
          className="input font-mono text-xs"
          rows={5}
          placeholder={"10.0.0.0/24\n192.168.1.100\n*.acme.com\napi.acme.com"}
          value={raw}
          onChange={e => setRaw(e.target.value)}
        />
        <button className="btn-primary mt-2" onClick={addItems}>Add Items</button>
      </div>

      {/* Scope Lists */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="text-green-400 text-xs uppercase mb-3">In Scope ({inScope.length})</div>
          {inScope.length === 0 ? <div className="text-gray-600 text-sm">None defined</div> : (
            <div className="space-y-1">
              {inScope.map(i => (
                <div key={i.id} className="flex items-center gap-2 group">
                  <span className="text-green-400 text-xs">●</span>
                  <span className="text-gray-300 font-mono text-sm flex-1">{i.value}</span>
                  {i.notes && <span className="text-gray-600 text-xs">{i.notes}</span>}
                  <button className="text-red-500 text-xs opacity-0 group-hover:opacity-100" onClick={() => removeItem(i.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="text-red-400 text-xs uppercase mb-3">Out of Scope ({outScope.length})</div>
          {outScope.length === 0 ? <div className="text-gray-600 text-sm">None defined</div> : (
            <div className="space-y-1">
              {outScope.map(i => (
                <div key={i.id} className="flex items-center gap-2 group">
                  <span className="text-red-400 text-xs">●</span>
                  <span className="text-gray-300 font-mono text-sm flex-1">{i.value}</span>
                  {i.notes && <span className="text-gray-600 text-xs">{i.notes}</span>}
                  <button className="text-red-500 text-xs opacity-0 group-hover:opacity-100" onClick={() => removeItem(i.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
