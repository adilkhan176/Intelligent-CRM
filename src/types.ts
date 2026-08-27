export type Stage =
  | "new"
  | "contacted"
  | "followup"
  | "opportunity"
  | "won"
  | "lost";

export const STAGES: { id: Stage; label: string }[] = [
  { id: "new", label: "New Lead" },
  { id: "contacted", label: "Initial Contact" },
  { id: "followup", label: "Follow-Up" },
  { id: "opportunity", label: "Opportunity" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export type ProjectType =
  | "Web App Design"
  | "Website Redesign"
  | "E-commerce Site"
  | "Marketing Site"
  | "Product/SaaS UI"
  | "Branding + Web";

export type Source =
  | "Referral"
  | "Website Inquiry"
  | "LinkedIn"
  | "Cold Outreach"
  | "Google Ads"
  | "Dribbble/Portfolio";

export type ActivityType = "call" | "email" | "meeting" | "note" | "system";

export interface Activity {
  id: string;
  date: string; // ISO date
  type: ActivityType;
  text: string;
  author: string;
}

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  projectType: ProjectType;
  source: Source;
  stage: Stage;
  estValue: number;
  probability: number; // 0-100, meaningful once in "opportunity"
  proposalCost: number; // internal estimated cost to deliver
  createdAt: string;
  lastContactAt: string;
  nextFollowUpAt: string | null;
  closeDate: string | null;
  assignedTo: string;
  lossReason?: string;
  activities: Activity[];
}
