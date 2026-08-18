import { defineSchedule } from "@opencomputer/agent";

export default defineSchedule({
  id: "weekly-blog",
  cron: "0 9 * * 1",
  timezone: "America/Los_Angeles",
  enabled: ["production"],
  overlap: "skip",
  dispatch: {
    text: "Research this week's evidence-backed blog opportunities for agent-harness-demo.",
    payload: {
      workflow: "research_blog_topics",
      campaign_id: "agent-harness-demo",
      topic_limit: 5,
      dry_run: true,
    },
  },
});
