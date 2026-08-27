import { useMemo, useState } from "react";
import { PhoneCall, AlertTriangle, CalendarClock, Target } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { LeadTable } from "../components/LeadTable";
import { LeadDetail } from "../components/LeadDetail";
import { relativeDays } from "../lib/format";

const NOW = new Date("2026-08-27T09:00:00").getTime();

export default function FollowUp() {
  const { leads, setStage, addActivity, scheduleFollowUp } = useCrm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nextDate, setNextDate] = useState("");
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const followups = useMemo(
    () => leads.filter((l) => l.stage === "followup").sort((a, b) => (a.nextFollowUpAt ?? "").localeCompare(b.nextFollowUpAt ?? "")),
    [leads],
  );

  const stats = useMemo(() => {
    const overdue = followups.filter((l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt).getTime() < NOW);
    const dueThisWeek = followups.filter((l) => {
      if (!l.nextFollowUpAt) return false;
      const days = (new Date(l.nextFollowUpAt).getTime() - NOW) / 86400000;
      return days >= 0 && days <= 7;
    });
    const avgAge =
      followups.length > 0
        ? Math.round(followups.reduce((s, l) => s + (NOW - new Date(l.createdAt).getTime()) / 86400000, 0) / followups.length)
        : 0;
    return { total: followups.length, overdue: overdue.length, dueThisWeek: dueThisWeek.length, avgAge };
  }, [followups]);

  const logFollowUp = () => {
    if (!selected) return;
    addActivity(selected.id, "call", "Follow-up call completed — reviewed status and next steps.");
    if (nextDate) {
      scheduleFollowUp(selected.id, new Date(nextDate).toISOString());
      setNextDate("");
    }
  };

  return (
    <div>
      <PageHeader title="Follow-Up" subtitle="Leads in active nurture — keep the conversation moving" />
      <div className="px-8 pb-10">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile label="In Follow-Up" value={String(stats.total)} icon={PhoneCall} sub="active leads" />
          <StatTile
            label="Overdue"
            value={String(stats.overdue)}
            icon={AlertTriangle}
            sub="past due date"
          />
          <StatTile label="Due This Week" value={String(stats.dueThisWeek)} icon={CalendarClock} sub="upcoming touchpoints" />
          <StatTile label="Avg. Time in Stage" value={`${stats.avgAge}d`} icon={Target} sub="since lead created" />
        </div>

        <LeadTable
          leads={followups}
          onSelect={(l) => setSelectedId(l.id)}
          metaLabel="Next Follow-Up"
          meta={(l) => {
            const overdue = l.nextFollowUpAt ? new Date(l.nextFollowUpAt).getTime() < NOW : false;
            return (
              <span className="font-medium" style={{ color: overdue ? "var(--status-critical)" : "var(--text-secondary)" }}>
                {l.nextFollowUpAt ? relativeDays(l.nextFollowUpAt) : "Not scheduled"}
              </span>
            );
          }}
          emptyMessage="No leads currently in follow-up."
        />
      </div>

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelectedId(null)}
          actions={
            <div className="flex flex-wrap items-center gap-2 w-full">
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="rounded-md border border-hairline bg-surface-1 px-2 py-1.5 text-sm text-ink-secondary"
              />
              <button
                onClick={logFollowUp}
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Log Follow-Up & Reschedule
              </button>
              <button
                onClick={() => setStage(selected.id, "opportunity")}
                className="rounded-md border border-hairline px-3 py-1.5 text-sm font-medium text-ink-secondary hover:bg-surface-3"
              >
                Advance to Opportunity
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Reason for marking this lead lost?");
                  if (reason !== null) setStage(selected.id, "lost", { lossReason: reason || "No reason given" });
                }}
                className="rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-80"
                style={{ color: "var(--status-critical)" }}
              >
                Mark Lost
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}
