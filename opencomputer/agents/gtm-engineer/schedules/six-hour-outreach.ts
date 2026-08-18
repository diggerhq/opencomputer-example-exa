import { defineSchedule } from "@opencomputer/agent";

export default defineSchedule({
  id: "six-hour-outreach",
  cron: "30 */6 * * *",
  timezone: "America/Los_Angeles",
  enabled: ["production"],
  overlap: "skip",
  dispatch: {
    text: "Build the next public-evidence outreach shortlist for agent-harness-demo.",
    payload: {
      workflow: "build_outreach_list",
      campaign_id: "agent-harness-demo",
      candidate_limit: 10,
      dry_run: true,
    },
  },
});
