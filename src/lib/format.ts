export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

const TODAY = new Date("2026-08-27T09:00:00");

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  const diff = d.getTime() - TODAY.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function relativeDays(iso: string): string {
  const days = daysUntil(iso) ?? 0;
  const abs = Math.abs(days);
  if (days === 0) return "today";
  if (days > 0) return `in ${abs} day${abs === 1 ? "" : "s"}`;
  return `${abs} day${abs === 1 ? "" : "s"} ago`;
}
