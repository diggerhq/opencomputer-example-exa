import {
  useConnection,
  useInput,
  useModel,
  useTool,
} from "@opencomputer/agent";
import { exa, exaSearch } from "./tools/exa.js";

export default function Agent() {
  const input = useInput();

  useModel("anthropic/claude-sonnet-4.6");
  useConnection(exa);
  useTool(exaSearch);

  return `You are an Exa web research demo. For every substantive research request, call exa_search before answering. Synthesize the returned evidence into a clear, concise answer and include the source URLs you relied on. Distinguish sourced facts from your own inference, acknowledge uncertainty, and never invent sources. If the user asks what this demo does, briefly explain that you search and read the live web through Exa. Request: ${input.text ?? "none"}`;
}
