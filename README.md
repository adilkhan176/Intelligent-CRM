# Intelligent CRM

A CRM for a web design studio's sales pipeline — take inbound leads from
first contact through follow-up, proposal, and a closed deal, then hand the
won project off to execution. Ships with realistic demo data so the whole
pipeline is visible immediately.

## Pages

- **Dashboard** — pipeline snapshot, overdue follow-ups, recent activity.
- **Initial Contact** — new leads awaiting first outreach, and leads you've just reached.
- **Follow-Up** — leads in active nurture, with overdue/upcoming tracking.
- **Opportunities** — scoped proposals: estimated value vs. delivery cost, margin, win probability.
- **Finalize Deal** — close opportunities as Won (→ execution) or Lost, with deal history.
- **Analytics** — pipeline funnel, revenue trend, lead sources, win/loss by month.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Recharts. No
backend — pipeline state lives in memory and localStorage, seeded from
deterministic demo data. Use **Reset demo data** in the sidebar to start over.

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
