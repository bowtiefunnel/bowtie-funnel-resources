# GTM Model Switchboard — Fleet Calibration Set

The 46-agent Bowtie Funnel reference fleet, distilled from the Model Switchboard.
Use it at **Gate 3**: find the closest analogue to the agent you're planning
(match on trigger structure + what the deliverable is), start from its tier, then
adjust for how yours differs.

**Source of truth (may have grown since):** https://labs.bowtiefunnel.com/agent-models/
The live page also carries the per-agent *model* routing (Sonnet 5 / Gemini 3 Pro /
Haiku / Flash / open-weight) — that's a `pick-gtm-agent-stack` concern, out of scope
for pattern-picking. Here we keep only trigger, deliverable, and tier.

> Tier below is **derived** from the switchboard's model-strategy column via the
> rule in "How the switchboard decides." Treat it as a starting anchor, not gospel —
> re-run the two-question ambiguity test for the specific agent.

## The four tiers (the dial)

| Tier | Split (first-middle-last) | When |
|------|---------------------------|------|
| **Neurosymbolic** | 10-80-10 | Reasoning-heavy: neural frames + narrates, code executes the middle. |
| **Guarded judgment** | ~5-90-5 | Structured trigger = free framing; one small judgment step, gated. |
| **Language-as-deliverable** | ≈5-60-35 | The draft/post/email IS the product, so the last mile grows. Always gated. |
| **Deterministic pipeline** | 0-100-0 (or 0-100-5) | Code computes; a model narrates at most, or not at all. |

## How the switchboard decides the tier

1. **Deterministic trigger = free framing.** A structured event (webhook, cron,
   form) removes the first mile → drop a tier. A vague human ask adds one back.
2. **Three miles:** first (frame) → middle (compute) → last (narrate). The tier
   is just where the weight sits.
3. **Deliverable is language?** (draft, post, newsletter, outreach) → the last
   mile legitimately grows → language-as-deliverable, not guarded judgment.
4. **Output feeds a tracked metric?** The measurement/scoring steps stay symbolic
   regardless of tier (an LLM-judged metric drifts).
5. **Gating is orthogonal to tier.** Every external action stops at a human gate.
   Fleet exception: **Paid Ads** is the only agent that ships ungated.

## Desk 1 — RevOps (29)

| Agent | Trigger | Deliverable | Tier (derived) |
|-------|---------|-------------|----------------|
| Forecast Explain | schedule (3d pre-close) | explanation | neurosymbolic |
| Win/Loss Attribution | deal-closed event | analysis | neurosymbolic |
| Churn Signal | weekly usage threshold | risk read | neurosymbolic |
| Commit Confidence | rep-submission event | judgment | neurosymbolic |
| Board Reporting | monthly/quarterly schedule | narrative report | neurosymbolic |
| Deal Risk | deal untouched 14d | flag | guarded judgment |
| Expansion Signal | usage/seat threshold | flag | guarded judgment |
| Quote/CPQ | opportunity event | quote | guarded judgment |
| Lead Scoring | new/updated lead | score | guarded judgment |
| CRM Hygiene | record-creation event | fix | guarded judgment |
| Renewal | contract −90d schedule | play | guarded judgment |
| Lead Routing | new-lead webhook | assignment | guarded judgment |
| GTM Assistant | email/daily cron | answer | guarded judgment |
| Account Sourcing/TAM | segment-refresh schedule | list | guarded judgment |
| Buying Committee | account-tier event | map | guarded judgment |
| Account Tiering | enrichment/refresh event | tier | guarded judgment |
| Signal/Intent | webhook event | signal | guarded judgment |
| Call Debrief | transcript ready | summary | guarded judgment |
| Meeting Prep | T−1h schedule | brief | guarded judgment |
| Competitive Intel | transcript/news event | note | guarded judgment |
| Enrichment | missing-fields event | fields | guarded judgment |
| Website De-anon | visitor identified | contact | guarded judgment |
| Outbound | lead signal from CRM | outreach copy | language-as-deliverable |
| Attribution | outbound touch/signup | numbers | deterministic pipeline |
| Multi-thread Flag | deal review/weekly | flag | deterministic pipeline |
| Pipeline Coverage | weekly schedule | numbers | deterministic pipeline |
| Coverage & Capacity | weekly schedule | numbers | deterministic pipeline |
| Comp & Quota | comp-period event | numbers | deterministic pipeline |
| Activity Capture | email/meeting event | rows (no model) | deterministic pipeline |

## Desk 2 — Marketing (17)

| Agent | Trigger | Deliverable | Tier (derived) |
|-------|---------|-------------|----------------|
| Paid Ads | daily pacing/ROAS schedule | bid actions (UNGATED) | neurosymbolic |
| SEO | daily/weekly audit schedule | audit + fixes | neurosymbolic |
| GEO | daily visibility schedule | visibility report | neurosymbolic |
| Coding | SEO-agent handoff event | code | neurosymbolic |
| Writer | weekly cron / keyword handoff | article | language-as-deliverable |
| LinkedIn | daily cron | post | language-as-deliverable |
| X (Twitter) | daily cron | post | language-as-deliverable |
| Hacker News | launch moment on-demand | comment/post | language-as-deliverable |
| YouTube | weekly cron | script/copy | language-as-deliverable |
| UGC Video | video request on-demand | video brief (model renders) | language-as-deliverable |
| Repurposing | new asset published | derived assets | language-as-deliverable |
| Newsletter | weekly send date | issue | language-as-deliverable |
| Reddit | daily scan | comment | language-as-deliverable |
| Competitor Intel | Slack mention / weekly | note | guarded judgment |
| Social Listening | brand/keyword mention event | flag | guarded judgment |
| Link Building | weekly prospect run | prospect list | guarded judgment |
| Influencer | campaign brief on-demand | shortlist | guarded judgment |

## Fleet shape (the pyramid check)

Roughly **6 deterministic · 22 guarded judgment · 9 language-as-deliverable ·
9 neurosymbolic**. The bulk is guarded/deterministic; only a handful reason. If a
planning session keeps landing on neurosymbolic, the gates are being escalated too
easily — recheck Gate 2 (can you draw the flowchart?) and the ambiguity test.
