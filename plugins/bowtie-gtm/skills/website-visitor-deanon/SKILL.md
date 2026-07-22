---
name: website-visitor-deanon
description: Use when you want to turn anonymous website traffic into named contacts and companies — for net-new lead gen (Awareness) or to spot which existing accounts are active or going quiet (Retention). Runs on the Growth (Verbiflow) MCP.
---

# Website Visitor De-anonymizer

Turn anonymous site visitors into named, routable contacts — then publish the result as a
shareable Bowtie Funnel deliverable instead of a dead CSV.

## Requires

The Growth (Verbiflow) MCP. If it isn't connected yet:

```bash
claude mcp add --transport stdio growth -- npx -y growth-mcp
```

Always call `growth_session_init` first (auth + workspace).

## Steps

1. **`growth_session_init`** — establish auth and workspace context.
2. **`growth_deanonymize_contacts`** — resolve anonymous traffic to contacts/companies.
3. **`growth_get_deanonymize_contacts_results`** — page the resolved rows (returns an `artifact_id`).
4. **`growth_enrich_emails` / `growth_fetch_person_profiles`** — fill in emails, titles, attributes.
5. **`growth_qualify_rows`** — score against the ICP; keep the A/B-fit rows only.
6. **Route by aim:**
   - **Awareness** — unknown companies → stage into a sequence or hand to sales.
   - **Retention** — filter to existing-customer domains → flag account-activity / at-risk
     signal for the success team.

## Repurpose (the Bowtie way)

Don't stop at the artifact. Render the qualified rows to a branded page and publish to labs:
`labs.bowtiefunnel.com/<client>/visitors-<week>/` — the client opens a URL, not a CSV.

## Notes

- **Bounded by design:** `growth_qualify_rows` caps at 500 rows per call.
- **Same tool, two aims:** new traffic = leads (Awareness); existing-customer domains =
  account signal (Retention). The MCP has no native retention tool — this reuse is the fill.
- Do not send, sequence, or mutate platform state unless the user explicitly asks.
