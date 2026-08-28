import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign, Target, TrendingUp, AlertCircle } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { StatRow } from "../components/StatRow";
import { StageBadge } from "../components/StageBadge";
import { LeadDetail } from "../components/LeadDetail";
import { formatCurrency, formatDateTime, relativeDays } from "../lib/format";
import type { Lead } from "../types";

function OverviewTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 px-3 py-2 text-xs shadow-lg">
      <div className="flex items-center gap-1.5 text-ink-secondary">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.color }} />
        {d.name}: <span className="font-medium text-ink">{d.value} ({d.pct}%)</span>
      </div>
    </div>
  );
}

const OPEN_STAGES = new Set(["new", "contacted", "followup", "opportunity"]);
const NOW = new Date("2026-08-27T09:00:00").getTime();

export default function Dashboard() {
  const { leads } = useCrm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const open = leads.filter((l) => OPEN_STAGES.has(l.stage));
    const pipelineValue = open.reduce((s, l) => s + l.estValue, 0);
    const won = leads.filter((l) => l.stage === "won");
    const lost = leads.filter((l) => l.stage === "lost");
    const winRate = won.length + lost.length > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
    const overdue = leads.filter(
      (l) => (l.stage === "followup" || l.stage === "contacted") && l.nextFollowUpAt && new Date(l.nextFollowUpAt).getTime() < NOW,
    );
    return {
      pipelineValue,
      openCount: open.length,
      opportunityCount: leads.filter((l) => l.stage === "opportunity").length,
      winRate,
      overdue,
    };
  }, [leads]);

  const recentActivity = useMemo(() => {
    const all = leads.flatMap((l) => l.activities.map((a) => ({ ...a, lead: l })));
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [leads]);

  const stageCounts = useMemo(() => {
    const order: Lead["stage"][] = ["new", "contacted", "followup", "opportunity", "won"];
    return order.map((s) => ({ stage: s, count: leads.filter((l) => l.stage === s).length }));
  }, [leads]);

  const overviewData = useMemo(() => {
    const pipeline = leads.filter((l) => l.stage !== "won" && l.stage !== "lost").length;
    const won = leads.filter((l) => l.stage === "won").length;
    const lost = leads.filter((l) => l.stage === "lost").length;
    const total = pipeline + won + lost;
    return [
      { name: "In Pipeline", value: pipeline, color: "var(--brand)" },
      { name: "Won", value: won, color: "var(--status-good)" },
      { name: "Lost", value: lost, color: "var(--status-critical)" },
    ].map((d) => ({ ...d, pct: total > 0 ? Math.round((d.value / total) * 100) : 0 }));
  }, [leads]);
  const totalLeads = overviewData.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your web design pipeline at a glance" />
      <div className="px-4 sm:px-6 md:px-8 pb-10">
        <StatRow>
          <StatTile label="Open Pipeline Value" value={formatCurrency(stats.pipelineValue)} icon={DollarSign} sub={`${stats.openCount} active leads`} />
          <StatTile label="Active Opportunities" value={String(stats.opportunityCount)} icon={Target} sub="in proposal / negotiation" />
          <StatTile label="Win Rate" value={`${Math.round(stats.winRate)}%`} icon={TrendingUp} sub="all-time closed deals" />
          <StatTile label="Needs Attention" value={String(stats.overdue.length)} icon={AlertCircle} sub="overdue follow-ups" />
        </StatRow>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 rounded-xl border border-hairline bg-surface-1 p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Pipeline Snapshot</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {stageCounts.map(({ stage, count }) => (
                <div key={stage} className="rounded-lg bg-surface-2 p-3 text-center">
                  <div className="text-lg font-semibold text-ink tabular-nums">{count}</div>
                  <div className="mt-1 flex justify-center"><StageBadge stage={stage} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-hairline bg-surface-1 p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Leads Overview</div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={overviewData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="90%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {overviewData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<OverviewTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-semibold text-ink tabular-nums">{totalLeads}</span>
                <span className="text-[10px] text-ink-muted uppercase tracking-wide">Total Leads</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {overviewData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-ink-secondary">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-ink font-medium tabular-nums">{d.value} · {d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Needs Attention</div>
            <div className="rounded-xl border border-hairline bg-surface-1 divide-y divide-[var(--gridline)]">
              {stats.overdue.length === 0 && (
                <div className="p-6 text-center text-sm text-ink-muted">Nothing overdue — nice work.</div>
              )}
              {stats.overdue.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-2 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-ink">{lead.company}</div>
                    <div className="text-xs text-ink-muted">{lead.contactName}</div>
                  </div>
                  <div className="text-xs font-medium" style={{ color: "var(--status-critical)" }}>
                    {relativeDays(lead.nextFollowUpAt!)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Recent Activity</div>
            <div className="rounded-xl border border-hairline bg-surface-1 divide-y divide-[var(--gridline)]">
              {recentActivity.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.lead.id)}
                  className="w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-surface-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink-secondary">
                      <span className="font-medium text-ink">{a.lead.company}</span> — {a.text}
                    </div>
                    <div className="text-xs text-ink-muted">{formatDateTime(a.date)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selected && <LeadDetail lead={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
