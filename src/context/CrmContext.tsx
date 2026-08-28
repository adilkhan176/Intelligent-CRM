import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoLeads } from "../data/demoData";
import { genId } from "../lib/id";
import { supabase } from "../lib/supabase";
import type { Activity, ActivityType, Lead, ProjectType, Source, Stage } from "../types";

export interface NewLeadInput {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  projectType: ProjectType;
  source: Source;
  assignedTo: string;
  estValue: number;
  stage: Stage;
  proposalCost?: number;
  probability?: number;
  nextFollowUpAt?: string | null;
}

// --- DB row <-> app model mapping (DB is snake_case, app is camelCase) ---

function mapActivity(row: any): Activity {
  return { id: row.id, date: row.date, type: row.type, text: row.text, author: row.author };
}

function mapLead(row: any): Lead {
  return {
    id: row.id,
    company: row.company,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    projectType: row.project_type,
    source: row.source,
    stage: row.stage,
    estValue: Number(row.est_value),
    probability: row.probability,
    proposalCost: Number(row.proposal_cost),
    createdAt: row.created_at,
    lastContactAt: row.last_contact_at,
    nextFollowUpAt: row.next_follow_up_at,
    closeDate: row.close_date,
    assignedTo: row.assigned_to,
    lossReason: row.loss_reason ?? undefined,
    activities: (row.activities ?? [])
      .map(mapActivity)
      .sort((a: Activity, b: Activity) => a.date.localeCompare(b.date)),
  };
}

function leadToRow(lead: Lead) {
  return {
    id: lead.id,
    company: lead.company,
    contact_name: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    project_type: lead.projectType,
    source: lead.source,
    stage: lead.stage,
    est_value: lead.estValue,
    probability: lead.probability,
    proposal_cost: lead.proposalCost,
    created_at: lead.createdAt,
    last_contact_at: lead.lastContactAt,
    next_follow_up_at: lead.nextFollowUpAt,
    close_date: lead.closeDate,
    assigned_to: lead.assignedTo,
    loss_reason: lead.lossReason ?? null,
  };
}

function activityToRow(activity: Activity, leadId: string) {
  return {
    id: activity.id,
    lead_id: leadId,
    date: activity.date,
    type: activity.type,
    text: activity.text,
    author: activity.author,
  };
}

const SELECT_WITH_ACTIVITIES = "*, activities(*)";

async function fetchLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").select(SELECT_WITH_ACTIVITIES).eq("id", id).single();
  if (error || !data) return null;
  return mapLead(data);
}

interface CrmContextValue {
  leads: Lead[];
  loading: boolean;
  setStage: (id: string, stage: Stage, opts?: { lossReason?: string }) => Promise<void>;
  addActivity: (id: string, type: ActivityType, text: string) => Promise<void>;
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  scheduleFollowUp: (id: string, isoDate: string) => Promise<void>;
  addLead: (input: NewLeadInput) => Promise<string>;
  resetDemoData: () => Promise<void>;
}

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("leads")
      .select(SELECT_WITH_ACTIVITIES)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setLeads(data.map(mapLead));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceLead = useCallback((id: string, updated: Lead | null) => {
    if (!updated) return;
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }, []);

  const addActivity = useCallback(
    async (id: string, type: ActivityType, text: string) => {
      const now = new Date().toISOString();
      const activity: Activity = { id: genId(), date: now, type, text, author: "You" };
      await supabase.from("activities").insert(activityToRow(activity, id));
      await supabase.from("leads").update({ last_contact_at: now }).eq("id", id);
      replaceLead(id, await fetchLead(id));
    },
    [replaceLead],
  );

  const setStage = useCallback(
    async (id: string, stage: Stage, opts?: { lossReason?: string }) => {
      const now = new Date().toISOString();
      const stageLabel = stage === "won" ? "WON" : stage === "lost" ? "LOST" : stage.toUpperCase();
      const patch: Record<string, unknown> = { stage };
      if (stage === "won") patch.probability = 100;
      if (stage === "lost") patch.probability = 0;
      if (stage === "won" || stage === "lost") patch.close_date = now;
      if (stage === "lost" && opts?.lossReason) patch.loss_reason = opts.lossReason;

      await supabase.from("leads").update(patch).eq("id", id);
      await supabase.from("activities").insert(
        activityToRow({ id: genId(), date: now, type: "system", text: `Stage changed to ${stageLabel}.`, author: "You" }, id),
      );
      replaceLead(id, await fetchLead(id));
    },
    [replaceLead],
  );

  const updateLead = useCallback(
    async (id: string, patch: Partial<Lead>) => {
      const current = leads.find((l) => l.id === id);
      if (!current) return;
      const row = leadToRow({ ...current, ...patch });
      const { id: _skip, ...columns } = row;
      await supabase.from("leads").update(columns).eq("id", id);
      replaceLead(id, await fetchLead(id));
    },
    [leads, replaceLead],
  );

  const scheduleFollowUp = useCallback(
    async (id: string, isoDate: string) => {
      await supabase.from("leads").update({ next_follow_up_at: isoDate }).eq("id", id);
      replaceLead(id, await fetchLead(id));
    },
    [replaceLead],
  );

  const addLead = useCallback(async (input: NewLeadInput) => {
    const id = genId();
    const now = new Date().toISOString();
    const createdNote =
      input.stage === "opportunity" ? "Lead created — entered directly as an opportunity." : "Lead created.";

    const newLead: Lead = {
      id,
      company: input.company,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      projectType: input.projectType,
      source: input.source,
      stage: input.stage,
      estValue: input.estValue,
      probability: input.probability ?? (input.stage === "opportunity" ? 50 : 20),
      proposalCost: input.proposalCost ?? Math.round(input.estValue * 0.4),
      createdAt: now,
      lastContactAt: now,
      nextFollowUpAt: input.nextFollowUpAt ?? null,
      closeDate: null,
      assignedTo: input.assignedTo,
      activities: [],
    };

    await supabase.from("leads").insert(leadToRow(newLead));
    await supabase.from("activities").insert(
      activityToRow({ id: genId(), date: now, type: "system", text: createdNote, author: "You" }, id),
    );
    const fetched = await fetchLead(id);
    if (fetched) setLeads((prev) => [fetched, ...prev]);
    return id;
  }, []);

  const resetDemoData = useCallback(async () => {
    setLoading(true);
    await supabase.from("leads").delete().not("id", "is", null);
    await supabase.from("leads").insert(demoLeads.map(leadToRow));
    const activityRows = demoLeads.flatMap((l) => l.activities.map((a) => activityToRow(a, l.id)));
    await supabase.from("activities").insert(activityRows);
    const { data } = await supabase
      .from("leads")
      .select(SELECT_WITH_ACTIVITIES)
      .order("created_at", { ascending: false });
    setLeads((data ?? []).map(mapLead));
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ leads, loading, setStage, addActivity, updateLead, scheduleFollowUp, addLead, resetDemoData }),
    [leads, loading, setStage, addActivity, updateLead, scheduleFollowUp, addLead, resetDemoData],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used within CrmProvider");
  return ctx;
}
