---
name: agent-anatomy
description: Use when scaffolding a new AI agent's project folder, or when an existing agent's files (prompt, tools, procedures, scheduled jobs, integrations) are scattered in one directory with no structure. Organizes any agent folder into a filesystem-first layout.
---

# agent-anatomy

Organize any AI agent's project into a **filesystem-first** layout: one agent =
one folder, every capability = a file in a conventionally-named subfolder.
Language-agnostic — tools can be Python, TypeScript, anything.

**Core principle: names come from file paths, not config.** `tools/issue_refund.py`
*is* the tool `issue_refund`. Never add a `name:` field to restate the path.

## The convention

`instructions.md` (the always-on system prompt) is the one **required** file.
Everything else is an optional, canonically-named subfolder. Classify each file:

| A file that… | goes in | notes |
|---|---|---|
| is the system prompt / persona / instructions | **`instructions.md`** | rename `prompt.txt`, `system.md`, etc. to this |
| does a discrete action the agent invokes | `tools/` | filename = tool name |
| is a markdown procedure followed on demand | `skills/` | e.g. `how-to-escalate.md` |
| runs on a timer / cron / "every morning" | `schedules/` | |
| receives inbound messages (webhook, bot) | `channels/` | Slack, HTTP, Discord |
| calls an outbound third-party API / service | `connections/` | external APIs, MCP servers |
| is a nested agent | `subagents/<name>/` | recurse — same convention |
| is durable state the agent reads back | `memory/` | |
| is shared code imported by tools/jobs | `lib/` | utils/formatters — not a capability |
| is dev scratch / TODOs / personal notes | leave in place | flag it, don't move |

## Two modes — detect first

**Empty or missing folder → Scaffold. Has files → Reorganize.**

### Scaffold
1. Ask once: *what does this agent do?* (purpose + capabilities)
2. Write a real `instructions.md` for that purpose — not a placeholder.
3. Create **only** the subfolders that purpose needs, each with **one real starter file**
   (a working tool stub, a procedure, etc.).

### Reorganize
1. **Inventory** every file. Skip `.git/`, `node_modules/`, `.venv/`, lockfiles, build output.
2. **Classify** each against the table.
3. **Present a move plan as a table, then STOP for approval:**
   ```text
   current path        →  new path                   reason
   prompt.txt          →  instructions.md            system prompt (required file)
   refund_tool.py      →  tools/issue_refund.py      discrete action; path = tool name
   how_to_escalate.md  →  skills/how-to-escalate.md  on-demand procedure
   daily_report.py     →  schedules/daily_report.py  cron job
   slack.py            →  channels/slack.py          inbound channel
   utils.py            →  lib/utils.py               shared helper, not a capability
   notes.txt           →  (leave in place)           dev scratch — ask first
   ```
4. **Apply only after approval.** Then move the files.

## Hard rules

- **Never delete anything.** Reorganizing is moving, not removing.
- **Never move without an approved plan** (reorganize mode).
- **No empty folders** — a subfolder exists only once it holds a real file.
- **Exact folder names only** — `skills/` not `knowledge/`, `schedules/` not `jobs/`,
  `channels/` not `integrations/`. Inventing synonyms defeats a *shared* convention.
- **The prompt is always `instructions.md`** — rename any variant to it.
- **No `name:` fields** duplicating the path.
- **Inside a git repo, move with `git mv`.** Never overwrite an existing destination —
  flag the collision in the plan instead.
