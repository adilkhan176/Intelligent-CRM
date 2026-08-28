import { useState } from "react";
import { Modal } from "./Modal";
import { useCrm } from "../context/CrmContext";
import { PROJECT_TYPES, SOURCES, TEAM_MEMBERS, type ProjectType, type Source } from "../types";

const inputClass =
  "w-full rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30";
const labelClass = "block text-xs font-medium text-ink-secondary mb-1";

export function LeadFormModal({
  mode,
  onClose,
  onCreated,
}: {
  mode: "contact" | "opportunity";
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { addLead } = useCrm();

  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>(PROJECT_TYPES[0]);
  const [source, setSource] = useState<Source>(SOURCES[0]);
  const [assignedTo, setAssignedTo] = useState(TEAM_MEMBERS[0]);
  const [estValue, setEstValue] = useState("");
  const [proposalCost, setProposalCost] = useState("");
  const [probability, setProbability] = useState("50");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [touched, setTouched] = useState(false);

  const valueNum = Number(estValue);
  const costNum = Number(proposalCost);
  const isValid =
    company.trim() !== "" &&
    contactName.trim() !== "" &&
    /\S+@\S+\.\S+/.test(email) &&
    valueNum > 0 &&
    (mode === "contact" || (proposalCost === "" || costNum >= 0));

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setTouched(true);
    if (!isValid || submitting) return;
    setSubmitting(true);
    const id = await addLead({
      company: company.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      projectType,
      source,
      assignedTo,
      estValue: valueNum,
      stage: mode === "opportunity" ? "opportunity" : "new",
      proposalCost: mode === "opportunity" && proposalCost !== "" ? costNum : undefined,
      probability: mode === "opportunity" ? Number(probability) : undefined,
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt).toISOString() : null,
    });
    setSubmitting(false);
    onCreated?.(id);
    onClose();
  };

  return (
    <Modal title={mode === "opportunity" ? "New Opportunity" : "New Contact"} onClose={onClose} width={480}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Company *</label>
            <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Studio" />
            {touched && company.trim() === "" && <p className="text-xs mt-1" style={{ color: "var(--status-critical)" }}>Required</p>}
          </div>
          <div>
            <label className={labelClass}>Contact Name *</label>
            <input className={inputClass} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Doe" />
            {touched && contactName.trim() === "" && <p className="text-xs mt-1" style={{ color: "var(--status-critical)" }}>Required</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Email *</label>
            <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@acme.com" />
            {touched && !/\S+@\S+\.\S+/.test(email) && <p className="text-xs mt-1" style={{ color: "var(--status-critical)" }}>Valid email required</p>}
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Project Type</label>
            <select className={inputClass} value={projectType} onChange={(e) => setProjectType(e.target.value as ProjectType)}>
              {PROJECT_TYPES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Source</label>
            <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value as Source)}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Estimated Value ($) *</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={estValue}
              onChange={(e) => setEstValue(e.target.value)}
              placeholder="15000"
            />
            {touched && !(valueNum > 0) && <p className="text-xs mt-1" style={{ color: "var(--status-critical)" }}>Enter a value greater than 0</p>}
          </div>
          <div>
            <label className={labelClass}>Owner</label>
            <select className={inputClass} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {mode === "opportunity" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Delivery Cost ($)</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={proposalCost}
                onChange={(e) => setProposalCost(e.target.value)}
                placeholder={estValue ? String(Math.round(valueNum * 0.4)) : "6000"}
              />
            </div>
            <div>
              <label className={labelClass}>Win Probability (%)</label>
              <input
                className={inputClass}
                type="number"
                min="5"
                max="95"
                step="5"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Next Follow-Up (optional)</label>
          <input
            className={inputClass}
            type="date"
            value={nextFollowUpAt}
            onChange={(e) => setNextFollowUpAt(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm font-medium text-ink-secondary hover:bg-surface-3"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : mode === "opportunity" ? "Create Opportunity" : "Add Contact"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
