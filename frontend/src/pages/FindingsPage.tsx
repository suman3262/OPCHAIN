import { useEffect, useState } from "react";
import { useEngagementStore } from "../store/engagementStore";
import { findingsAPI } from "../api";
import type { FindingTemplate, EngagementFinding } from "../types";
import { SEVERITIES } from "../types";
import SeverityBadge from "../components/SeverityBadge";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function FindingsPage() {
  const { activeEngagement } = useEngagementStore();
  const [tab, setTab] = useState<"library" | "engagement">("library");
  const [library, setLibrary] = useState<FindingTemplate[]>([]);
  const [engFindings, setEngFindings] = useState<EngagementFinding[]>([]);
  const [search, setSearch] = useState("");
  const [filterSev, setFilterSev] = useState("");
  const [selected, setSelected] = useState<FindingTemplate | EngagementFinding | null>(null);
  

  const loadLibrary = async () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterSev) params.severity = filterSev;
    const r = await findingsAPI.listLibrary(params);
    setLibrary(r.data);
  };

  const loadEng = async () => {
    if (!activeEngagement) return;
    const r = await findingsAPI.listEngagement(activeEngagement.id);
    setEngFindings(r.data);
  };

  useEffect(() => { loadLibrary(); }, [search, filterSev]);
  useEffect(() => { loadEng(); }, [activeEngagement?.id]);

  const addToEngagement = async (tmpl: FindingTemplate) => {
    if (!activeEngagement) { toast.error("No active engagement"); return; }
    try {
      await findingsAPI.addToEngagement(activeEngagement.id, { template_id: tmpl.id });
      loadEng();
      toast.success("Finding added to engagement");
    } catch { toast.error("Failed to add finding"); }
  };

  const updateStatus = async (f: EngagementFinding, status: string) => {
    if (!activeEngagement) return;
    await findingsAPI.updateEngagement(activeEngagement.id, f.id, { status } as Partial<EngagementFinding>);
    loadEng();
  };

  const deleteEngFinding = async (id: string) => {
    if (!activeEngagement) return;
    await findingsAPI.deleteEngagement(activeEngagement.id, id);
    setEngFindings(e => e.filter(x => x.id !== id));
    if (selected && "status" in selected && selected.id === id) setSelected(null);
    toast.success("Removed");
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Left panel */}
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-100">Findings</h1>
          <div className="flex border border-gray-700 rounded overflow-hidden">
            {(["library", "engagement"] as const).map(t => (
              <button
                key={t}
                className={`px-3 py-1 text-xs capitalize ${tab === t ? "bg-sky-700 text-white" : "text-gray-400 hover:bg-gray-800"}`}
                onClick={() => setTab(t)}
              >
                {t === "library" ? `Library (${library.length})` : `Engagement (${engFindings.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input className="input flex-1 text-xs" placeholder="Search findings..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input w-36 text-xs" value={filterSev} onChange={e => setFilterSev(e.target.value)}>
            <option value="">All Severity</option>
            {SEVERITIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          {tab === "library" && library.map(f => (
            <div
              key={f.id}
              className={`card cursor-pointer hover:border-gray-700 transition-colors ${selected?.id === f.id ? "border-sky-700" : ""}`}
              onClick={() => setSelected(f)}
            >
              <div className="flex items-center gap-3">
                <SeverityBadge severity={f.severity} />
                <span className="text-gray-200 text-sm flex-1">{f.title}</span>
                {f.cvss_score && <span className="text-gray-500 text-xs">{f.cvss_score}</span>}
                {f.cwe_id && <span className="text-gray-600 text-xs">{f.cwe_id}</span>}
                <button
                  className="btn-primary text-xs py-0.5 px-2 shrink-0"
                  onClick={e => { e.stopPropagation(); addToEngagement(f); }}
                >
                  + Add
                </button>
              </div>
              {f.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1">
                  {f.tags.slice(0, 4).map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {tab === "engagement" && (
            <>
              {!activeEngagement && <div className="text-gray-500 text-sm">Select an engagement</div>}
              {engFindings.length === 0 && activeEngagement && (
                <div className="text-gray-600 text-center py-8">No findings added yet. Browse the library and click + Add.</div>
              )}
              {engFindings.map(f => (
                <div
                  key={f.id}
                  className={`card cursor-pointer ${selected?.id === f.id ? "border-sky-700" : ""}`}
                  onClick={() => setSelected(f)}
                >
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={f.severity} />
                    <span className="text-gray-200 text-sm flex-1">{f.title}</span>
                    <select
                      className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded px-1 py-0.5"
                      value={f.status}
                      onChange={e => { e.stopPropagation(); updateStatus(f, e.target.value); }}
                    >
                      {["Open", "Remediated", "Accepted", "False Positive"].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button className="text-red-400 text-xs hover:text-red-300" onClick={e => { e.stopPropagation(); deleteEngFinding(f.id); }}>✕</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-96 card overflow-y-auto max-h-screen sticky top-0 space-y-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <SeverityBadge severity={selected.severity} />
              <h2 className="text-gray-100 font-bold text-sm mt-1">{selected.title}</h2>
            </div>
            <button className="text-gray-600 hover:text-gray-400" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {selected.cvss_score && <div><span className="text-gray-500">CVSS:</span> <span className="text-gray-300">{selected.cvss_score}</span></div>}
            {selected.cwe_id && <div><span className="text-gray-500">CWE:</span> <span className="text-gray-300">{selected.cwe_id}</span></div>}
            {selected.mitre_techniques?.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-500">MITRE: </span>
                {selected.mitre_techniques.map(t => (
                  <span key={t} className="text-purple-400 font-mono text-xs mr-1">{t}</span>
                ))}
              </div>
            )}
          </div>
          {selected.description && (
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Description</div>
              <div className="text-gray-300 text-xs prose prose-invert prose-xs max-w-none">
                <ReactMarkdown>{selected.description}</ReactMarkdown>
              </div>
            </div>
          )}
          {selected.impact && (
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Impact</div>
              <div className="text-gray-300 text-xs">{selected.impact}</div>
            </div>
          )}
          {selected.remediation && (
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Remediation</div>
              <div className="text-gray-300 text-xs prose prose-invert prose-xs max-w-none">
                <ReactMarkdown>{selected.remediation}</ReactMarkdown>
              </div>
            </div>
          )}
          {selected.references?.length > 0 && (
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">References</div>
              {selected.references.map((r, i) => (
                <div key={i} className="text-sky-400 text-xs break-all">{r}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
