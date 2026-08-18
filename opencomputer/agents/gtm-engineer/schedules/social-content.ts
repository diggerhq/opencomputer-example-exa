import { defineSchedule } from "@opencomputer/agent";

export default defineSchedule({
  id: "social-content",
  cron: "0 */3 * * *",
  timezone: "America/Los_Angeles",
  enabled: ["production"],
  overlap: "skip",
  dispatch: {
    text: "Research timely social-content concepts for agent-harness-demo.",
    payload: {
      workflow: "create_social_content",
      campaign_id: "agent-harness-demo",
      destinations: ["x", "linkedin"],
      concept_limit: 5,
      dry_run: true,
    },
  },
});
