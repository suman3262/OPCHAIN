import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEngagementStore } from "./store/engagementStore";
import { authAPI, engagementsAPI } from "./api";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OPLOGPage from "./pages/OPLOGPage";
import ScopePage from "./pages/ScopePage";
import EvidencePage from "./pages/EvidencePage";
import FindingsPage from "./pages/FindingsPage";
import AttackPathPage from "./pages/AttackPathPage";
import ReportPage from "./pages/ReportPage";
import SettingsPage from "./pages/SettingsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { token, setAuth, operator } = useAuthStore();
  const { setEngagements, setActive } = useEngagementStore();

  useEffect(() => {
    if (!token) return;
    if (!operator) authAPI.me().then((r) => setAuth(token, r.data)).catch(() => {});
    engagementsAPI.list().then((r) => {
      setEngagements(r.data);
      const savedId = localStorage.getItem("opchain_active_eng");
      const saved = r.data.find((e) => e.id === savedId);
      if (saved) setActive(saved);
      else if (r.data.length > 0) setActive(r.data[0]);
    }).catch(() => {});
  }, [token]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: "#1f2937", color: "#f9fafb", border: "1px solid #374151" } }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="oplog" element={<OPLOGPage />} />
          <Route path="scope" element={<ScopePage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="findings" element={<FindingsPage />} />
          <Route path="attack-path" element={<AttackPathPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
