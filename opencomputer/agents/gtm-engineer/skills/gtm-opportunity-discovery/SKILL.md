---
name: gtm-opportunity-discovery
description: Run the dry-run social opportunity workflow for the seeded agent-harness campaign, including scheduled discovery, ranked shortlists, human selection, and response drafting.
---

# GTM opportunity discovery

This workflow is read-only. It discovers public opportunities and drafts possible responses. It never publishes.

## Scheduled tick

1. Accept only `workflow: discover_social_opportunities` and `campaign_id: agent-harness-demo`.
2. Search with Exa using the campaign topics and a 24-hour lookback.
3. Prefer original, attributable posts or discussions over profiles, homepages, aggregations, and reposts.
4. Deduplicate by canonical URL and rank no more than ten candidates.
5. State which provider ran, the effective lookback, and whether it returned no usable candidates.
6. Present the shortlist and stop for a human decision.

## Selection and drafting

An approval such as `approve 1, 3` selects candidates from the latest shortlist for drafting. It is not publication approval.

For each selected candidate:

- retain its canonical source URL;
- draft a concise response grounded in the returned evidence;
- avoid generic praise and unsupported claims;
- ask a useful question or contribute a concrete observation when appropriate;
- label the output as a dry-run draft.

No tool in this deployment can publish, reply, message, or enroll a lead. Never claim otherwise.
