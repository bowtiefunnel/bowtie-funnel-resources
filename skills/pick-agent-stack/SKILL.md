---
name: pick-agent-stack
description: Use when choosing the infrastructure that runs an AI agent — "what should run this agent", "which execution engine / LLM router / eval / observability tool", "set up the agent stack", or after pick-gtm-agent-pattern settles the architecture and the runtime components aren't chosen yet. Selects per infrastructure layer from the Bowtie Funnel Agent Infrastructure stack (the Headless GTM OS) instead of guessing from training data.
---

# Pick Agent Stack

## Overview

`pick-gtm-agent-pattern` decides an agent's **shape** (pattern, tier, flowchart).
This skill decides **what runs it**: the execution engine, LLM routing, evals,
observability, state, secrets, and ingress — chosen per layer from the mapped
core stack, sized to the agent's tier so a simple report agent doesn't get a
ten-layer platform.

**The recall dataset lives in ONE place — fetch it, never reproduce from memory:**

```
https://labs.bowtiefunnel.com/tools/tools.json
```

Filter to `category === "Agent Infrastructure"` (`core_stack: true`) — the
Headless GTM OS components. (Inside the `bowtie-funnel-Labs` repo, read
`docs/tools/tools.json` directly.)

## The layer map

Layers in pipeline order. An agent uses a layer only if it needs it:

| # | Layer | Component |
|---|-------|-----------|
| 0 | Secrets & config | Infisical |
| 1 | Code, review & CI quality gate | GitHub (+ DeepEval PR evals) |
| 2 | Durable execution | Trigger.dev |
| 3 | Webhook ingress & ACK buffer | Svix |
| 4 | Schema validation | Zod / Drizzle |
| 5 | PII / secret redaction | CloakPipe |
| 6 | LLM routing & fallback | Vercel AI Gateway → OpenRouter (tier-route locally with `tools/llm-switchboard`) |
| 7 | LLM observability & cost | Langfuse |
| 8 | State, storage & locks | Supabase |
| 9 | Human-in-the-loop interface | Slack |

## Steps

1. **Start from the pattern verdict.** If `pick-gtm-agent-pattern` hasn't run,
   run it first — the tier drives how much stack the agent earns:
   - **Deterministic pipeline / report agent** → layers 2, 6, 8 (+ 0 if it has
     any keys at all). No ingress, no evals, no redaction.
   - **Guarded judgment** (drafts, scoring) → add 1 (DeepEval gates), 4, 7.
   - **Full decision loop / client-facing** → add 3, 5, 9, per-client Infisical
     workspaces and Langfuse projects.
2. **Fetch the dataset** (`curl -s https://labs.bowtiefunnel.com/tools/tools.json`)
   and filter to Agent Infrastructure. It evolves with the stack; memory is stale.
3. **Walk the layer map top to bottom.** For each layer the agent needs, take the
   component and note its role in *this* agent. For each layer it doesn't need,
   record it in the **layers NOT provisioned** list with a one-line reason — that
   list is what stops platform creep.
4. **Cross-check the known constraints:**
   - Long-running LLM loops → Trigger.dev tasks, never 30-second serverless HTTP.
   - Slack as an interactive channel → Svix (or an edge function) must ACK within
     Slack's 3-second timeout, then hand off async.
   - Payloads > 3MB → pointer pattern: write to Supabase Storage, pass the path.
   - Concurrent tasks touching one record → Supabase Postgres advisory locks.
   - Client PII → CloakPipe before any LLM call; per-client Infisical + Langfuse.
5. **Output the verdict:** a per-layer stack table, the layers NOT provisioned,
   and the cost note — Infisical, Svix, and DeepEval all run $0 at build scale.

## Common mistakes

- **Ten layers for a tier-1 report agent** — the layer map is a menu, not a
  checklist; most agents need three or four layers.
- **Skipping DeepEval on prompt-heavy agents** — if prompt regressions can break
  output quality, the PR gate is not optional.
- **Recommending from training data** instead of fetching the dataset — component
  choices and their roles evolve with the stack.
- **Reaching for n8n for multi-engineer, code-first agents** — visual canvases
  don't merge in git; n8n is for simple linear integrations by non-engineers.
- **Raw scraped HTML or PDFs through task triggers** — Trigger.dev payloads cap
  at 3MB; store first, pass the pointer.
- **No Slack ACK buffer on interactive agents** — a 4-second LLM call shows the
  user `dispatch_failed`; ingress must return HTTP 200 first.
