import {
  bearer,
  defineConnection,
  defineTool,
  useSecret,
} from "@opencomputer/agent";
import type { DataValue } from "@opencomputer/agent";

export const apify = defineConnection({
  id: "apify-api",
  origin: "https://api.apify.com",
  methods: ["GET", "POST"],
  pathPrefix: "/v2/",
  headers: {
    authorization: bearer(useSecret("APIFY_API_TOKEN")),
  },
});

function identifier(value: unknown, label: string): string {
  const result = String(value ?? "").trim();
  if (!/^[A-Za-z0-9_-]+(?:~[A-Za-z0-9_-]+)?$/.test(result)) {
    throw new Error(`${label} is invalid`);
  }
  return result;
}

async function json(response: Response): Promise<Record<string, DataValue>> {
  const payload = (await response.json().catch(() => ({
    error: "The integration returned a non-JSON response",
  }))) as Record<string, DataValue>;
  return response.ok
    ? { ok: true, status: response.status, ...payload }
    : { ok: false, status: response.status, error: payload };
}

export const apifyRunTask = defineTool({
  name: "apify_run_task",
  description:
    "Run a preconfigured Apify task for social harvesting with hard result and spend caps. Use only task IDs supplied in trusted campaign configuration.",
  input: {
    type: "object",
    properties: {
      task_id: { type: "string", minLength: 1, maxLength: 128 },
      input: { type: "object", additionalProperties: true },
      max_items: { type: "integer", minimum: 1, maximum: 100, default: 40 },
      max_charge_usd: {
        type: "number",
        minimum: 0.01,
        maximum: 1,
        default: 0.25,
      },
    },
    required: ["task_id", "input"],
    additionalProperties: false,
  },
  async run({ input, signal }): Promise<DataValue> {
    const maxItems = Number(input.max_items ?? 40);
    const maxCharge = Number(input.max_charge_usd ?? 0.25);
    const query = new URLSearchParams({
      maxItems: String(maxItems),
      maxTotalChargeUsd: String(maxCharge),
      waitForFinish: "60",
    });
    return json(await apify.fetch(
      `/v2/actor-tasks/${encodeURIComponent(identifier(input.task_id, "task_id"))}/runs?${query}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input.input),
        signal,
      },
    ));
  },
});

export const apifyRunResults = defineTool({
  name: "apify_run_results",
  description:
    "Check an Apify run and return bounded dataset results when it has succeeded. This tool never starts or retries a run.",
  input: {
    type: "object",
    properties: {
      run_id: { type: "string", minLength: 1, maxLength: 128 },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 40 },
    },
    required: ["run_id"],
    additionalProperties: false,
  },
  async run({ input, signal }): Promise<DataValue> {
    const runId = identifier(input.run_id, "run_id");
    const runResponse = await apify.fetch(
      `/v2/actor-runs/${encodeURIComponent(runId)}`,
      { signal },
    );
    const runPayload = (await runResponse.json()) as {
      data?: { status?: string; defaultDatasetId?: string; usageTotalUsd?: number };
    };
    if (!runResponse.ok) {
      return { ok: false, status: runResponse.status, error: runPayload as DataValue };
    }
    const run = runPayload.data;
    if (run?.status !== "SUCCEEDED" || !run.defaultDatasetId) {
      return {
        ok: true,
        status: runResponse.status,
        run_status: run?.status ?? "UNKNOWN",
        usage_total_usd: run?.usageTotalUsd ?? null,
        ready: false,
      };
    }
    const limit = Number(input.limit ?? 40);
    const datasetResponse = await apify.fetch(
      `/v2/datasets/${encodeURIComponent(run.defaultDatasetId)}/items?clean=true&format=json&limit=${limit}`,
      { signal },
    );
    const items = (await datasetResponse.json()) as DataValue;
    return datasetResponse.ok
      ? {
          ok: true,
          status: datasetResponse.status,
          run_status: run.status,
          usage_total_usd: run.usageTotalUsd ?? null,
          ready: true,
          items,
        }
      : { ok: false, status: datasetResponse.status, error: items };
  },
});
