import { useMemo, useState } from "react";
import { Handshake, DollarSign, Percent, Clock3 } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { LeadTable } from "../components/LeadTable";
import { LeadDetail } from "../components/LeadDetail";
import { formatCurrency, formatDate } from "../lib/format";

const NOW = new Date("2026-08-27T09:00:00").getTime();
const DAY = 86400000;

export default function FinalizeDeal() {
  const { leads, setStage } = useCrm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const readyToClose = useMemo(
    () => leads.filter((l) => l.stage === "opportunity").sort((a, b) => b.probability - a.probability),
    [leads],
  );
  const wonDeals = useMemo(
    () => leads.filter((l) => l.stage === "won").sort((a, b) => (b.closeDate ?? "").localeCompare(a.closeDate ?? "")),
    [leads],
  );
  const lostDeals = useMemo(
    () => leads.filter((l) => l.stage === "lost").sort((a, b) => (b.closeDate ?? "").localeCompare(a.closeDate ?? "")),
    [leads],
  );

  const stats = useMemo(() => {
    const closedThisMonth = [...wonDeals, ...lostDeals].filter((l) => {
      if (!l.closeDate) return false;
      const days = (NOW - new Date(l.closeDate).getTime()) / DAY;
      return days <= 30;
    }).length;
    const winRate = wonDeals.length + lostDeals.length > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;
    const totalWonValue = wonDeals.reduce((s, l) => s + l.estValue, 0);
    const cycles = wonDeals
      .filter((l) => l.closeDate)
      .map((l) => (new Date(l.closeDate!).getTime() - new Date(l.createdAt).getTime()) / DAY);
    const avgCycle = cycles.length > 0 ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length) : 0;
    return { closedThisMonth, winRate, totalWonValue, avgCycle };
  }, [wonDeals, lostDeals]);

  const markWon = (id: string) => {
    setStage(id, "won");
    setSelectedId(null);
  };
  const markLost = (id: string) => {
    const reason = prompt("Reason for marking this lead lost?");
    if (reason === null) return;
    setStage(id, "lost", { lossReason: reason || "No reason given" });
    setSelectedId(null);
  };

  return (
    <div>
      <PageHeader title="Finalize Deal" subtitle="Close out opportunities and hand off won projects to execution" />
      <div className="px-8 pb-10">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile label="Closed This Month" value={String(stats.closedThisMonth)} icon={Handshake} sub="won + lost" />
          <StatTile label="Win Rate" value={`${Math.round(stats.winRate)}%`} icon={Percent} sub="all-time" />
          <StatTile label="Total Won Value" value={formatCurrency(stats.totalWonValue)} icon={DollarSign} sub="all-time" />
          <StatTile label="Avg. Sales Cycle" value={`${stats.avgCycle}d`} icon={Clock3} sub="lead to close" />
        </div>

        <div className="mb-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Ready to Close</div>
        <div className="mb-8">
          <LeadTable
            leads={readyToClose}
            onSelect={(l) => setSelectedId(l.id)}
            metaLabel="Win Probability"
            meta={(l) => <span className="text-ink-secondary tabular-nums">{l.probability}%</span>}
            emptyMessage="No opportunities ready to close yet."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Recently Won</div>
            <div className="rounded-xl border border-hairline bg-surface-1 divide-y divide-[var(--gridline)]">
              {wonDeals.slice(0, 6).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-2"
                >
                  <div>
                    <div className="text-sm font-medium text-ink">{l.company}</div>
                    <div className="text-xs text-ink-muted">{formatDate(l.closeDate)}</div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums" style={{ color: "var(--success-text)" }}>
                    {formatCurrency(l.estValue)}
                  </div>
                </button>
              ))}
              {wonDeals.length === 0 && <div className="p-6 text-center text-sm text-ink-muted">No won deals yet.</div>}
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Recently Lost</div>
            <div className="rounded-xl border border-hairline bg-surface-1 divide-y divide-[var(--gridline)]">
              {lostDeals.slice(0, 6).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-2"
                >
                  <div>
                    <div className="text-sm font-medium text-ink">{l.company}</div>
                    <div className="text-xs text-ink-muted">{l.lossReason}</div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums" style={{ color: "var(--status-critical)" }}>
                    {formatCurrency(l.estValue)}
                  </div>
                </button>
              ))}
              {lostDeals.length === 0 && <div className="p-6 text-center text-sm text-ink-muted">No lost deals yet.</div>}
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelectedId(null)}
          actions={
            selected.stage === "opportunity" ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => markWon(selected.id)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  style={{ background: "var(--status-good)" }}
                >
                  Mark Won — Send to Execution
                </button>
                <button
                  onClick={() => markLost(selected.id)}
                  className="rounded-md border border-hairline px-3 py-1.5 text-sm font-medium hover:bg-surface-3"
                  style={{ color: "var(--status-critical)" }}
                >
                  Mark Lost
                </button>
              </div>
            ) : null
          }
        />
      )}
    </div>
  );
}
