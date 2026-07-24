# Bowtie Funnel Resources

Reusable skills and tools for AI coding agents. One folder per skill under
[`skills/`](skills/), one per tool under [`tools/`](tools/).

> **Adding a skill or tool?** Follow [CONTRIBUTING.md](CONTRIBUTING.md) — the folder
> layout, registration, verify, and ship steps.

## Skills

### [`excalidraw`](skills/excalidraw/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-6b46c1.svg)

Draw and refine real diagrams on a live Excalidraw canvas you can watch in the
browser — architecture, flows, sequences — then export `.excalidraw` + PNG/SVG.

Drives a local canvas server over plain `curl`/CLI by default (no MCP required),
or the Excalidraw MCP tools if they're loaded — same server either way. The
agent creates elements, screenshots its own work, and fixes truncation, overlap,
and arrow tangles before calling it done.

**Brand-first:** its very first step asks you for your brand (stroke/accent
colors, font) and bakes that recipe into every element at creation — so diagrams
come out on-brand, not fixed up after. Ships a worked example recipe you copy and
swap values on. Say "default" for a clean neutral style.

Needs the open-source canvas server (`yctimlin/mcp_excalidraw`) running on
`:3000` — one-time setup is in the skill's Step 0.

**Install:**

```bash
# personal (all projects)
cp -r skills/excalidraw ~/.claude/skills/

# or project-scoped
cp -r skills/excalidraw /path/to/project/.claude/skills/
```

Invoke it with `/excalidraw`, or just describe the diagram:

> "draw the lead-intake flow as an architecture diagram"
> "turn this Mermaid into an Excalidraw diagram"

### [`pick-gtm-agent-pattern`](skills/pick-gtm-agent-pattern/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-6b46c1.svg)

Pick the right build pattern for an AI agent BEFORE any code is written — and
produce the explicit list of patterns NOT used, so over-engineering dies in
planning instead of in review.

Six gates, worked in order, stopping at the first that holds: buy vs build →
does this need to be an agent at all → the flowchart test (deterministic vs
model-driven control flow) → the neurosymbolic split and the 10-80-10 dial
(neurosymbolic 10-80-10 · guarded judgment ~5-90-5 · deterministic pipeline
0-100-0) → cross-cutting layers and graduated trust → the reliability floor.

Ships with two visual reference pages: the 21 agent build patterns for GTM,
and the 10-80-10 dial. Open `skills/pick-gtm-agent-pattern/reference/` in a browser.

**Install:**

```bash
# personal (all projects)
cp -r skills/pick-gtm-agent-pattern ~/.claude/skills/

# or project-scoped
cp -r skills/pick-gtm-agent-pattern /path/to/project/.claude/skills/
```

Invoke it with `/pick-gtm-agent-pattern`, or just describe the task:

> "should this workflow be an agent?"
> "what pattern should this agent use?"

### [`agent-anatomy`](skills/agent-anatomy/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-6b46c1.svg)

Organize any AI agent's project into a clean, filesystem-first layout. One agent
= one folder; every capability is a file in a conventionally-named subfolder.

Most agents start as a pile of loose files: a prompt, a few scripts, a cron job,
some notes, all in one directory. `agent-anatomy` gives them a consistent shape.

**It works two ways:**

- **Scaffold** a new agent — describe what it does, get a real `instructions.md`
  plus only the capability folders it needs.
- **Reorganize** a messy agent — it classifies every file, shows a move plan, and
  only moves things after you approve. It never deletes.

**Before → after:**

```text
support-bot/                     support-bot/
├── prompt.txt                   ├── instructions.md          (the system prompt)
├── refund_tool.py               ├── tools/
├── how_to_escalate.md    ─►     │   └── issue_refund.py      (path = tool name)
├── daily_report.py              ├── skills/
├── slack.py                     │   └── how-to-escalate.md   (on-demand procedure)
├── utils.py                     ├── schedules/
└── notes.txt                    │   └── daily_report.py      (cron job)
                                 ├── channels/
                                 │   └── slack.py             (inbound webhook)
                                 ├── lib/
                                 │   └── utils.py             (shared helper)
                                 └── notes.txt                (dev scratch — left in place)
```

See [`examples/`](examples/) for the full walkthrough.

## Install

Copy the skill folder into your Claude Code skills directory:

```bash
# personal (all projects)
cp -r skills/agent-anatomy ~/.claude/skills/

# or project-scoped
cp -r skills/agent-anatomy /path/to/project/.claude/skills/
```

## Use

Invoke it with `/agent-anatomy`, or just describe the task — the skill triggers
itself:

> "organize this agent folder"
> "scaffold a new agent that answers support tickets"

### [`pick-gtm-stack`](skills/pick-gtm-stack/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-6b46c1.svg)

Pick the right GTM tools for a task or play — recommended from the mapped
Bowtie Funnel stack instead of guessed from training data.

The skill's recall dataset is the live JSON at
[labs.bowtiefunnel.com/tools/tools.json](https://labs.bowtiefunnel.com/tools/tools.json):
every tool tagged by job category, customer-lifecycle stage (awareness → expansion),
and real usage across 48 mapped workflows. The skill classifies the play, fetches
the dataset, filters by lifecycle + category, ranks by proven usage, and proposes
a minimal stack — including the alternatives NOT chosen, so stacks don't bloat.

**Install:**

```bash
# personal (all projects)
cp -r skills/pick-gtm-stack ~/.claude/skills/

# or project-scoped
cp -r skills/pick-gtm-stack /path/to/project/.claude/skills/
```

Invoke it with `/pick-gtm-stack`, or just describe the task:

> "what tools should I use for a cold outbound play?"
> "build a stack for de-anonymizing site visitors"

### [`pick-agent-stack`](skills/pick-agent-stack/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-6b46c1.svg)

Choose the infrastructure that runs an AI agent — execution engine, LLM routing,
evals, observability, state, secrets, ingress — selected per layer from the
Bowtie Funnel core stack (the Headless GTM OS) instead of guessed from training data.

The companion to `pick-gtm-agent-pattern`: the pattern skill decides the agent's
*shape*, this one decides *what runs it*. It recalls the Agent Infrastructure
entries from [labs.bowtiefunnel.com/tools/tools.json](https://labs.bowtiefunnel.com/tools/tools.json),
walks a ten-layer topology (Infisical → GitHub/DeepEval → Trigger.dev → Svix →
Zod/Drizzle → CloakPipe → Vercel AI Gateway/OpenRouter → Langfuse → Supabase →
Slack), sizes the stack to the agent's tier, and outputs the layers **NOT
provisioned** — so a simple report agent doesn't get a ten-layer platform.

**Install:**

```bash
# personal (all projects)
cp -r skills/pick-agent-stack ~/.claude/skills/

# or project-scoped
cp -r skills/pick-agent-stack /path/to/project/.claude/skills/
```

Invoke it with `/pick-agent-stack`, or just describe the task:

> "what should run this lead-scoring agent?"
> "set up the stack for a Slack-interactive agent"

## Tools

Reusable runtime code (not skills) — copy the file, import it.

### [`llm-switchboard`](tools/llm-switchboard/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-green.svg)

A ~130-line local LLM prompt router that sits **before OpenRouter**. It classifies a
prompt in <1ms, picks the model, and hands the ID to your OpenRouter call — Gemini /
free open-weight for the workflow miles, frontier Claude / GPT-5 / Gemini 3 Pro for
thinking — matching the RevOps & Marketing agent pages, with a free model in every
tier. `prompt in → { model, tier } out`. No network, zero dependencies, browser + Node.

**Install & use:**

```bash
cp tools/llm-switchboard/btf-switchboard.js /path/to/project/lib/
```

```js
import { route } from "./btf-switchboard.js";
const { model, tier } = route(prompt);       // local, <1ms
const res = await openrouter(model, prompt);  // the paid call
```


## Agent skills page

A standalone page at [`docs/agent-skills/index.html`](docs/agent-skills/index.html),
served at **[labs.bowtiefunnel.com/agent-skills/](https://labs.bowtiefunnel.com/agent-skills/)**.
It lists Bowtie Funnel's GTM agent skills — capabilities repurposed from the Growth
(Verbiflow) MCP — mapped to the customer lifecycle (awareness, education, selection,
mutual commit, onboarding, retention, expansion), with a stage filter.

Single source of truth is [`docs/agent-skills/skills.json`](docs/agent-skills/skills.json)
(the page and AI agents both read it). **To add a skill, append one object** —
`name`, `lifecycle` (array of stages), `description`, and optional `slug` (links the row
to a per-skill page at `/agent-skills/<slug>/`).

## Install as a Claude Code plugin

This repo is also a **Claude Code plugin marketplace**
([`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)). The `bowtie-gtm`
plugin bundles the GTM agent-skill playbooks **and** the Growth (Verbiflow) MCP server:

```
/plugin marketplace add bowtiefunnel/bowtie-funnel-Labs
/plugin install bowtie-gtm@bowtie-funnel
```

Or grab a single skill + the MCP by hand:

```bash
claude mcp add --transport stdio growth -- npx -y growth-mcp
cp -r plugins/bowtie-gtm/skills/<skill-name> ~/.claude/skills/
```

## License

[MIT](LICENSE)
