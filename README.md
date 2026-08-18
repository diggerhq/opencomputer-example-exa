# OpenComputer GTM Engineer

An agent-only GTM demo built with OpenComputer and Exa. It runs in the
OpenComputer debug playground and through code-defined schedules; there is no
separate frontend.

The agent covers social opportunity discovery, social-content ideation,
blog-topic research, public-evidence outreach prospecting, and strategy review
for one seeded campaign. It is intentionally read-only: no publishing,
messaging, CRM, enrollment, or analytics-writing tools are connected.

## Prerequisites

- Node.js 22 or newer
- An OpenComputer account
- An Exa API key

## Install and configure

```bash
npm install
npm run opencomputer -- login
npm run opencomputer -- secrets set EXA_API_KEY
```

The Exa key is stored as a managed, write-only OpenComputer secret and is only
injected into requests sent to `https://api.exa.ai`.

## Test in the debug playground

```bash
npm run dev
```

Open the debug playground printed by the CLI. Start a manual session with:

```text
Run the social opportunity discovery tick for agent-harness-demo.
```

Then test the drafting boundary with:

```text
approve 1, 3
```

Development shows all five deployed schedules. They are manual-only there, so
use **Run now** to test their exact payloads without waiting for a cron tick.

## Schedules

The canonical definitions live beside the agent under `schedules/`:

| Schedule | Cadence | Workflow |
| --- | --- | --- |
| `hourly-social` | Hourly | Social opportunity discovery |
| `social-content` | Every 3 hours | Social-content research |
| `weekly-blog` | Mondays at 09:00 | Blog-topic research |
| `six-hour-outreach` | Every 6 hours at :30 | Outreach research |
| `three-day-strategy` | At 10:00 on every third calendar day | Strategy review |

All times use `America/Los_Angeles`, all schedules skip overlapping runs, and
automatic recurrence is enabled only in Production. Each firing starts a fresh
durable session with `source: "schedule"` and the committed structured payload.

The strategy schedule intentionally supplies an empty metrics object. Until a
metrics integration exists, the agent returns a missing-data checklist instead
of inventing results.

## Build and deploy

```bash
npm run build
npm run opencomputer -- secrets set EXA_API_KEY --environment production
npm run deploy
```

The deployment syncs the agent and all schedule definitions. Production begins
recurring runs immediately according to each next cron occurrence.

## Project structure

```text
opencomputer/
  project.ts
  agents/gtm-engineer/
    agent.ts
    tools/exa.ts
    schedules/
      hourly-social.ts
      social-content.ts
      weekly-blog.ts
      six-hour-outreach.ts
      three-day-strategy.ts
    skills/
      exa-search/SKILL.md
      gtm-opportunity-discovery/SKILL.md
      gtm-content/SKILL.md
      gtm-outreach/SKILL.md
      gtm-strategy/SKILL.md
```

## Current limits

- No durable GTM memory or cross-session deduplication yet
- No automated reminder for unresolved selections
- Exa public-web results only; no native social-network ingestion
- One seeded campaign
- No publishing, verified-email, CRM, inbox, or metrics integrations

These are deliberate boundaries for the first vertical slice.
