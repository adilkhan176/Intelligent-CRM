import { useMemo, useState } from "react";
import { UserPlus, PhoneCall, Clock, TrendingUp } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { LeadTable } from "../components/LeadTable";
import { LeadDetail } from "../components/LeadDetail";
import { formatDate } from "../lib/format";

export default function InitialContact() {
  const { leads, setStage, addActivity } = useCrm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const newLeads = useMemo(() => leads.filter((l) => l.stage === "new").sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [leads]);
  const contacted = useMemo(() => leads.filter((l) => l.stage === "contacted").sort((a, b) => b.lastContactAt.localeCompare(a.lastContactAt)), [leads]);

  const stats = useMemo(() => {
    const totalNew = newLeads.length;
    const totalContacted = contacted.length;
    const totalIntake = totalNew + totalContacted + leads.filter((l) => ["followup", "opportunity", "won", "lost"].includes(l.stage)).length;
    const conversionRate = totalIntake > 0 ? ((totalIntake - totalNew) / totalIntake) * 100 : 0;
    return { totalNew, totalContacted, conversionRate };
  }, [newLeads, contacted, leads]);

  const logInitialContact = (id: string) => {
    addActivity(id, "call", "Made initial contact — introduced the studio and discussed project goals.");
    setStage(id, "contacted");
  };

  return (
    <div>
      <PageHeader
        title="Initial Contact"
        subtitle="New leads waiting for first outreach, and leads you've just reached"
      />
      <div className="px-8 pb-10">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile label="New Leads" value={String(stats.totalNew)} icon={UserPlus} sub="awaiting first contact" />
          <StatTile label="Recently Contacted" value={String(stats.totalContacted)} icon={PhoneCall} sub="in initial contact stage" />
          <StatTile label="Avg. Response Time" value="1.4 days" icon={Clock} sub="lead created to first touch" />
          <StatTile label="Intake Conversion" value={`${Math.round(stats.conversionRate)}%`} icon={TrendingUp} sub="advance past new" />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Awaiting First Contact</div>
        </div>
        <div className="mb-8">
          <LeadTable
            leads={newLeads}
            onSelect={(l) => setSelectedId(l.id)}
            metaLabel="Received"
            meta={(l) => <span className="text-ink-secondary">{formatDate(l.createdAt)}</span>}
            emptyMessage="No new leads right now — you're all caught up."
          />
        </div>

        <div className="mb-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Recently Contacted</div>
        <LeadTable
          leads={contacted}
          onSelect={(l) => setSelectedId(l.id)}
          metaLabel="Next Follow-Up"
          meta={(l) => <span className="text-ink-secondary">{formatDate(l.nextFollowUpAt)}</span>}
          emptyMessage="No leads currently in initial contact."
        />
      </div>

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelectedId(null)}
          actions={
            selected.stage === "new" ? (
              <button
                onClick={() => {
                  logInitialContact(selected.id);
                }}
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Log Initial Contact
              </button>
            ) : selected.stage === "contacted" ? (
              <button
                onClick={() => setStage(selected.id, "followup")}
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Move to Follow-Up
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}
