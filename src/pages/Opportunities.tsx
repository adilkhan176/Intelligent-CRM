import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, DollarSign, TrendingUp, Percent } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { LeadDetail } from "../components/LeadDetail";
import { formatCurrency } from "../lib/format";

export default function Opportunities() {
  const { leads, updateLead } = useCrm();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const opportunities = useMemo(
    () => leads.filter((l) => l.stage === "opportunity").sort((a, b) => b.estValue - a.estValue),
    [leads],
  );

  const stats = useMemo(() => {
    const totalValue = opportunities.reduce((s, l) => s + l.estValue, 0);
    const weighted = opportunities.reduce((s, l) => s + (l.estValue * l.probability) / 100, 0);
    const totalCost = opportunities.reduce((s, l) => s + l.proposalCost, 0);
    const avgMargin =
      totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;
    const avgProbability =
      opportunities.length > 0 ? opportunities.reduce((s, l) => s + l.probability, 0) / opportunities.length : 0;
    return { totalValue, weighted, avgMargin, avgProbability };
  }, [opportunities]);

  const bumpProbability = (id: string, delta: number) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const next = Math.min(95, Math.max(5, lead.probability + delta));
    updateLead(id, { probability: next });
  };

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="Scoped proposals — track estimated value against delivery cost"
      />
      <div className="px-8 pb-10">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile label="Pipeline Value" value={formatCurrency(stats.totalValue)} icon={DollarSign} sub={`${opportunities.length} open opportunities`} />
          <StatTile label="Weighted Value" value={formatCurrency(stats.weighted)} icon={TrendingUp} sub="value × probability" />
          <StatTile label="Avg. Margin" value={`${Math.round(stats.avgMargin)}%`} icon={Percent} sub="value vs. delivery cost" />
          <StatTile label="Avg. Win Probability" value={`${Math.round(stats.avgProbability)}%`} icon={Target} sub="across open opportunities" />
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-hairline py-16 text-center text-sm text-ink-muted">
            No opportunities yet. Advance leads here from Follow-Up.
          </div>
        ) : (
          <div className="rounded-xl border border-hairline bg-surface-1 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs text-ink-muted uppercase tracking-wide">
                  <th className="px-4 py-2.5 font-medium">Company</th>
                  <th className="px-4 py-2.5 font-medium text-right">Est. Value</th>
                  <th className="px-4 py-2.5 font-medium text-right">Delivery Cost</th>
                  <th className="px-4 py-2.5 font-medium text-right">Margin</th>
                  <th className="px-4 py-2.5 font-medium">Win Probability</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((lead) => {
                  const margin = Math.round(((lead.estValue - lead.proposalCost) / lead.estValue) * 100);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedId(lead.id)}
                      className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-2 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{lead.company}</div>
                        <div className="text-xs text-ink-muted">{lead.projectType}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink font-medium">{formatCurrency(lead.estValue)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{formatCurrency(lead.proposalCost)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: margin >= 40 ? "var(--success-text)" : "var(--text-secondary)" }}>
                        {margin}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-surface-3 max-w-24 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${lead.probability}%`, background: "var(--series-1)" }}
                            />
                          </div>
                          <span className="text-xs text-ink-secondary tabular-nums w-8">{lead.probability}%</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              bumpProbability(lead.id, -10);
                            }}
                            className="text-ink-muted hover:text-ink px-1 rounded"
                          >
                            −
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              bumpProbability(lead.id, 10);
                            }}
                            className="text-ink-muted hover:text-ink px-1 rounded"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelectedId(null)}
          actions={
            <button
              onClick={() => navigate("/finalize-deal")}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Ready to Finalize →
            </button>
          }
        />
      )}
    </div>
  );
}
