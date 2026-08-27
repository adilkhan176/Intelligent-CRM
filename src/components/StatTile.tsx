import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon?: LucideIcon;
  sub?: string;
}

export function StatTile({ label, value, delta, icon: Icon, sub }: StatTileProps) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-4 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-ink-muted shrink-0" />}
      </div>
      <div className="text-2xl font-semibold text-ink tabular-nums">{value}</div>
      <div className="flex items-center gap-1.5 text-xs">
        {delta && (
          <span
            className="font-medium"
            style={{ color: delta.positive ? "var(--success-text)" : "var(--status-critical)" }}
          >
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {sub && <span className="text-ink-muted">{sub}</span>}
      </div>
    </div>
  );
}
