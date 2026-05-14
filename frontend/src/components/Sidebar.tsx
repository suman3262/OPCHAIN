import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEngagementStore } from "../store/engagementStore";
import { engagementsAPI } from "../api";
import { useState } from "react";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "▪" },
  { path: "/oplog", label: "OPLOG", icon: "◉" },
  { path: "/scope", label: "Scope Guardian", icon: "◎" },
  { path: "/evidence", label: "Evidence Locker", icon: "◈" },
  { path: "/findings", label: "Finding Library", icon: "◆" },
  { path: "/attack-path", label: "Attack Path", icon: "◀" },
  { path: "/report", label: "Report Generator", icon: "◷" },
  { path: "/settings", label: "Settings", icon: "◧" },
];

const STATUS_COLORS: Record<string, string> = {
  Active: "text-green-400",
  Planning: "text-yellow-400",
  Completed: "text-blue-400",
  Archived: "text-gray-500",
};

export default function Sidebar() {
  const { operator, logout } = useAuthStore();
  const { engagements, activeEngagement, setActive, setEngagements } = useEngagementStore();
  const navigate = useNavigate();
  const [showNewEng, setShowNewEng] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const createEngagement = async () => {
    if (!newName || !newClient) return;
    try {
      const r = await engagementsAPI.create({ name: newName, client_name: newClient, status: "Active" });
      const updated = await engagementsAPI.list();
      setEngagements(updated.data);
      setActive(r.data);
      setShowNewEng(false);
      setNewName(""); setNewClient("");
      toast.success("Engagement created");
    } catch {
      toast.error("Failed to create engagement");
    }
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="text-sky-400 font-bold text-xl tracking-widest">OPCHAIN</div>
        <div className="text-gray-500 text-xs">Pentest Operations Center</div>
      </div>

      {/* Engagement Switcher */}
      <div className="p-3 border-b border-gray-800">
        <div className="text-gray-500 text-xs uppercase mb-2">Active Engagement</div>
        {activeEngagement ? (
          <div className="text-sm">
            <div className="text-gray-200 font-medium truncate">{activeEngagement.name}</div>
            <div className="text-gray-500 text-xs truncate">{activeEngagement.client_name}</div>
            <span className={`text-xs ${STATUS_COLORS[activeEngagement.status] || "text-gray-400"}`}>
              ● {activeEngagement.status}
            </span>
          </div>
        ) : (
          <div className="text-gray-500 text-xs">No engagement active</div>
        )}

        <select
          className="input mt-2 text-xs py-1"
          value={activeEngagement?.id || ""}
          onChange={(e) => {
            const eng = engagements.find((x) => x.id === e.target.value);
            if (eng) setActive(eng);
          }}
        >
          <option value="">-- switch --</option>
          {engagements.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        {showNewEng ? (
          <div className="mt-2 space-y-1">
            <input className="input text-xs py-1" placeholder="Engagement name" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="input text-xs py-1" placeholder="Client name" value={newClient} onChange={e => setNewClient(e.target.value)} />
            <div className="flex gap-1">
              <button className="btn-primary text-xs py-1 flex-1" onClick={createEngagement}>Create</button>
              <button className="btn-secondary text-xs py-1" onClick={() => setShowNewEng(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="text-xs text-sky-400 hover:text-sky-300 mt-1" onClick={() => setShowNewEng(true)}>+ New Engagement</button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-sky-900/50 text-sky-300 border border-sky-800"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`
            }
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Operator footer */}
      <div className="p-3 border-t border-gray-800">
        {operator && (
          <div className="mb-2">
            <div className="text-gray-300 text-sm">{operator.display_name}</div>
            <div className="text-gray-500 text-xs">
              {operator.role === "admin" ? "🔑 Admin" : "Operator"}
            </div>
          </div>
        )}
        <button className="btn-secondary text-xs w-full" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
