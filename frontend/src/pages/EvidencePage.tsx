import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useEngagementStore } from "../store/engagementStore";
import { evidenceAPI } from "../api";
import type { Evidence } from "../types";
import toast from "react-hot-toast";

const LABELS = ["access-proof", "credential", "loot", "screenshot", "scan-output", "artifact", "exploit-output"];
const LABEL_COLORS: Record<string, string> = {
  "access-proof": "text-red-400", "credential": "text-orange-400", "loot": "text-yellow-400",
  "screenshot": "text-blue-400", "scan-output": "text-purple-400", "artifact": "text-gray-400", "exploit-output": "text-green-400",
};

export default function EvidencePage() {
  const { activeEngagement } = useEngagementStore();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [filterLabel, setFilterLabel] = useState("");
  const [filterLinked, setFilterLinked] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("screenshot");
  const [uploadDesc, setUploadDesc] = useState("");
  const [lightbox, setLightbox] = useState<Evidence | null>(null);

  const load = () => {
    if (!activeEngagement) return;
    const params: Record<string, string> = {};
    if (filterLabel) params.label = filterLabel;
    if (filterLinked === "linked") params.linked = "true";
    if (filterLinked === "unlinked") params.linked = "false";
    evidenceAPI.list(activeEngagement.id, params).then(r => setEvidence(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [activeEngagement?.id, filterLabel, filterLinked]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!activeEngagement || files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("label", uploadLabel);
      if (uploadDesc) fd.append("description", uploadDesc);
      try {
        await evidenceAPI.upload(activeEngagement.id, fd);
        toast.success(`Uploaded ${file.name}`);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setUploading(false);
    load();
  }, [activeEngagement, uploadLabel, uploadDesc]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const deleteEv = async (id: string) => {
    await evidenceAPI.delete(id);
    setEvidence(e => e.filter(x => x.id !== id));
    toast.success("Deleted");
  };

  const unlinked = evidence.filter(e => !e.oplog_entry_id && !e.finding_id);

  if (!activeEngagement) return <div className="text-gray-500 text-center py-16">Select an engagement first</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-100">Evidence Locker</h1>

      {/* Upload Zone */}
      <div className="card">
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <label className="text-gray-500 text-xs">Label</label>
            <select className="input" value={uploadLabel} onChange={e => setUploadLabel(e.target.value)}>
              {LABELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-gray-500 text-xs">Description</label>
            <input className="input" placeholder="Optional description..." value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} />
          </div>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-sky-500 bg-sky-950/20" : "border-gray-700 hover:border-gray-600"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="text-sky-400">Uploading...</div>
          ) : (
            <>
              <div className="text-gray-500 text-3xl mb-2">◈</div>
              <div className="text-gray-400">{isDragActive ? "Drop to upload" : "Drag & drop files here, or click to select"}</div>
              <div className="text-gray-600 text-xs mt-1">PNG, JPG, TXT, XML, CSV, PDF — max 50MB</div>
            </>
          )}
        </div>
      </div>

      {/* Unlinked Warning */}
      {unlinked.length > 0 && (
        <div className="border border-yellow-800 bg-yellow-950/20 rounded-lg p-3 text-yellow-400 text-sm">
          ⚠ {unlinked.length} unlinked evidence file(s) — not yet attached to any finding or OPLOG entry
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <select className="input w-40 text-xs" value={filterLabel} onChange={e => setFilterLabel(e.target.value)}>
          <option value="">All Labels</option>
          {LABELS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="input w-36 text-xs" value={filterLinked} onChange={e => setFilterLinked(e.target.value)}>
          <option value="">All</option>
          <option value="linked">Linked</option>
          <option value="unlinked">Unlinked</option>
        </select>
        <span className="text-gray-500 text-xs self-center">{evidence.length} files</span>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-3 gap-3">
        {evidence.map(ev => (
          <div key={ev.id} className={`card group relative ${!ev.oplog_entry_id && !ev.finding_id ? "border border-yellow-900" : ""}`}>
            {ev.file_type === "image" ? (
              <div
                className="h-32 bg-gray-800 rounded mb-2 cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={() => setLightbox(ev)}
              >
                <img src={evidenceAPI.fileUrl(ev.id)} alt={ev.filename} className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="h-32 bg-gray-800 rounded mb-2 flex items-center justify-center">
                <div className="text-gray-500 text-4xl">
                  {ev.file_type === "xml" ? "⚙" : ev.file_type === "text" ? "≡" : "◈"}
                </div>
              </div>
            )}
            <div className="text-gray-300 text-xs font-mono truncate">{ev.filename}</div>
            <div className="flex items-center gap-2 mt-1">
              {ev.display_id && <span className="text-gray-600 text-xs font-mono">{ev.display_id}</span>}
              {ev.label && <span className={`text-xs ${LABEL_COLORS[ev.label] || "text-gray-400"}`}>{ev.label}</span>}
            </div>
            {ev.description && <div className="text-gray-500 text-xs mt-1 truncate">{ev.description}</div>}
            <div className="flex gap-2 mt-2">
              <a href={evidenceAPI.fileUrl(ev.id)} target="_blank" rel="noreferrer" className="text-sky-400 text-xs hover:text-sky-300">Download</a>
              <button className="text-red-400 text-xs hover:text-red-300" onClick={() => deleteEv(ev.id)}>Delete</button>
            </div>
          </div>
        ))}
        {evidence.length === 0 && <div className="col-span-3 text-gray-600 text-center py-8">No evidence files yet</div>}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl max-h-screen p-4">
            <img src={evidenceAPI.fileUrl(lightbox.id)} alt={lightbox.filename} className="max-h-screen object-contain rounded" />
            <div className="text-gray-400 text-center text-sm mt-2">{lightbox.filename} — {lightbox.display_id}</div>
          </div>
        </div>
      )}
    </div>
  );
}
