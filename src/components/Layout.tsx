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
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState } from "react";

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
  const { signOut } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const attentionCount = useMemo(() => {
    const now = new Date("2026-08-27T09:00:00").getTime();
    return leads.filter(
      (l) =>
        (l.stage === "followup" || l.stage === "contacted") &&
        l.nextFollowUpAt &&
        new Date(l.nextFollowUpAt).getTime() < now,
    ).length;
  }, [leads]);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
          <Sparkles size={16} />
        </div>
        <div className="leading-tight min-w-0">
          <div className="font-semibold text-white text-sm truncate">Intelligent CRM</div>
          <div className="text-[11px] text-white/60 truncate">Web Design Pipeline</div>
        </div>
        <button
          onClick={() => setNavOpen(false)}
          className="ml-auto rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setNavOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-[var(--sidebar-to)] shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
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

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => {
            if (confirm("Reset all demo data? This clears any changes you've made.")) {
              resetDemoData();
            }
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw size={14} />
          Reset demo data
        </button>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-surface-2">
      {/* Mobile top bar */}
      <div className="fixed top-0 inset-x-0 z-30 flex items-center gap-3 border-b border-hairline bg-surface-1 px-4 py-3 md:hidden">
        <button
          onClick={() => setNavOpen(true)}
          className="rounded-md p-1.5 text-ink-secondary hover:bg-surface-3"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
          <Sparkles size={14} />
        </div>
        <span className="font-semibold text-ink text-sm">Intelligent CRM</span>
      </div>

      {/* Backdrop for mobile drawer */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Sidebar: static on md+, off-canvas drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 flex flex-col transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: `linear-gradient(180deg, var(--sidebar-from), var(--sidebar-to))` }}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
