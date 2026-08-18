import {
  defineConnection,
  defineTool,
  secretHeader,
  useSecret,
} from "@opencomputer/agent";
import type { DataValue } from "@opencomputer/agent";

type SearchType =
  | "instant"
  | "fast"
  | "auto"
  | "deep-lite"
  | "deep"
  | "deep-reasoning";

type SearchCategory =
  | "company"
  | "publication"
  | "news"
  | "personal site"
  | "financial report"
  | "people";

export const exa = defineConnection({
  id: "exa-api",
  origin: "https://api.exa.ai",
  methods: ["POST"],
  pathPrefix: "/",
  headers: {
    "x-api-key": secretHeader(useSecret("EXA_API_KEY")),
  },
});

export const exaSearch = defineTool({
  name: "exa_search",
  description:
    "Search the live web with Exa. Returns ranked sources and either relevant highlights or full page text.",
  input: {
    type: "object",
    properties: {
      query: {
        type: "string",
        minLength: 1,
        description: "A natural-language web search query.",
      },
      num_results: {
        type: "integer",
        minimum: 1,
        maximum: 25,
        default: 10,
        description: "Number of results to return.",
      },
      search_type: {
        type: "string",
        enum: ["instant", "fast", "auto", "deep-lite", "deep", "deep-reasoning"],
        default: "auto",
        description: "Trade search latency for depth. Use auto unless the request needs another mode.",
      },
      category: {
        type: "string",
        enum: ["company", "publication", "news", "personal site", "financial report", "people"],
        description: "Optional result category.",
      },
      include_domains: {
        type: "array",
        items: { type: "string", minLength: 1 },
        maxItems: 50,
        description: "Only return results from these domains or domain/path prefixes.",
      },
      exclude_domains: {
        type: "array",
        items: { type: "string", minLength: 1 },
        maxItems: 50,
        description: "Exclude results from these domains or domain/path prefixes.",
      },
      start_published_date: {
        type: "string",
        format: "date-time",
        description: "Only return pages published after this ISO 8601 timestamp.",
      },
      end_published_date: {
        type: "string",
        format: "date-time",
        description: "Only return pages published before this ISO 8601 timestamp.",
      },
      include_text: {
        type: "boolean",
        default: false,
        description: "Return full page text instead of concise relevant highlights.",
      },
      moderation: {
        type: "boolean",
        default: false,
        description: "Ask Exa to filter unsafe content.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async run({ input, signal }): Promise<DataValue> {
    const query = String(input.query ?? "").trim();
    if (!query) throw new Error("query is required");

    const numResults = Number(input.num_results ?? 10);
    if (!Number.isInteger(numResults) || numResults < 1 || numResults > 25) {
      throw new Error("num_results must be an integer from 1 to 25");
    }

    const searchType = (input.search_type ?? "auto") as SearchType;
    const category = input.category as SearchCategory | undefined;
    const includeText = input.include_text === true;

    const body = {
      query,
      numResults,
      type: searchType,
      ...(category ? { category } : {}),
      ...(Array.isArray(input.include_domains)
        ? { includeDomains: input.include_domains }
        : {}),
      ...(Array.isArray(input.exclude_domains)
        ? { excludeDomains: input.exclude_domains }
        : {}),
      ...(typeof input.start_published_date === "string"
        ? { startPublishedDate: input.start_published_date }
        : {}),
      ...(typeof input.end_published_date === "string"
        ? { endPublishedDate: input.end_published_date }
        : {}),
      ...(input.moderation === true ? { moderation: true } : {}),
      contents: includeText ? { text: true } : { highlights: true },
    };

    const response = await exa.fetch("/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    const payload = (await response.json()) as Record<string, DataValue>;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: payload,
      };
    }

    return {
      ok: true,
      status: response.status,
      ...payload,
    };
  },
});
