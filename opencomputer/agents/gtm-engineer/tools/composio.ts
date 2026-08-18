import {
  defineConnection,
  defineTool,
  secretHeader,
  useSecret,
} from "@opencomputer/agent";
import type { DataValue } from "@opencomputer/agent";

const connectedToolkits = ["notion", "github", "google_search_console"] as const;
type ConnectedToolkit = (typeof connectedToolkits)[number];

const readAction = /_(GET|LIST|SEARCH|QUERY|FETCH|RETRIEVE|FIND|READ)_/;
const allowedPrefix = /^(NOTION|GITHUB|GOOGLE_SEARCH_CONSOLE|GOOGLESEARCHCONSOLE)_/;
const notionCreatePageSlug = "NOTION_CREATE_NOTION_PAGE";

export const composio = defineConnection({
  id: "composio-api",
  origin: "https://backend.composio.dev",
  methods: ["GET", "POST"],
  pathPrefix: "/api/v3.1/",
  headers: {
    "x-api-key": secretHeader(useSecret("COMPOSIO_API_KEY")),
  },
});

async function json(response: Response): Promise<Record<string, DataValue>> {
  const payload = (await response.json().catch(() => ({
    error: "The integration returned a non-JSON response",
  }))) as Record<string, DataValue>;
  return response.ok
    ? { ok: true, status: response.status, ...payload }
    : { ok: false, status: response.status, error: payload };
}

function toolkit(value: unknown): ConnectedToolkit {
  if (!connectedToolkits.includes(value as ConnectedToolkit)) {
    throw new Error(`toolkit must be one of: ${connectedToolkits.join(", ")}`);
  }
  return value as ConnectedToolkit;
}

function userId(value: unknown): string {
  const result = String(value ?? "").trim();
  if (!/^[A-Za-z0-9._:@-]{1,128}$/.test(result)) {
    throw new Error("user_id must be a stable 1-128 character identifier");
  }
  return result;
}

function toolSlug(value: unknown): string {
  const result = String(value ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_]{3,160}$/.test(result)) {
    throw new Error("tool_slug must be a Composio tool slug");
  }
  return result;
}

function argumentsObject(value: unknown): Record<string, DataValue> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("arguments must be a JSON object");
  }
  return value as Record<string, DataValue>;
}

async function latestToolVersion(slug: string, signal?: AbortSignal) {
  const query = new URLSearchParams({
    tool_slugs: slug,
    toolkit_versions: "latest",
  });
  const response = await composio.fetch(`/api/v3.1/tools?${query}`, { signal });
  const payload = (await response.json()) as {
    items?: Array<{ version?: string }>;
  };
  if (!response.ok) {
    throw new Error(`Composio tool lookup failed with ${response.status}`);
  }
  const version = payload.items?.[0]?.version;
  if (!version) throw new Error(`Composio tool ${slug} was not found`);
  return version;
}

async function execute(
  slug: string,
  arguments_: Record<string, DataValue>,
  connectedUserId: string,
  signal?: AbortSignal,
) {
  const version = await latestToolVersion(slug, signal);
  return json(await composio.fetch(
    `/api/v3.1/tools/execute/${encodeURIComponent(slug)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        user_id: connectedUserId,
        version,
        arguments: arguments_,
      }),
      signal,
    },
  ));
}

export const composioConnectedAccounts = defineTool({
  name: "composio_connected_accounts",
  description:
    "List active Composio connected accounts for the GTM demo identity. Use this to check which optional SaaS providers are available before calling them.",
  input: {
    type: "object",
    properties: {
      user_id: { type: "string", minLength: 1, maxLength: 128 },
      toolkit: { type: "string", enum: connectedToolkits },
    },
    required: ["user_id"],
    additionalProperties: false,
  },
  async run({ input, signal }): Promise<DataValue> {
    const query = new URLSearchParams({
      user_ids: userId(input.user_id),
      statuses: "ACTIVE",
      limit: "50",
    });
    if (input.toolkit !== undefined) {
      query.set("toolkit_slugs", toolkit(input.toolkit));
    }
    return json(await composio.fetch(
      `/api/v3.1/connected_accounts?${query}`,
      { signal },
    ));
  },
});

export const composioSearchTools = defineTool({
  name: "composio_search_tools",
  description:
    "Find current Composio tool slugs and schemas for the allowlisted Notion, GitHub, or Google Search Console toolkit. This is read-only.",
  input: {
    type: "object",
    properties: {
      toolkit: { type: "string", enum: connectedToolkits },
      query: { type: "string", minLength: 1, maxLength: 160 },
    },
    required: ["toolkit", "query"],
    additionalProperties: false,
  },
  async run({ input, signal }): Promise<DataValue> {
    const query = new URLSearchParams({
      toolkit_slug: toolkit(input.toolkit),
      query: String(input.query),
      toolkit_versions: "latest",
    });
    return json(await composio.fetch(`/api/v3.1/tools?${query}`, { signal }));
  },
});

export const composioRead = defineTool({
  name: "composio_read",
  description:
    "Execute a structured read-only Composio tool for Notion, GitHub, or Google Search Console after discovering its current slug and schema.",
  input: {
    type: "object",
    properties: {
      user_id: { type: "string", minLength: 1, maxLength: 128 },
      tool_slug: { type: "string", minLength: 3, maxLength: 160 },
      arguments: { type: "object", additionalProperties: true },
    },
    required: ["user_id", "tool_slug", "arguments"],
    additionalProperties: false,
  },
  async run({ input, signal }): Promise<DataValue> {
    const slug = toolSlug(input.tool_slug);
    if (!allowedPrefix.test(slug) || !readAction.test(slug)) {
      throw new Error(
        "composio_read permits only explicit GET/LIST/SEARCH/QUERY/FETCH/RETRIEVE/FIND/READ tools from Notion, GitHub, or Google Search Console",
      );
    }
    return execute(
      slug,
      argumentsObject(input.arguments),
      userId(input.user_id),
      signal,
    );
  },
});

export const composioCreateNotionDraft = defineTool({
  name: "composio_create_notion_draft",
  description:
    "Create an explicitly approved Notion page draft through Composio. This is the only connected-account write available in the demo and must never publish externally.",
  input: {
    type: "object",
    properties: {
      user_id: { type: "string", minLength: 1, maxLength: 128 },
      arguments: { type: "object", additionalProperties: true },
      confirmation: {
        type: "string",
        const: "CREATE APPROVED NOTION DRAFT",
        description:
          "Exact confirmation required after the user approves the specific draft.",
      },
    },
    required: ["user_id", "arguments", "confirmation"],
    additionalProperties: false,
  },
  async run({ input, signal }): Promise<DataValue> {
    if (input.confirmation !== "CREATE APPROVED NOTION DRAFT") {
      throw new Error("The exact Notion-draft confirmation is required");
    }
    return execute(
      notionCreatePageSlug,
      argumentsObject(input.arguments),
      userId(input.user_id),
      signal,
    );
  },
});
