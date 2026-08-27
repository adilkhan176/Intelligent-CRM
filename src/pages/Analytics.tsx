import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import { DollarSign, Percent, Target, TrendingUp } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { formatCompact, formatCurrency } from "../lib/format";
import type { Lead } from "../types";

const NOW = new Date("2026-08-27T09:00:00");

const FUNNEL_STAGES: { stage: Lead["stage"]; label: string; color: string }[] = [
  { stage: "new", label: "New Lead", color: "var(--seq-250)" },
  { stage: "contacted", label: "Initial Contact", color: "var(--seq-350)" },
  { stage: "followup", label: "Follow-Up", color: "var(--seq-450)" },
  { stage: "opportunity", label: "Opportunity", color: "var(--seq-550)" },
  { stage: "won", label: "Won", color: "var(--seq-600)" },
];

const SOURCE_COLORS: Record<string, string> = {
  "Referral": "var(--series-1)",
  "Website Inquiry": "var(--series-2)",
  "LinkedIn": "var(--series-3)",
  "Cold Outreach": "var(--series-4)",
  "Google Ads": "var(--series-5)",
  "Dribbble/Portfolio": "var(--series-6)",
};

function lastMonths(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(NOW.getFullYear(), NOW.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return out;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-ink mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-ink-secondary">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color ?? p.fill }} />
          {p.name}: <span className="font-medium text-ink">{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { leads } = useCrm();

  const kpis = useMemo(() => {
    const open = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
    const pipelineValue = open.reduce((s, l) => s + l.estValue, 0);
    const won = leads.filter((l) => l.stage === "won");
    const lost = leads.filter((l) => l.stage === "lost");
    const winRate = won.length + lost.length > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
    const avgDeal = won.length > 0 ? won.reduce((s, l) => s + l.estValue, 0) / won.length : 0;
    return { pipelineValue, winRate, avgDeal, openCount: open.length };
  }, [leads]);

  const funnelData = useMemo(
    () =>
      FUNNEL_STAGES.map((f) => ({
        stage: f.label,
        count: leads.filter((l) => l.stage === f.stage).length,
        fill: f.color,
      })),
    [leads],
  );

  const months = useMemo(() => lastMonths(7), []);

  const revenueData = useMemo(() => {
    const won = leads.filter((l) => l.stage === "won" && l.closeDate);
    return months.map((m) => ({
      month: m.label,
      revenue: won.filter((l) => monthKey(l.closeDate!) === m.key).reduce((s, l) => s + l.estValue, 0),
    }));
  }, [leads, months]);

  const winLossData = useMemo(() => {
    const closed = leads.filter((l) => (l.stage === "won" || l.stage === "lost") && l.closeDate);
    return months.map((m) => ({
      month: m.label,
      won: closed.filter((l) => l.stage === "won" && monthKey(l.closeDate!) === m.key).length,
      lost: -closed.filter((l) => l.stage === "lost" && monthKey(l.closeDate!) === m.key).length,
    }));
  }, [leads, months]);

  const sourceData = useMemo(() => {
    const counts = new Map<string, number>();
    leads.forEach((l) => counts.set(l.source, (counts.get(l.source) ?? 0) + 1));
    return Array.from(counts.entries())
      .map(([source, count]) => ({ source, count, fill: SOURCE_COLORS[source] ?? "var(--series-1)" }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Pipeline performance and conversion trends" />
      <div className="px-8 pb-12">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile label="Open Pipeline Value" value={formatCurrency(kpis.pipelineValue)} icon={DollarSign} sub={`${kpis.openCount} active leads`} />
          <StatTile label="Win Rate" value={`${Math.round(kpis.winRate)}%`} icon={Percent} sub="all-time" />
          <StatTile label="Avg. Deal Size" value={formatCurrency(kpis.avgDeal)} icon={TrendingUp} sub="won deals" />
          <StatTile label="Active Opportunities" value={String(leads.filter((l) => l.stage === "opportunity").length)} icon={Target} sub="in proposal" />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="rounded-xl border border-hairline bg-surface-1 p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Pipeline Funnel</div>
            <div className="text-[11px] text-ink-muted mb-3">Current leads by stage</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke="var(--gridline)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-2)" }} />
                <Bar dataKey="count" name="Leads" radius={4} maxBarSize={22}>
                  {funnelData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                  <LabelList dataKey="count" position="right" fill="var(--text-primary)" fontSize={12} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <details className="mt-2">
              <summary className="text-xs text-ink-muted cursor-pointer hover:text-ink-secondary">View as table</summary>
              <table className="w-full text-xs mt-2">
                <tbody>
                  {funnelData.map((d) => (
                    <tr key={d.stage} className="border-t border-hairline">
                      <td className="py-1 text-ink-secondary">{d.stage}</td>
                      <td className="py-1 text-right text-ink font-medium">{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>

          <div className="rounded-xl border border-hairline bg-surface-1 p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Revenue Trend</div>
            <div className="text-[11px] text-ink-muted mb-3">Won deal value by month</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--gridline)" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "var(--baseline)" }} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickFormatter={(v) => formatCompact(v)}
                  width={40}
                />
                <Tooltip content={<ChartTooltip formatter={formatCurrency} />} cursor={{ stroke: "var(--baseline)" }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--series-1)"
                  strokeWidth={2}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <details className="mt-2">
              <summary className="text-xs text-ink-muted cursor-pointer hover:text-ink-secondary">View as table</summary>
              <table className="w-full text-xs mt-2">
                <tbody>
                  {revenueData.map((d) => (
                    <tr key={d.month} className="border-t border-hairline">
                      <td className="py-1 text-ink-secondary">{d.month}</td>
                      <td className="py-1 text-right text-ink font-medium">{formatCurrency(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-hairline bg-surface-1 p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Lead Sources</div>
            <div className="text-[11px] text-ink-muted mb-3">All-time leads by source</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sourceData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke="var(--gridline)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="source"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-2)" }} />
                <Bar dataKey="count" name="Leads" radius={4} maxBarSize={18}>
                  {sourceData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                  <LabelList dataKey="count" position="right" fill="var(--text-primary)" fontSize={12} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <details className="mt-2">
              <summary className="text-xs text-ink-muted cursor-pointer hover:text-ink-secondary">View as table</summary>
              <table className="w-full text-xs mt-2">
                <tbody>
                  {sourceData.map((d) => (
                    <tr key={d.source} className="border-t border-hairline">
                      <td className="py-1 text-ink-secondary">{d.source}</td>
                      <td className="py-1 text-right text-ink font-medium">{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>

          <div className="rounded-xl border border-hairline bg-surface-1 p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Won vs. Lost</div>
            <div className="text-[11px] text-ink-muted mb-3">Deals closed by month</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={winLossData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="var(--gridline)" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "var(--baseline)" }} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} width={30} allowDecimals={false} />
                <ReferenceLine y={0} stroke="var(--baseline)" />
                <Tooltip content={<ChartTooltip formatter={(v: number) => Math.abs(v)} />} cursor={{ fill: "var(--surface-2)" }} />
                <Bar dataKey="won" name="Won" fill="var(--series-1)" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar dataKey="lost" name="Lost" fill="var(--diverge-red)" radius={[0, 0, 3, 3]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-ink-secondary">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "var(--series-1)" }} />Won</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "var(--diverge-red)" }} />Lost</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
