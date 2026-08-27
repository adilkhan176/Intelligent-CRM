import type { ReactNode } from "react";
import type { Lead } from "../types";
import { formatCurrency } from "../lib/format";

export function LeadTable({
  leads,
  onSelect,
  metaLabel,
  meta,
  emptyMessage = "No leads in this stage.",
}: {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  metaLabel: string;
  meta: (lead: Lead) => ReactNode;
  emptyMessage?: string;
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hairline py-16 text-center text-sm text-ink-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-1 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-xs text-ink-muted uppercase tracking-wide">
            <th className="px-4 py-2.5 font-medium">Company / Contact</th>
            <th className="px-4 py-2.5 font-medium">Project</th>
            <th className="px-4 py-2.5 font-medium">Source</th>
            <th className="px-4 py-2.5 font-medium text-right">Value</th>
            <th className="px-4 py-2.5 font-medium">{metaLabel}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onSelect(lead)}
              className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-2 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{lead.company}</div>
                <div className="text-xs text-ink-muted">{lead.contactName}</div>
              </td>
              <td className="px-4 py-3 text-ink-secondary">{lead.projectType}</td>
              <td className="px-4 py-3 text-ink-secondary">{lead.source}</td>
              <td className="px-4 py-3 text-right tabular-nums text-ink font-medium">
                {formatCurrency(lead.estValue)}
              </td>
              <td className="px-4 py-3">{meta(lead)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
