import { useEffect, useState } from "react";
import { useEngagementStore } from "../store/engagementStore";
import { useAuthStore } from "../store/authStore";
import { engagementsAPI, operatorsAPI } from "../api";
import type { Operator } from "../types";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { operator } = useAuthStore();
  const { engagements, setEngagements, setActive } = useEngagementStore();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [newUser, setNewUser] = useState({ username: "", display_name: "", password: "", role: "operator" });
  const [activeTab, setActiveTab] = useState<"engagements" | "operators" | "system">("engagements");

  useEffect(() => {
    if (operator?.role === "admin") {
      operatorsAPI.list().then(r => setOperators(r.data)).catch(() => {});
    }
  }, [operator?.role]);

  const archiveEng = async (id: string) => {
    await engagementsAPI.archive(id);
    const r = await engagementsAPI.list();
    setEngagements(r.data);
    if (r.data.length > 0) setActive(r.data[0]);
    toast.success("Engagement archived");
  };

  const createOperator = async () => {
    try {
      await operatorsAPI.create(newUser);
      const r = await operatorsAPI.list();
      setOperators(r.data);
      setNewUser({ username: "", display_name: "", password: "", role: "operator" });
      toast.success("Operator created");
    } catch { toast.error("Failed to create operator"); }
  };

  const deleteOperator = async (id: string) => {
    await operatorsAPI.delete(id);
    setOperators(ops => ops.filter(o => o.id !== id));
    toast.success("Operator removed");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-100">Settings</h1>

      <div className="flex border border-gray-700 rounded overflow-hidden w-fit">
        {(["engagements", "operators", "system"] as const).map(t => (
          <button
            key={t}
            className={`px-4 py-2 text-xs capitalize ${activeTab === t ? "bg-sky-700 text-white" : "text-gray-400 hover:bg-gray-800"}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "engagements" && (
        <div className="card space-y-3">
          <div className="text-gray-400 text-xs uppercase">Engagements</div>
          {engagements.length === 0 && <div className="text-gray-600 text-sm">No engagements</div>}
          {engagements.map(e => (
            <div key={e.id} className="flex items-center gap-3 py-2 border-b border-gray-800">
              <div className="flex-1">
                <div className="text-gray-200 text-sm">{e.name}</div>
                <div className="text-gray-500 text-xs">{e.client_name} — {e.status}</div>
              </div>
              <button
                className="text-red-400 text-xs hover:text-red-300"
                onClick={() => { if (confirm(`Archive "${e.name}"?`)) archiveEng(e.id); }}
              >
                Archive
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "operators" && (
        <div className="space-y-4">
          {operator?.role === "admin" ? (
            <>
              <div className="card space-y-3">
                <div className="text-gray-400 text-xs uppercase">Operators</div>
                {operators.map(op => (
                  <div key={op.id} className="flex items-center gap-3 py-2 border-b border-gray-800">
                    <div className="flex-1">
                      <div className="text-gray-200 text-sm">{op.display_name} <span className="text-gray-600">(@{op.username})</span></div>
                      <div className="text-gray-500 text-xs">{op.role}</div>
                    </div>
                    {op.id !== operator?.id && (
                      <button className="text-red-400 text-xs" onClick={() => deleteOperator(op.id)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="card space-y-3">
                <div className="text-gray-400 text-xs uppercase">Create Operator</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs">Username</label>
                    <input className="input" value={newUser.username} onChange={e => setNewUser(u => ({...u, username: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs">Display Name</label>
                    <input className="input" value={newUser.display_name} onChange={e => setNewUser(u => ({...u, display_name: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs">Password</label>
                    <input className="input" type="password" value={newUser.password} onChange={e => setNewUser(u => ({...u, password: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs">Role</label>
                    <select className="input" value={newUser.role} onChange={e => setNewUser(u => ({...u, role: e.target.value}))}>
                      <option>operator</option>
                      <option>admin</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary" onClick={createOperator}>Create Operator</button>
              </div>
            </>
          ) : (
            <div className="text-gray-500">Admin access required to manage operators</div>
          )}
        </div>
      )}

      {activeTab === "system" && (
        <div className="card space-y-3">
          <div className="text-gray-400 text-xs uppercase">System Info</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Version:</span> <span className="text-gray-300">OPCHAIN v1.0</span></div>
            <div><span className="text-gray-500">License:</span> <span className="text-gray-300">MIT</span></div>
            <div><span className="text-gray-500">Database:</span> <span className="text-gray-300 font-mono">SQLite (data/opchain.db)</span></div>
            <div><span className="text-gray-500">Evidence:</span> <span className="text-gray-300 font-mono">data/evidence/</span></div>
          </div>
          <div className="text-gray-600 text-xs border-t border-gray-800 pt-3">
            Backup: <code className="text-gray-400">cp -r ./opchain-data ./backup-$(date +%Y%m%d)</code>
          </div>
        </div>
      )}
    </div>
  );
}
