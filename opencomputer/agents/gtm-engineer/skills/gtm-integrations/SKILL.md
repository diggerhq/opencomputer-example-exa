---
name: gtm-integrations
description: Safely combine optional Composio connected accounts and bounded Apify harvests with the GTM workflows, including provider availability, read/write boundaries, and explicit opt-in configuration.
---

# GTM integrations

The default workflow uses Exa. Optional providers run only when their required
identifier is present in trusted structured input or an explicit user-authored
manual request.

## Composio

`composio_user_id` selects one stable connected-account identity.

1. Call `composio_connected_accounts` before relying on a toolkit.
2. Call `composio_search_tools` for the exact current read operation.
3. Inspect its structured input schema.
4. Call `composio_read` with explicit arguments.
5. Report missing, expired, or ambiguous accounts and continue with remaining
   providers.

`composio_read` permits only read-like operations from Notion, GitHub, and
Google Search Console. Do not try to route a write through it.

The only connected-account write is `composio_create_notion_draft`. Use it only
when all of the following are true:

- the current input source is `user`;
- the user separately says `create approved Notion draft`;
- the exact draft was shown earlier in this session;
- the implementation-pinned Composio operation creates only a new Notion page;
- the arguments preserve the approved text without silent additions.

The caller does not choose the write slug. The tool pins
`NOTION_CREATE_NOTION_PAGE` and resolves only its latest version.

Return the created page identifier or URL. Creating a Notion draft is not
publication approval.

## Apify

Never search for or invent an Actor task. `apify_task_id` must come from trusted
campaign configuration and should point to a preconfigured, reviewed task.

- `apify_run_task` caps both paid items and total charge.
- Call it once per intended harvest.
- Use `apify_run_results` to check the returned run ID.
- A pending run is not a failure and must not be started again.
- Cite canonical source URLs from returned items and deduplicate them against
  other providers.

Always state which providers ran and what each returned. Empty and unavailable
providers must be visible rather than silently omitted.
