import { Routes, Route } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import InitialContact from "./pages/InitialContact";
import FollowUp from "./pages/FollowUp";
import Opportunities from "./pages/Opportunities";
import FinalizeDeal from "./pages/FinalizeDeal";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import { CrmProvider, useCrm } from "./context/CrmContext";
import { isSupabaseConfigured } from "./lib/supabase";

function ConfigNeeded() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2 px-4">
      <div className="max-w-md rounded-2xl border border-hairline bg-surface-1 p-6" style={{ boxShadow: "var(--card-shadow)" }}>
        <h1 className="text-lg font-semibold text-ink mb-2">Supabase isn't configured yet</h1>
        <p className="text-sm text-ink-secondary mb-3">
          Copy <code className="text-accent">.env.example</code> to <code className="text-accent">.env.local</code>, fill
          in your Supabase project's URL and anon key, run <code className="text-accent">supabase/schema.sql</code> in the
          SQL Editor, then restart the dev server.
        </p>
      </div>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white animate-pulse"
        style={{ background: `linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))` }}
      >
        <Sparkles size={20} />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useCrm();
  if (loading) return <SplashScreen />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/initial-contact" element={<InitialContact />} />
        <Route path="/follow-up" element={<FollowUp />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/finalize-deal" element={<FinalizeDeal />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const { session, loading } = useAuth();

  if (!isSupabaseConfigured) return <ConfigNeeded />;
  if (loading) return <SplashScreen />;
  if (!session) return <Login />;

  return (
    <CrmProvider>
      <AppRoutes />
    </CrmProvider>
  );
}
