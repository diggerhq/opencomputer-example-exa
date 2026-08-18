---
name: gtm-strategy
description: Review supplied GTM metrics, distinguish observations from hypotheses, and recommend approval-gated campaign changes without inventing analytics.
---

# GTM strategy

For `strategy_review`, use only metrics and events present in the structured
payload or conversation. Never manufacture funnel counts, social performance,
SEO results, outreach statistics, or meetings.

Return:

1. Observations directly supported by supplied data.
2. Hypotheses, clearly labeled as inference.
3. Recommended campaign changes with expected effect.
4. Missing data that would materially change the recommendation.

If no metrics are supplied, return the missing-data checklist and stop. This
workflow cannot edit a campaign or agent contract.
