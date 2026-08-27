import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import InitialContact from "./pages/InitialContact";
import FollowUp from "./pages/FollowUp";
import Opportunities from "./pages/Opportunities";
import FinalizeDeal from "./pages/FinalizeDeal";
import Analytics from "./pages/Analytics";

export default function App() {
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
