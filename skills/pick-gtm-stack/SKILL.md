---
name: pick-gtm-stack
description: Use when choosing which GTM tools to use for a task, play, or client engagement — "what tools should I use for X", "build a stack for this play", "which tool does Y", or when designing an outbound, inbound, nurture, or retention motion and the tool choices aren't settled. Recommends from the mapped Bowtie Funnel tool stack instead of guessing from training data.
---

# Pick GTM Stack

## Overview

Given a GTM task or play, recommend the minimal set of tools that covers it —
selected from the Bowtie Funnel tool stack, not from training data.

**The recall dataset lives in ONE place — fetch it, never reproduce from memory:**

```
https://labs.bowtiefunnel.com/tools/tools.json
```

(Working inside the `bowtie-funnel-resources` repo? Read `docs/tools/tools.json`
directly.) Every tool in it carries: `name`, `category` (the job it does),
`lifecycle` (the customer-lifecycle stages it serves: awareness, education,
selection, mutual commit, onboarding, retention, expansion), `workflows_used`
(how many of the 48 mapped workflows use it — proof it's battle-tested),
`description`, `what_it_does`, and `gtm_impact`. The human-readable version is
at <https://labs.bowtiefunnel.com/tools/>.

## When to use

- Designing a play and deciding which tools run it
- "What should I use for cold email / de-anon / enrichment / …?"
- Auditing an existing stack for overlap or gaps
- Scoping tooling for a client engagement

Not for: building or coding the tools themselves, or comparing vendors outside
the mapped stack (say so and fall back to research instead of inventing entries).

## Steps

1. **Classify the task.** Which lifecycle stage(s) does the play target
   (awareness → expansion)? Which jobs does it need (the dataset's categories:
   Sourcing & TAM, Data & Enrichment, CRM, Email Outreach, LinkedIn & Social,
   Signals & De-anon, AI & LLM, Content & Design, Meetings & Calling,
   RevOps & Analytics)?
2. **Fetch the dataset.** `curl -s https://labs.bowtiefunnel.com/tools/tools.json`.
   It is the source of truth and evolves with the stack — a recommendation made
   from memory is stale by definition.
3. **Filter, then rank.** Keep tools whose `lifecycle` intersects the play's
   stages and whose `category` matches a needed job. Rank candidates within a
   job by `workflows_used` — higher means proven across more of the 48 mapped
   workflows.
4. **Propose a minimal stack.** One tool per job unless the play genuinely needs
   redundancy. For each pick: the job it fills, its `what_it_does`, and its
   `gtm_impact`. Then list the close alternatives **NOT chosen and why** — the
   not-used list keeps stacks from bloating.
5. **Flag gaps honestly.** If no tool in the dataset covers a needed job, say
   "not in the mapped stack" and recommend researching — never invent an entry
   or pass off an adjacent tool as a fit.

## Common mistakes

- **Recommending from training data** instead of fetching `tools.json` — the
  stack and its usage counts change; the JSON is current, memory isn't.
- **Stacking overlapping tools** for one job (e.g. two cold-email senders) with
  no stated reason.
- **Ignoring `workflows_used`** — a tool used in 32 of 48 workflows is a safer
  default than one used in 1.
- **Answering a specific job with "All stages" infrastructure** — HubSpot being
  everywhere doesn't make it the answer to "what finds lookalike accounts?"
- **Silently dropping the lifecycle lens** — an awareness play staffed with
  retention tools (or vice versa) is the exact failure this skill exists to catch.
