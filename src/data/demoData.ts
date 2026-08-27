import type { Activity, ActivityType, Lead, ProjectType, Source, Stage } from "../types";

// Deterministic PRNG so demo data is stable across reloads.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260827);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const TODAY = new Date("2026-08-27T09:00:00");
const iso = (d: Date) => d.toISOString();
const daysFrom = (days: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d;
};

const companyBases = [
  "Northfield", "Cedar & Vine", "BrightPath", "Lumen", "Anchor Point", "Solstice",
  "Kindred", "Foundry", "Bluewater", "Sable", "Ironclad", "Meridian", "Everline",
  "Harbor Row", "Glasswing", "Pinehurst", "Redstone", "Wayfarer", "Nimbus",
  "Vantage", "Copperfield", "Thistle & Co", "Halcyon", "Driftwood", "Cascade",
  "Beacon Hill", "Argon", "Fernwood", "Steady State", "Marigold",
];
const companySuffixes = [
  "Studio", "Collective", "Labs", "Group", "Co.", "Interiors", "Outfitters",
  "Wellness", "Foods", "Analytics", "Realty", "Apparel", "Consulting", "Fitness",
];

const firstNames = [
  "Ava", "Liam", "Maya", "Noah", "Priya", "Ethan", "Sofia", "Marcus", "Elena",
  "Jamal", "Grace", "Diego", "Nora", "Kenji", "Zara", "Owen", "Ines", "Theo",
  "Layla", "Sam", "Rosa", "Felix", "Amara", "Hugo",
];
const lastNames = [
  "Bennett", "Cho", "Farrow", "Okafor", "Lindgren", "Marsh", "Delgado", "Petrov",
  "Nakamura", "Bishop", "Rourke", "Alvi", "Sundberg", "Castillo", "Whitfield",
  "Osei", "Larkin", "Duarte", "Voss", "Amaro",
];

const projectTypes: ProjectType[] = [
  "Web App Design", "Website Redesign", "E-commerce Site", "Marketing Site",
  "Product/SaaS UI", "Branding + Web",
];
const sources: Source[] = [
  "Referral", "Website Inquiry", "LinkedIn", "Cold Outreach", "Google Ads",
  "Dribbble/Portfolio",
];
const team = ["Jordan Reyes", "Priya Anand", "Sam Whitaker", "Casey Nguyen"];

const lossReasons = [
  "Went with a lower-cost competitor",
  "Project put on hold internally",
  "Budget was cut before kickoff",
  "Chose to build in-house",
  "Timeline no longer fit their launch date",
];

function makeCompany() {
  return `${pick(companyBases)} ${pick(companySuffixes)}`;
}

function makeActivity(type: ActivityType, text: string, date: Date): Activity {
  return {
    id: crypto.randomUUID(),
    date: iso(date),
    type,
    text,
    author: pick(team),
  };
}

interface Seed {
  stage: Stage;
  createdAgo: number; // days before today
  lastContactAgo: number;
  nextFollowUpIn: number | null; // days from today, negative = overdue
  closeAgo?: number; // for won/lost, days before today
  value: [number, number];
  probability?: number;
}

const seeds: Seed[] = [
  // New leads — just came in, no contact yet
  { stage: "new", createdAgo: 0, lastContactAgo: 0, nextFollowUpIn: null, value: [8000, 22000] },
  { stage: "new", createdAgo: 1, lastContactAgo: 1, nextFollowUpIn: null, value: [6000, 15000] },
  { stage: "new", createdAgo: 1, lastContactAgo: 1, nextFollowUpIn: null, value: [12000, 30000] },
  { stage: "new", createdAgo: 2, lastContactAgo: 2, nextFollowUpIn: null, value: [5000, 12000] },
  { stage: "new", createdAgo: 3, lastContactAgo: 3, nextFollowUpIn: null, value: [15000, 40000] },
  { stage: "new", createdAgo: 4, lastContactAgo: 4, nextFollowUpIn: null, value: [7000, 18000] },

  // Initial contact made
  { stage: "contacted", createdAgo: 6, lastContactAgo: 1, nextFollowUpIn: 2, value: [9000, 20000] },
  { stage: "contacted", createdAgo: 8, lastContactAgo: 2, nextFollowUpIn: 3, value: [11000, 26000] },
  { stage: "contacted", createdAgo: 9, lastContactAgo: 0, nextFollowUpIn: 4, value: [6000, 14000] },
  { stage: "contacted", createdAgo: 10, lastContactAgo: 3, nextFollowUpIn: -1, value: [14000, 32000] },
  { stage: "contacted", createdAgo: 12, lastContactAgo: 4, nextFollowUpIn: 1, value: [8000, 19000] },
  { stage: "contacted", createdAgo: 13, lastContactAgo: 2, nextFollowUpIn: 5, value: [20000, 45000] },

  // Follow-up in progress
  { stage: "followup", createdAgo: 18, lastContactAgo: 5, nextFollowUpIn: -3, value: [10000, 24000] },
  { stage: "followup", createdAgo: 20, lastContactAgo: 6, nextFollowUpIn: -1, value: [16000, 38000] },
  { stage: "followup", createdAgo: 22, lastContactAgo: 3, nextFollowUpIn: 2, value: [9000, 21000] },
  { stage: "followup", createdAgo: 25, lastContactAgo: 7, nextFollowUpIn: -5, value: [22000, 50000] },
  { stage: "followup", createdAgo: 27, lastContactAgo: 4, nextFollowUpIn: 1, value: [7000, 16000] },
  { stage: "followup", createdAgo: 30, lastContactAgo: 8, nextFollowUpIn: 6, value: [13000, 29000] },

  // Opportunity — scoped, priced, in proposal
  { stage: "opportunity", createdAgo: 35, lastContactAgo: 4, nextFollowUpIn: 3, value: [25000, 60000], probability: 40 },
  { stage: "opportunity", createdAgo: 38, lastContactAgo: 6, nextFollowUpIn: -2, value: [18000, 42000], probability: 55 },
  { stage: "opportunity", createdAgo: 40, lastContactAgo: 2, nextFollowUpIn: 5, value: [30000, 70000], probability: 65 },
  { stage: "opportunity", createdAgo: 44, lastContactAgo: 9, nextFollowUpIn: -4, value: [15000, 34000], probability: 30 },
  { stage: "opportunity", createdAgo: 48, lastContactAgo: 3, nextFollowUpIn: 4, value: [40000, 90000], probability: 70 },
  { stage: "opportunity", createdAgo: 50, lastContactAgo: 5, nextFollowUpIn: 1, value: [20000, 48000], probability: 50 },

  // Won — closed deals across the last several months, for revenue trend
  { stage: "won", createdAgo: 205, lastContactAgo: 175, nextFollowUpIn: null, closeAgo: 175, value: [22000, 55000] },
  { stage: "won", createdAgo: 190, lastContactAgo: 150, nextFollowUpIn: null, closeAgo: 150, value: [15000, 32000] },
  { stage: "won", createdAgo: 160, lastContactAgo: 120, nextFollowUpIn: null, closeAgo: 120, value: [30000, 65000] },
  { stage: "won", createdAgo: 130, lastContactAgo: 95, nextFollowUpIn: null, closeAgo: 95, value: [18000, 40000] },
  { stage: "won", createdAgo: 110, lastContactAgo: 70, nextFollowUpIn: null, closeAgo: 70, value: [45000, 95000] },
  { stage: "won", createdAgo: 85, lastContactAgo: 50, nextFollowUpIn: null, closeAgo: 50, value: [20000, 44000] },
  { stage: "won", createdAgo: 60, lastContactAgo: 28, nextFollowUpIn: null, closeAgo: 28, value: [26000, 58000] },
  { stage: "won", createdAgo: 45, lastContactAgo: 15, nextFollowUpIn: null, closeAgo: 15, value: [16000, 36000] },
  { stage: "won", createdAgo: 33, lastContactAgo: 7, nextFollowUpIn: null, closeAgo: 7, value: [35000, 75000] },
  { stage: "won", createdAgo: 20, lastContactAgo: 2, nextFollowUpIn: null, closeAgo: 2, value: [12000, 28000] },

  // Lost — closed out
  { stage: "lost", createdAgo: 150, lastContactAgo: 110, nextFollowUpIn: null, closeAgo: 110, value: [12000, 28000] },
  { stage: "lost", createdAgo: 120, lastContactAgo: 90, nextFollowUpIn: null, closeAgo: 90, value: [20000, 45000] },
  { stage: "lost", createdAgo: 95, lastContactAgo: 60, nextFollowUpIn: null, closeAgo: 60, value: [15000, 33000] },
  { stage: "lost", createdAgo: 70, lastContactAgo: 40, nextFollowUpIn: null, closeAgo: 40, value: [25000, 55000] },
  { stage: "lost", createdAgo: 42, lastContactAgo: 18, nextFollowUpIn: null, closeAgo: 18, value: [10000, 22000] },
  { stage: "lost", createdAgo: 25, lastContactAgo: 10, nextFollowUpIn: null, closeAgo: 10, value: [18000, 40000] },
];

const activityTextsByStage: Record<Stage, string[]> = {
  new: ["Lead captured from inbound form.", "Added to CRM, pending first outreach."],
  contacted: [
    "Sent introductory email with portfolio.",
    "Had a quick discovery call — outlined project goals.",
    "Left a voicemail, will try again.",
    "Connected on LinkedIn and exchanged messages.",
  ],
  followup: [
    "Checked in on timeline and budget range.",
    "Sent case studies relevant to their industry.",
    "Scheduled a follow-up call for next week.",
    "No response yet, sending a nudge.",
  ],
  opportunity: [
    "Delivered scoped proposal and cost estimate.",
    "Walked through sitemap and wireframes on a call.",
    "Negotiating scope to fit budget.",
    "Sent updated quote after revisions.",
  ],
  won: [
    "Contract signed — kicking off discovery phase.",
    "Deposit invoice sent.",
    "Handed off to execution team.",
  ],
  lost: ["Marked closed-lost.", "Sent a note to keep the door open for later."],
};

function buildLead(seed: Seed, index: number): Lead {
  const company = makeCompany();
  const first = pick(firstNames);
  const last = pick(lastNames);
  const domain = company.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
  const value = int(seed.value[0], seed.value[1]);
  const createdAt = daysFrom(-seed.createdAgo);
  const lastContactAt = daysFrom(-seed.lastContactAgo);
  const nextFollowUpAt = seed.nextFollowUpIn === null ? null : iso(daysFrom(seed.nextFollowUpIn));
  const closeDate = seed.closeAgo !== undefined ? iso(daysFrom(-seed.closeAgo)) : null;

  const activities: Activity[] = [
    makeActivity("system", "Lead created.", createdAt),
  ];
  const texts = activityTextsByStage[seed.stage];
  const activityCount = seed.stage === "new" ? 0 : int(1, Math.min(3, texts.length));
  for (let i = 0; i < activityCount; i++) {
    const type: ActivityType = i === activityCount - 1 ? "call" : pick(["call", "email", "meeting", "note"]);
    const daysAgo = Math.round(seed.lastContactAgo + i * 2);
    activities.push(makeActivity(type, texts[i % texts.length], daysFrom(-daysAgo)));
  }
  if (seed.stage === "won") {
    activities.push(makeActivity("system", "Deal marked WON — moved to execution.", closeDate ? new Date(closeDate) : lastContactAt));
  }
  if (seed.stage === "lost") {
    activities.push(makeActivity("system", "Deal marked LOST.", closeDate ? new Date(closeDate) : lastContactAt));
  }

  const proposalCost = Math.round(value * (0.35 + rand() * 0.25));

  return {
    id: `lead-${index + 1}`,
    company,
    contactName: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
    phone: `(${int(200, 989)}) ${int(200, 989)}-${String(int(0, 9999)).padStart(4, "0")}`,
    projectType: pick(projectTypes),
    source: pick(sources),
    stage: seed.stage,
    estValue: value,
    probability: seed.probability ?? (seed.stage === "won" ? 100 : seed.stage === "lost" ? 0 : 20),
    proposalCost,
    createdAt: iso(createdAt),
    lastContactAt: iso(lastContactAt),
    nextFollowUpAt,
    closeDate,
    assignedTo: pick(team),
    lossReason: seed.stage === "lost" ? pick(lossReasons) : undefined,
    activities,
  };
}

export const demoLeads: Lead[] = seeds.map(buildLead);

export const TODAY_ISO = iso(TODAY);
