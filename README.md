# Exa Research Demo

A small, shareable web-research agent built with React, OpenComputer, and Exa.
Ask a question in the browser and the agent searches the live web with Exa,
reads relevant results, and returns a concise answer with source links.

## What the demo shows

- Natural-language web research with Exa
- Current results instead of model memory alone
- Semantic search with optional date, domain, and category filtering
- Relevant page highlights or full-text retrieval
- Streaming answers with clickable source URLs
- Follow-up questions in the same research session

## Prerequisites

- Node.js 22 or newer
- An OpenComputer account
- An Exa API key

Never put the Exa key in `.env`, React source code, or a browser request. The
key is stored by OpenComputer as a managed, write-only secret and is injected
only into requests sent to `https://api.exa.ai`.

## Install

### Dependency-layout note

This checkout uses development builds of `@opencomputer/agent` and
`@opencomputer/cli` through these relative paths:

```text
../../opencomputer/agent
../../opencomputer/cli
```

For a standalone clone, place the repositories in this layout before running
`npm install`:

```text
demo-workspace/
├── opencomputer/
└── projects/
    └── secret-logs-test/
```

From `demo-workspace`, that can look like:

```bash
git clone https://github.com/diggerhq/opencomputer.git opencomputer
mkdir -p projects
git clone <repository-url> projects/secret-logs-test
cd projects/secret-logs-test
```

If your copy already uses published npm versions instead of `file:` entries in
`package.json`, no special directory layout is needed.

Clone the repository, enter its directory, and install the dependencies:

```bash
npm install
```

Log in to OpenComputer:

```bash
./node_modules/.bin/opencomputer login
```

You can also use `npx opencomputer login` if the local binary is not yet
available.

## Configure the Exa API key

Set the development secret from the project directory:

```bash
./node_modules/.bin/opencomputer secrets set EXA_API_KEY
```

Paste the key when prompted. Input is hidden. Confirm that the secret name is
registered without printing its value:

```bash
./node_modules/.bin/opencomputer secrets list --environment development
```

Only `EXA_API_KEY` is required. The unused Hacker News example source file does
not run and does not require a secret.

## Run locally

The agent sync and React development server run separately.

### Terminal 1: sync the agent

```bash
npm run dev
```

The first run asks you to create an OpenComputer cloud project or select an
existing one. Keep this process running while using the demo.

### Terminal 2: start React

```bash
npm run dev:web
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

## Use the demo

1. Enter a research question or select one of the example prompts.
2. The OpenComputer agent receives the question and calls `exa_search`.
3. Exa searches the live web and returns ranked sources with page content.
4. The agent compares the evidence and streams an answer with source URLs.
5. Ask follow-up questions to continue in the same session.

Good questions to try:

```text
What are the latest developments in AI coding agents?
Find recent companies hiring their first DevOps engineer.
Compare the newest open-source browser automation tools.
```

## Build and deploy

Verify the production React build:

```bash
npm run build
```

Production uses a separate secret from development. Set it before deploying:

```bash
./node_modules/.bin/opencomputer secrets set EXA_API_KEY \
  --environment production
```

Deploy the agent and application:

```bash
npm run deploy
```

## Project structure

```text
opencomputer/
  agents/hello-world/
    agent.ts                 Agent instructions and tool registration
    tools/exa.ts             Exa connection and exa_search tool
  project.ts                 OpenComputer project definition
skills/exa-search/
  SKILL.md                   Research workflow guidance
src/
  App.tsx                    Exa demo interface
  use-agent.ts               Streaming OpenComputer client
  styles.css                 Responsive presentation styles
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install project dependencies |
| `npm run dev` | Sync the development agent to OpenComputer |
| `npm run dev:web` | Start the local React application |
| `npm run build` | Type-check and build the React application |
| `npm run session` | Open an agent session from the terminal |
| `npm run deploy` | Create a production deployment |
| `opencomputer secrets set EXA_API_KEY` | Set the Exa secret |
| `opencomputer secrets list` | List configured secret names and scopes |

## Troubleshooting

### “OpenComputer is not running”

Start `npm run dev` first and leave it running before starting `npm run dev:web`.

### Exa returns an authentication error

Set the key again in the environment you are using:

```bash
# Local development
./node_modules/.bin/opencomputer secrets set EXA_API_KEY \
  --environment development

# Production deployment
./node_modules/.bin/opencomputer secrets set EXA_API_KEY \
  --environment production
```

### The first development run asks for a project

Choose an existing OpenComputer project or create a new one. The local binding
is stored under `.opencomputer/`, which is intentionally excluded from Git.

### The browser opens but research requests fail

Check that:

1. `npm run dev` is still running.
2. `EXA_API_KEY` appears in the development secrets list.
3. The Exa account has available API usage.
4. The terminal running the agent shows no connection or deployment errors.

## Security notes

- Do not commit API keys, `.env` files, or `.opencomputer/` state.
- React never receives the plaintext Exa key.
- The managed connection permits only HTTPS requests to the declared Exa API
  origin and methods.
- Rotate the Exa key immediately if it is pasted into source code, logs, chat,
  or another public location.
