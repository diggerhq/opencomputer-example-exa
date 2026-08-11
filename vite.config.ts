import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function openComputerDev() {
  try {
    return JSON.parse(
      readFileSync(resolve(".opencomputer/dev.json"), "utf8"),
    ) as { url: string; token: string; agent: string };
  } catch {
    throw new Error(
      "OpenComputer is not running. Start npm run dev in another terminal first.",
    );
  }
}

function openComputerAgent() {
  try {
    const binding = JSON.parse(
      readFileSync(resolve(".opencomputer/project.json"), "utf8"),
    ) as { agentId?: string };
    if (binding.agentId) return binding.agentId;
  } catch {
    // The production build below reports the actionable binding error.
  }
  throw new Error(
    "This app is not connected to an OpenComputer project. Run npm run dev first.",
  );
}

export default defineConfig(({ command }) => {
  const dev = command === "serve" ? openComputerDev() : undefined;
  return {
    plugins: [react()],
    define: {
      __OPENCOMPUTER_AGENT__: JSON.stringify(
        dev?.agent ?? `${openComputerAgent()}@production`,
      ),
    },
    ...(dev ? { server: {
      proxy: {
        "/api/opencomputer": {
          target: dev.url,
          headers: { authorization: `Bearer ${dev.token}` },
          rewrite: (path) => path.replace(/^\/api\/opencomputer/, ""),
        },
      },
    } } : {}),
  };
});
