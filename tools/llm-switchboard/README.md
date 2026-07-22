<div align="center">
  <h1>llm-switchboard</h1>
  <p><strong>Local LLM prompt router — free-ish for workflow, frontier for thinking.</strong></p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-6b46c1.svg)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-green.svg)

  <p>
    A ~130-line router that sits <b>before OpenRouter</b>. It classifies a prompt in
    <b>&lt;1ms</b>, picks the model, and hands the ID to your OpenRouter call. No extra
    network hop, no LLM-based classification — just heuristics.
  </p>
</div>

---

## Why

Using a frontier model for every request wastes time and money. Traditional routers
burn *another* LLM call to classify the prompt. This one scores prompts locally across
weighted heuristic dimensions, so the frontier model is reserved for the work that
actually needs it.

It's a **tool**, not an agent or a skill: `prompt in → model ID out`. It never calls
the model — you do.

```
prompt ──▶ [ switchboard ]  local, <1ms, no network
                 │  model = "anthropic/claude-opus-4.8"
                 ▼
           [ OpenRouter ]  ── the paid call
                 ▼
            response
```

---

## Install

No npm, no build. Copy the one file into your project:

```bash
cp tools/llm-switchboard/btf-switchboard.js /path/to/project/lib/
```

Runs in browser and Node (ESM, zero dependencies).

---

## Tiers → models

Every prompt lands in one of four tiers. Each tier is an **ordered list of options**,
mirroring the BTF RevOps/Marketing agent pages' "model options (recommended in bold)":
`options[0]` is the bold pick, and every tier includes a real **free** OpenRouter model.

| Tier | Page section (split) | Bold pick | Free option |
| :--- | :--- | :--- | :--- |
| **SIMPLE** | pipeline (0-100-0) | `google/gemini-2.5-flash-lite` | `google/gemma-4-31b-it:free` |
| **MEDIUM** | guarded judgment (~5-90-5) | `google/gemini-2.5-flash` | `openai/gpt-oss-20b:free` |
| **COMPLEX** | drafting / analysis (~5-45-50) | `anthropic/claude-sonnet-5` | `nvidia/nemotron-3-ultra-550b-a55b:free` |
| **REASONING** | neurosymbolic (10-80-10) | `anthropic/claude-sonnet-5` | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` |

Full option lists also carry the pages' other picks — GPT-5 / GPT-5 mini / GPT-5 nano,
Gemini 3 Pro, Claude Haiku 4.5, Opus 4.8 — plus **Kimi K3** in the agentic and reasoning
tiers (paid, ~$3/$15, 1M ctx; a strong long-horizon tool-use model — not free on
OpenRouter, so it never appears in the `free` slot). The **agentic** table (auto-selected
on multi-step tool prompts, or forced) leads with proven callers — *"tool-loop
reliability → Claude Sonnet 5,"* per the pages.

> Free models rotate on OpenRouter (slugs appear and vanish) and carry shared daily
> rate limits. Verified live at time of writing — re-check before relying on any `:free` slug.

---

## Usage

```js
import { route } from "./btf-switchboard.js";

const { model, tier } = route("Prove that sqrt(2) is irrational, step by step.");
// → { model: "anthropic/claude-sonnet-5", tier: "REASONING", confidence: 0.88, ... }

const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
});
```

### Options

```js
route(prompt, {
  agentic: true,          // force the agentic table for this prompt
  preferFree: true,       // return the tier's free model instead of the bold pick
  tables: MY_OWN_TABLE,   // { std: {...}, ag: {...} } to override the model map
});
```

`route()` returns the full picture:

```js
{
  model,       // the chosen slug (bold pick, or free if preferFree)
  options,     // the whole ordered list for that tier
  free,        // the free slug in that tier, or null
  tier, rawTier, confidence, ambiguous, signals, agentic, tokens
}
```

Each tier value may be a single slug or an ordered list; `options[0]` is the bold pick.
Use `classify(prompt)` if you only want the tier.

---

## How it works

Scores each prompt across weighted dimensions — reasoning markers, code, technical /
business-analysis vocab, creative cues, simple-question cues, agentic signatures,
imperative verbs, output-format demands — then maps the weighted score onto tier
boundaries with a sigmoid confidence. Below the confidence threshold a prompt is
**ambiguous** and falls to a safe default tier (MEDIUM).

> This is a **heuristic port tuned for GTM/agent prompts** — the boundaries and
> keyword lists are ours, not a byte-exact clone of any npm package. Retune
> `DIM`, `BOUND`, and `DEFAULT_TABLES` for your own prompt mix.

### Where it sits

`route()` returns `.model` only — it does **not** call OpenRouter, retry, or fall back.
Your OpenRouter wrapper owns auth, retries, and 429 handling. Keep the switchboard a
pure, local decision.

---

## License

MIT © Bowtie Funnel
