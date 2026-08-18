import { defineSchedule } from "@opencomputer/agent";

export default defineSchedule({
  id: "three-day-strategy",
  cron: "0 10 */3 * *",
  timezone: "America/Los_Angeles",
  enabled: ["production"],
  overlap: "skip",
  dispatch: {
    text: "Review the supplied GTM metrics for agent-harness-demo and recommend the next changes.",
    payload: {
      workflow: "strategy_review",
      campaign_id: "agent-harness-demo",
      metrics: {},
      dry_run: true,
    },
  },
});
