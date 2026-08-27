import type { Stage } from "../types";

const STAGE_STYLE: Record<Stage, { label: string; bg: string; fg: string }> = {
  new: { label: "New Lead", bg: "var(--surface-3)", fg: "var(--text-secondary)" },
  contacted: { label: "Initial Contact", bg: "color-mix(in srgb, var(--series-1) 14%, transparent)", fg: "var(--series-1)" },
  followup: { label: "Follow-Up", bg: "color-mix(in srgb, var(--status-warning) 20%, transparent)", fg: "var(--warning-text)" },
  opportunity: { label: "Opportunity", bg: "color-mix(in srgb, var(--series-7) 14%, transparent)", fg: "var(--series-7)" },
  won: { label: "Won", bg: "color-mix(in srgb, var(--status-good) 16%, transparent)", fg: "var(--success-text)" },
  lost: { label: "Lost", bg: "color-mix(in srgb, var(--status-critical) 14%, transparent)", fg: "var(--status-critical)" },
};

export function StageBadge({ stage }: { stage: Stage }) {
  const s = STAGE_STYLE[stage];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}
