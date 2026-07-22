---
name: buying-intent-miner
description: Use when you want people already showing intent — engaging with LinkedIn posts, comments, and reactions on your topic — surfaced as a warm list before any cold touch (Awareness), or to catch client-account activity (Expansion). Runs on the Growth (Verbiflow) MCP.
---

# Buying-Intent Miner

It mines LinkedIn posts, comments, and reactions to surface people showing intent, before a single cold email.

## Requires

The Growth (Verbiflow) MCP. If it isn't connected yet:

```bash
claude mcp add --transport stdio growth -- npx -y growth-mcp
```

Always call `growth_session_init` first (auth + workspace).

## Steps

1. `growth_session_init` — auth + workspace.
2. `growth_linkedin_search_posts` — find posts on your topic.
3. `growth_linkedin_get_post_comments` / `growth_linkedin_get_post_reactions` — pull the people engaging.
4. `growth_fetch_person_comments` / `growth_fetch_person_reactions` — deepen the intent signal per person.
5. Enrich, then sequence with a hook referencing what they engaged with.

## Repurpose (the Bowtie way)

Publish the warm-engager list to a labs page the client can see, tied to the campaign topic.

## Notes

- Do not send, sequence, or mutate platform state unless the user explicitly asks.
