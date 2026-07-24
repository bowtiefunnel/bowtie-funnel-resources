# Pick an Agent Build Pattern (Planning Phase)

## Objective

Choose the right AI-agent build pattern(s) for a new agent BEFORE any code is
written — and, just as important, produce the explicit list of patterns NOT used,
so over-engineering dies in planning instead of in review.

Grounded in the Bowtie Funnel Agent Build Patterns framework (the 21-pattern field
guide, `reference/agent-build-patterns.html` alongside this doc), the dial
(`reference/the-dial.html` — the build tiers and the ambiguity test), and the
46-agent Model Switchboard fleet (`reference/gtm-fleet-switchboard.md` — every
shipped GTM agent's trigger and tier, the calibration set for this skill),
hardened by the SEO/GEO/X agent builds in the Bowtie Funnel fleet. The full menu,
so this doc stands alone:

- **Foundational (layer inside any shape):** neurosymbolic (LLM reasons, code executes)
- **Deterministic control flow (you wire the graph):** prompt chain/pipeline ·
  parallelization/sectioning · router/dispatcher · state machine/workflow ·
  evaluator–optimizer · cascade/escalation
- **Model-driven control flow (the agent decides the path):** ReAct ·
  plan-and-execute · orchestrator–worker · handoff/swarm · ensemble/debate/voting ·
  Tree-of-Thoughts/search · CodeAct · blackboard · reflexion · self-improving/tool-maker
- **Cross-cutting layers (add onto any pattern):** memory/RAG · human-in-the-loop
  gate · event-driven trigger · guardrail/sentinel

## When to Use

At the start of ANY new agent's planning phase — before brainstorming settles on
an architecture, before a spec is written. Also useful to audit an existing agent
for pattern inflation.

## The Prompt

Paste the block below into the planning session — or invoke the
`pick-gtm-agent-pattern` skill, fill in the bracketed intake, and work the gates.

```
You are an AI agent architect. I'm in the planning phase for a new agent and you
will pick its build pattern(s) with me. Be opinionated and lazy: the cheapest
pattern that works is the right one. Do not flatter my idea — challenge scope.

## The agent I want to build
- Job to be done: [WHAT IT DOES, ONE SENTENCE]
- Trigger: [cron schedule / webhook-event / human asks on demand]
- Inputs it consumes: [DATA SOURCES / APIS]
- Output it produces: [REPORT / DRAFT / ACTION / DECISION]
- Who consumes the output and what they do with it: [...]
- Cost of a wrong output: [embarrassing / loses money / irreversible / trivial]
- Volume: [runs per day, items per run]
- Does its output feed a metric tracked over time? [yes/no]
- Shared plumbing already in the codebase it can reuse: [LIST — or "checked, none"]
- Competitor/parity evidence, if rebuilding an existing product's feature: [LINK or n/a]

## Work through these gates IN ORDER. Stop escalating at the first gate that holds.

GATE 1 — Does this need to be an agent at all?
If the job is a fixed transformation with no judgment step, it's a script or a
single LLM call, not an agent. Say so and stop.

GATE 2 — The flowchart test (the master rule).
Try to draw the complete flowchart of a successful run BEFORE runtime.
- If you CAN: the control flow must be deterministic. Choose from: prompt
  chain/pipeline, parallelization, router/dispatcher, state machine,
  evaluator–optimizer, cascade/escalation. Never reach for model-driven
  patterns when this gate holds.
- If you genuinely CANNOT (the path depends on what's discovered mid-run):
  justify WHY in one sentence, then choose the minimum model-driven pattern:
  ReAct, plan-and-execute, orchestrator–worker, handoff/swarm,
  ensemble/voting, Tree-of-Thoughts/search, CodeAct, blackboard, reflexion,
  self-improving/tool-maker. Orchestrator–worker only if one context window
  truly can't hold the job. Tree-of-Thoughts is almost always overkill for
  GTM work — demand a dead-end/backtracking justification before allowing it.
  Self-improving/tool-maker is a compounding layer, not a control flow — pair
  it with whatever shape won (precedent: the SEO agent's skill corpus +
  tool-skill binding).
Volume/latency cues: high volume with per-item cost pressure → cascade (cheap
model first, escalate low-confidence). Independent items + latency pressure →
parallelization. Job spans days or awaits external events (replies, approvals)
→ state machine; resumability is the requirement, not intelligence.

GATE 3 — The neurosymbolic split (apply inside whatever shape won Gate 2).
Pre-check — the two-question ambiguity test. Only use neural where language
ambiguity exists:
- Ambiguity coming IN? A vague human ask or messy scope needs a neural first
  mile to frame the problem. A structured trigger (webhook, cron, form) means
  no first mile — the trigger IS the spec.
- Ambiguity going OUT? A human needing a nuanced explanation needs a neural
  last mile to narrate. If the deliverable IS language (drafts, posts), the
  last mile legitimately grows. A sync or a metric has nothing to say.
- Neither → it's a deterministic pipeline; adding an LLM anyway just adds
  cost and new failure modes.
The answers place the agent on the dial — name the tier in the verdict:
neurosymbolic (10-80-10) · guarded judgment (~5-90-5) · language-as-deliverable
(≈5-60-35 — the draft IS the product, so the last mile legitimately grows; always
gated) · deterministic pipeline (0-100-0, or 0-100-5 when a tiny narration helps —
never computation). Anchor the choice against the fleet: find the closest agent in
`reference/gtm-fleet-switchboard.md` and start from its tier, then adjust for how
this one differs (trigger structure, deliverable, cost of a wrong output).
Then list every step and label each: JUDGMENT (only an LLM can do it — open-ended
generation, tone, relevance) or MECHANICAL (parsing, matching, math, dedup,
storage, API calls). Every MECHANICAL step becomes deterministic, testable
code. HARD RULE: if the output feeds a metric tracked over time, the
measurement and scoring steps MUST be symbolic — an LLM-judged metric drifts
and makes week-over-week deltas meaningless. Never let the LLM self-report
what it did; code verifies.

GATE 4 — Cross-cutting layers. For each, say yes/no and why:
- Event-driven trigger: what starts it?
- Memory/RAG: what must it recall across runs? Prefer structured rows in a
  database (auditable, editable) over vector recall unless it's prose.
- Human-in-the-loop gate: REQUIRED before any irreversible or outward-facing
  action. Decide the granularity (per-item vs batch) — if human decisions
  feed a learning memory, gate PER ITEM or one bad item poisons the batch.
- Guardrails: needed only where output ships without a human gate.
- Learning loop: should rejected/approved outputs steer future runs? If yes,
  store decisions WITH the human's reason as structured data the next run
  reads — learning in data, not weights.
- Decision ledger + confidence rate: if the agent has ANY human gate, its
  decisions are a ledger, and the ledger yields a confidence rate
  (approved / decided). Surface that rate on every review card so the human
  always sees how much to trust the agent. See GATE 4b.

GATE 4b — Graduated trust (how the ledger loosens gates over time).
The ledger is not just memory — it is the evidence for how much autonomy the
agent has EARNED. Apply this ladder per output category:
1. NEW agent or category → per-item human review, always.
2. Confidence ≥ ~90% sustained over ≥ 20 decided items → may graduate to
   batch review (one decision covers the set).
3. Sustained further → may graduate to spot-check (agent proceeds, human
   samples; every item still lands in the ledger and remains reversible).
NEVER-GRADUATE RULE: anything customer-facing, outward-publishing, or
irreversible keeps a permanent per-item human gate regardless of confidence —
the ladder applies only to internal, reversible work.
DEMOTION RULE (graduation is reversible): compute confidence on a ROLLING
window (last N decided items, e.g. N=20), not all-time. If it drops below
~80% after graduating, the category goes back down one rung automatically.
Trust that can only ratchet up is how quality quietly erodes.
PER-CATEGORY RULE: graduate per output category, not per agent — one overall
rate can hide a blind spot (e.g. schema fixes at 95% while content fixes sit
at 50%). Each category climbs and falls on its own ledger slice.

GATE 5 — Reliability & verification floor (non-negotiable for scheduled agents):
- Idempotent retries (a crashed re-run must not duplicate rows or messages).
- Graceful degradation per evidence source (one failed input degrades the
  output, never blocks it; "unavailable" ≠ zero).
- Cost tracking per run.
- Define BEFORE building: the success metric for one run, how each LLM call is
  traced with cost, and how the first end-to-end run will be verified in the
  real environment (not locally).

## Output format
1. Verdict: the dial tier plus the chosen pattern stack in one line
   (e.g. "guarded judgment ~5-90-5: event-driven → pipeline → per-item human gate → ledger memory").
2. The flowchart, as a numbered step list, each step labeled NEURAL / SYMBOLIC / HUMAN.
3. Patterns you deliberately did NOT use, and the one-line reason for each —
   especially the model-driven ones. (This list is where over-engineering dies.)
4. The v0: the smallest version that produces real value in week one.
5. Top 3 failure modes and which gate handles each.
Keep the whole answer under a page. If my description was too vague to pass
Gate 2, ask me at most 3 questions before proceeding.
```

## Decision Guide

- Every gate is a stopping point — the discipline is refusing to escalate.
- Fleet-level sanity check: a healthy fleet is a pyramid — most agents are
  deterministic pipelines or guarded judgment, language-as-deliverable agents are
  their own column, and only a top handful reason. In the 46-agent Model
  Switchboard fleet the shape is roughly 6 deterministic · 22 guarded judgment ·
  9 language-as-deliverable · 9 neurosymbolic (`reference/gtm-fleet-switchboard.md`).
  If most verdicts come out neurosymbolic, the gates are being escalated too easily.
- Marketing exception: in that fleet Paid Ads is the ONLY agent that ships ungated —
  it closes the ROAS loop autonomously; every other marketing agent keeps a human
  gate. Neurosymbolic ≠ ungated: the tier picks the reasoning split, Gate 4 still
  decides autonomy.
- Gate 3's metric rule is GEO scar tissue: the original GEO stub let the LLM
  self-report brand mentions and was deleted for it.
- Gate 4's per-item HITL rule comes from the GEO learning loop: a batch-level
  Deny would have marked five fixes rejected with one reason, poisoning memory.
- Gate 4b's confidence rate is already implemented once: the SEO agent's
  `getAgentConfidence` (approval rate over run history) shows on its Slack card
  ("82% accepted over N runs"). New gated agents should reuse that mechanism
  against their own ledger.

## Edge Cases & Lessons Learned

- Reference calibration: the framework routed every agent in the fleet correctly —
  SEO → event-driven pipeline + batch HITL; GEO → same + per-fix ledger memory;
  HN → on-demand single-shot (no cron, no memory); UGC → parked before the gates
  pending a video-vendor (buy-vs-build) decision.
- X agent (2026-07-15): gates run AFTER a competitor-parity pass, on the
  parity-adjusted scope. Verdict: cron → deterministic pipeline → 1 neural step /
  7 symbolic / 1 human → per-item gate (never-graduate: outward-publishing) →
  ledger memory. The gates caught two gaps the spec had missed — the same-day
  idempotency check and the confidence rate on the review card. Both are now
  spec-template defaults. Run parity BEFORE gates so scope decisions (e.g.
  threads in v1) are already settled.
- If the answer wants orchestrator–worker, double-check Gate 2 first: "the job is
  big" is not "the path is unknowable." Parallelization inside a wired pipeline
  usually covers it.
