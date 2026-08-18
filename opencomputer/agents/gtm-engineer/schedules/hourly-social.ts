import { defineSchedule } from "@opencomputer/agent";

export default defineSchedule({
  id: "hourly-social",
  cron: "0 * * * *",
  timezone: "America/Los_Angeles",
  enabled: ["production"],
  overlap: "skip",
  dispatch: {
    text: "Run the social opportunity discovery tick for agent-harness-demo.",
    payload: {
      workflow: "discover_social_opportunities",
      campaign_id: "agent-harness-demo",
      providers: ["exa"],
      lookback_hours: 24,
      limit: 10,
      dry_run: true,
    },
  },
});
