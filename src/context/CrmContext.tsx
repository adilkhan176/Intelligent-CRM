import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { demoLeads } from "../data/demoData";
import type { Activity, ActivityType, Lead, Stage } from "../types";

const STORAGE_KEY = "intelligent-crm-leads-v1";

function loadInitial(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Lead[];
  } catch {
    // fall through to demo data
  }
  return demoLeads;
}

function saveToStorage(leads: Lead[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // ignore quota errors in demo
  }
}

interface CrmContextValue {
  leads: Lead[];
  setStage: (id: string, stage: Stage, opts?: { lossReason?: string }) => void;
  addActivity: (id: string, type: ActivityType, text: string) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  scheduleFollowUp: (id: string, isoDate: string) => void;
  resetDemoData: () => void;
}

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(loadInitial);

  // Functional updates so rapid, chained calls (e.g. addActivity then
  // setStage in the same handler) each build on the other's result
  // instead of racing against a stale closure of `leads`.
  const apply = useCallback((updater: (prev: Lead[]) => Lead[]) => {
    setLeads((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }, []);

  const addActivity = useCallback(
    (id: string, type: ActivityType, text: string) => {
      const activity: Activity = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type,
        text,
        author: "You",
      };
      apply((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, activities: [...l.activities, activity], lastContactAt: activity.date }
            : l,
        ),
      );
    },
    [apply],
  );

  const setStage = useCallback(
    (id: string, stage: Stage, opts?: { lossReason?: string }) => {
      const now = new Date().toISOString();
      apply((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const stageLabel =
            stage === "won" ? "WON" : stage === "lost" ? "LOST" : stage.toUpperCase();
          const systemActivity: Activity = {
            id: crypto.randomUUID(),
            date: now,
            type: "system",
            text: `Stage changed to ${stageLabel}.`,
            author: "You",
          };
          return {
            ...l,
            stage,
            probability: stage === "won" ? 100 : stage === "lost" ? 0 : l.probability,
            closeDate: stage === "won" || stage === "lost" ? now : l.closeDate,
            lossReason: stage === "lost" ? opts?.lossReason ?? l.lossReason : l.lossReason,
            activities: [...l.activities, systemActivity],
          };
        }),
      );
    },
    [apply],
  );

  const updateLead = useCallback(
    (id: string, patch: Partial<Lead>) => {
      apply((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    },
    [apply],
  );

  const scheduleFollowUp = useCallback(
    (id: string, isoDate: string) => {
      apply((prev) => prev.map((l) => (l.id === id ? { ...l, nextFollowUpAt: isoDate } : l)));
    },
    [apply],
  );

  const resetDemoData = useCallback(() => {
    apply(() => demoLeads);
  }, [apply]);

  const value = useMemo(
    () => ({ leads, setStage, addActivity, updateLead, scheduleFollowUp, resetDemoData }),
    [leads, setStage, addActivity, updateLead, scheduleFollowUp, resetDemoData],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used within CrmProvider");
  return ctx;
}
