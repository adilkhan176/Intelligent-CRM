import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  PhoneCall,
  Target,
  Handshake,
  BarChart3,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { useMemo } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/initial-contact", label: "Initial Contact", icon: UserPlus },
  { to: "/follow-up", label: "Follow-Up", icon: PhoneCall },
  { to: "/opportunities", label: "Opportunities", icon: Target },
  { to: "/finalize-deal", label: "Finalize Deal", icon: Handshake },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Layout() {
  const { leads, resetDemoData } = useCrm();

  const attentionCount = useMemo(() => {
    const now = new Date("2026-08-27T09:00:00").getTime();
    return leads.filter(
      (l) =>
        (l.stage === "followup" || l.stage === "contacted") &&
        l.nextFollowUpAt &&
        new Date(l.nextFollowUpAt).getTime() < now,
    ).length;
  }, [leads]);

  return (
    <div className="flex min-h-screen bg-surface-2">
      <aside className="w-64 shrink-0 border-r border-hairline bg-surface-1 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Sparkles size={16} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-ink text-sm">Intelligent CRM</div>
            <div className="text-[11px] text-ink-muted">Web Design Pipeline</div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-ink-secondary hover:bg-surface-3 hover:text-ink"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
              {item.to === "/follow-up" && attentionCount > 0 && (
                <span className="ml-auto rounded-full bg-[var(--status-critical)] text-white text-[10px] font-semibold min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {attentionCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-hairline">
          <button
            onClick={() => {
              if (confirm("Reset all demo data? This clears any changes you've made.")) {
                resetDemoData();
              }
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink-muted hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <RotateCcw size={14} />
            Reset demo data
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
