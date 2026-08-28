import type { LucideIcon } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(135deg, var(--grad-purple-1), var(--grad-purple-2))",
  "linear-gradient(135deg, var(--grad-rose-1), var(--grad-rose-2))",
  "linear-gradient(135deg, var(--grad-blue-1), var(--grad-blue-2))",
  "linear-gradient(135deg, var(--grad-orange-1), var(--grad-orange-2))",
];

interface StatTileProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon?: LucideIcon;
  sub?: string;
  /** Injected automatically by StatRow; cycles through the brand gradient set. */
  variant?: number;
}

export function StatTile({ label, value, delta, icon: Icon, sub, variant }: StatTileProps) {
  const gradient = variant !== undefined ? GRADIENTS[variant % GRADIENTS.length] : undefined;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1.5 min-w-0"
      style={
        gradient
          ? { background: gradient, boxShadow: "var(--card-shadow)" }
          : { background: "var(--surface-1)", border: "1px solid var(--gridline)" }
      }
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: gradient ? "rgba(255,255,255,0.85)" : "var(--text-muted)" }}
        >
          {label}
        </span>
        {Icon && (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full shrink-0"
            style={gradient ? { background: "rgba(255,255,255,0.2)" } : undefined}
          >
            <Icon size={14} style={{ color: gradient ? "#fff" : "var(--text-muted)" }} />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold tabular-nums" style={{ color: gradient ? "#fff" : "var(--text-primary)" }}>
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {delta && (
          <span
            className="font-medium"
            style={{ color: gradient ? "#fff" : delta.positive ? "var(--success-text)" : "var(--status-critical)" }}
          >
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {sub && <span style={{ color: gradient ? "rgba(255,255,255,0.75)" : "var(--text-muted)" }}>{sub}</span>}
      </div>
    </div>
  );
}
