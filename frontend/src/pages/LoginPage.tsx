import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await authAPI.login(username, password);
      const meRes = await authAPI.me();
      setAuth(r.data.access_token, meRes.data);
      navigate("/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-sky-400 font-bold text-4xl tracking-widest mb-2">OPCHAIN</div>
          <div className="text-gray-500 text-sm">Pentest & Red Team Operations Center</div>
        </div>
        <form onSubmit={handleLogin} className="card space-y-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Username</label>
            <input
              className="input"
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
        <div className="text-center mt-4 text-gray-600 text-xs">
          OPCHAIN v1.0 — MIT License
        </div>
      </div>
    </div>
  );
}
