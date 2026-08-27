import { useState, type ReactNode } from "react";
import { Mail, Phone, Briefcase, Radio, User, Send, UserCog } from "lucide-react";
import type { ActivityType, Lead } from "../types";
import { Modal } from "./Modal";
import { StageBadge } from "./StageBadge";
import { useCrm } from "../context/CrmContext";
import { formatCurrency, formatDateTime, formatDate } from "../lib/format";

const ACTIVITY_ICON: Record<ActivityType, string> = {
  call: "📞",
  email: "✉️",
  meeting: "🤝",
  note: "📝",
  system: "•",
};

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-secondary">
      <span className="text-ink-muted">{icon}</span>
      {children}
    </div>
  );
}

export function LeadDetail({
  lead,
  onClose,
  actions,
}: {
  lead: Lead;
  onClose: () => void;
  actions?: ReactNode;
}) {
  const { addActivity } = useCrm();
  const [note, setNote] = useState("");
  const [type, setType] = useState<ActivityType>("call");

  const submitActivity = () => {
    if (!note.trim()) return;
    addActivity(lead.id, type, note.trim());
    setNote("");
  };

  return (
    <Modal
      title={lead.company}
      onClose={onClose}
      width={560}
    >
      <div className="flex items-center justify-between -mt-1 mb-4">
        <StageBadge stage={lead.stage} />
        <span className="text-lg font-semibold text-ink tabular-nums">{formatCurrency(lead.estValue)}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
        <InfoRow icon={<User size={14} />}>{lead.contactName}</InfoRow>
        <InfoRow icon={<Briefcase size={14} />}>{lead.projectType}</InfoRow>
        <InfoRow icon={<Mail size={14} />}>
          <a href={`mailto:${lead.email}`} className="hover:text-accent truncate">{lead.email}</a>
        </InfoRow>
        <InfoRow icon={<Phone size={14} />}>{lead.phone}</InfoRow>
        <InfoRow icon={<Radio size={14} />}>{lead.source}</InfoRow>
        <InfoRow icon={<UserCog size={14} />}>Owner: {lead.assignedTo}</InfoRow>
      </div>

      {lead.stage === "opportunity" || lead.stage === "won" || lead.stage === "lost" ? (
        <div className="grid grid-cols-3 gap-2 mb-4 rounded-lg bg-surface-2 p-3 text-center">
          <div>
            <div className="text-[11px] text-ink-muted uppercase">Est. Value</div>
            <div className="text-sm font-semibold text-ink tabular-nums">{formatCurrency(lead.estValue)}</div>
          </div>
          <div>
            <div className="text-[11px] text-ink-muted uppercase">Delivery Cost</div>
            <div className="text-sm font-semibold text-ink tabular-nums">{formatCurrency(lead.proposalCost)}</div>
          </div>
          <div>
            <div className="text-[11px] text-ink-muted uppercase">Margin</div>
            <div className="text-sm font-semibold text-ink tabular-nums">
              {Math.round(((lead.estValue - lead.proposalCost) / lead.estValue) * 100)}%
            </div>
          </div>
        </div>
      ) : null}

      {lead.nextFollowUpAt && (
        <div className="mb-4 text-xs text-ink-muted">
          Next follow-up: <span className="text-ink-secondary font-medium">{formatDate(lead.nextFollowUpAt)}</span>
        </div>
      )}

      {lead.lossReason && (
        <div className="mb-4 rounded-lg px-3 py-2 text-xs" style={{ background: "color-mix(in srgb, var(--status-critical) 10%, transparent)", color: "var(--status-critical)" }}>
          Loss reason: {lead.lossReason}
        </div>
      )}

      {actions && <div className="flex flex-wrap gap-2 mb-5">{actions}</div>}

      <div className="mb-2 text-xs font-semibold text-ink-muted uppercase tracking-wide">Activity</div>
      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 mb-4">
        {[...lead.activities].reverse().map((a) => (
          <div key={a.id} className="flex gap-2 text-sm">
            <span className="shrink-0">{ACTIVITY_ICON[a.type]}</span>
            <div className="min-w-0">
              <div className="text-ink-secondary">{a.text}</div>
              <div className="text-[11px] text-ink-muted">{formatDateTime(a.date)} · {a.author}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-hairline pt-3">
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ActivityType)}
            className="rounded-md border border-hairline bg-surface-1 px-2 text-xs text-ink-secondary"
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="note">Note</option>
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitActivity()}
            placeholder="Log an activity or note…"
            className="flex-1 min-w-0 rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={submitActivity}
            className="rounded-md bg-accent px-3 py-1.5 text-white hover:opacity-90"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
