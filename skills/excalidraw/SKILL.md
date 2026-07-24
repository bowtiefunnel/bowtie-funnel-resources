---
name: excalidraw
description: Use when an agent needs to draw, edit, or refine diagrams on a live Excalidraw canvas — architecture/flow/sequence diagrams, iterative visual refinement via screenshots, Mermaid conversion, element-level CRUD, or .excalidraw/PNG/SVG export. Drives a local canvas server over plain CLI/REST (curl) by default, or the Excalidraw MCP tools if present. Requires a running canvas server (default http://127.0.0.1:3000); setup in Step 0.
---

# Excalidraw Skill

Draw and refine diagrams on a live Excalidraw canvas you can watch in the
browser. Works over plain `curl`/CLI by default (no MCP needed), or the
`excalidraw/*` MCP tools if they're loaded — same server either way.

## Step -1: Ask for the brand first (ALWAYS, before drawing)

Before drawing anything, get the brand this diagram should use — a diagram that
doesn't match the user's brand is a redraw. Ask **once**, up front:

> "What brand should this follow? Give me your stroke/text color, accent color,
> and font — or say 'default' for a neutral clean style, or point me at a brand
> file (e.g. `BRAND.md`)."

Turn the answer into a small **brand recipe** and apply it **directly on every
`create_element` / `batch_create_elements` call** — not as a fix-up pass after.
Map what they give you onto these properties:

| Recipe slot | Element property | Notes |
|---|---|---|
| Primary stroke/text | `strokeColor` on standard nodes + text | dark, high-contrast |
| Accent | `strokeColor` on key nodes + all arrows; light tint as key-node `backgroundColor` | one accent, used sparingly |
| Body font | `fontFamily` on every labeled shape/arrow | `2`=sans, `3`=mono, `1`=hand-drawn |
| Annotation | `strokeColor` on caption text | muted gray |

**Two defaults that hold for any brand** (keep unless told otherwise):

- `roughness: 0` on every shape and arrow — crisp lines, never sketchy.
- Set `fontFamily` on the **shape** in the same call that creates it. The canvas
  server carries the shape's `fontFamily`/`fontSize` into the bound label it
  generates — on **both** CLI/REST and MCP paths — so labels come out in the
  right font at creation; there's no separate "fix the labels after" step.

If the user says "default," use: dark navy `#1e293b` strokes/text, a single
accent for key nodes + arrows, `fontFamily: 2`, gray `#64748b` annotations.

**Worked example — a real brand recipe:** [`reference/brand-example.md`](reference/brand-example.md)
shows the Bowtie Funnel palette mapped to exact element properties. Copy its
structure, swap the hex/font values for the user's brand.

Export finished diagrams as both `.excalidraw` (editable source) and `.png`
(shareable) with the same kebab-case basename — to a `diagrams/` folder in the
working directory unless the user names a location.

## Step 0: Fresh canvas + fresh browser tab for every NEW diagram

Always draw against the live canvas server and open it in the user's browser so
they can watch the diagram take shape (the browser page is also required for
screenshots). Default server: `http://127.0.0.1:3000` (or `EXPRESS_SERVER_URL`).

The server holds ONE shared scene: all canvas tabs show the same live diagram,
so clearing for a new drawing blanks every canvas tab — the old diagram
"disappears". Every open canvas tab also auto-syncs its copy back to the server,
so a stale tab will resurrect the old diagram after you clear. Therefore each
**new** diagram gets the old one parked in its own permanent tab first:
**export old → open its PNG in a tab → snapshot → clear → new canvas tab.**
(Skip all of this when refining the diagram already on the canvas.)

Operation names in this file (`snapshot_scene`, `clear_canvas`, …) are the
canonical MCP names; in CLI/REST mode use their `curl` equivalents from the
quick-reference table below — same behavior either way.

1. Check: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/elements`
2. If not `200`, the canvas server isn't running — set it up once (see
   **Server setup** below), then `PORT=3000 nohup npm run canvas > /tmp/excalidraw-canvas.log 2>&1 &`
   from the cloned server directory.
3. If the canvas has elements, park the old diagram so it survives the wipe:
   - `export_scene` + `export_to_image` (png) to your `diagrams/` folder
     (kebab-case basename) if not already exported.
   - `open` that PNG — this tab is the old diagram's own browser window; it keeps
     showing it no matter what happens to the live canvas.
   - `snapshot_scene` (same name) so it can also be restored live later.
     Snapshots live in server memory and die with a server restart — the
     `.excalidraw`/`.png` exports are the durable copy; never rely on a
     snapshot alone.
4. `clear_canvas`, then open a **new** tab for the new drawing:
   `open http://127.0.0.1:3000`. Never reuse an old canvas tab — the user should
   close them (their content now lives in the PNG tab).
5. Verify the wipe stuck: `query_elements` should return 0 elements. If old
   elements reappeared, a stale canvas tab synced them back — ask the user to
   close older canvas tabs, then `clear_canvas` again and re-verify.

## Step 0.5: Determine Connection Mode

Two modes are available. **Default to CLI/REST** — plain `curl` against the
canvas server; no MCP server needed.

**CLI/REST mode** (default): HTTP endpoints at `http://127.0.0.1:3000` via
`curl`. Labels go in as `"label": {"text": "..."}` and inherit the shape's
`fontFamily`/`fontSize` server-side, so branded creation works identically to
MCP. Screenshots/exports come back as base64 JSON — decode to a file and Read
it (snippet in the REST workflow below).

**MCP mode** (optional): If the `excalidraw/*` MCP tools are available they work
too — same server, slightly different field names (`text` on shapes,
`startElementId`/`endElementId` on arrows), and screenshots return straight
into context. The one MCP-only capability is `export_to_excalidraw_url`
(excalidraw.com share link).

**Neither works? — Server setup (one time).** The canvas server isn't part of
this skill; it's the open-source `mcp-excalidraw-server` (upstream:
[github.com/yctimlin/mcp_excalidraw](https://github.com/yctimlin/mcp_excalidraw)).
Tell the user:
> The Excalidraw canvas server isn't running. To set it up once:
> 1. `git clone https://github.com/yctimlin/mcp_excalidraw && cd mcp_excalidraw`
> 2. `npm ci && npm run build`
> 3. `PORT=3000 npm run canvas`  (leave running; or background it)
> 4. Open `http://127.0.0.1:3000` in a browser so you can watch diagrams render
> 5. (Optional) Also wire up the MCP tools:
>    `claude mcp add excalidraw -s user -e EXPRESS_SERVER_URL=http://127.0.0.1:3000 -- node /path/to/mcp_excalidraw/dist/index.js`
>
> The CLI/REST path (this skill's default) needs only steps 1–4.

### MCP vs REST API Quick Reference

| Operation | MCP Tool | REST API Equivalent |
|-----------|----------|-------------------|
| Create elements | `batch_create_elements` | `POST /api/elements/batch` |
| Get all elements | `query_elements` | `GET /api/elements` |
| Get one element | `get_element` | `GET /api/elements/:id` |
| Update element | `update_element` | `PUT /api/elements/:id` |
| Delete element | `delete_element` | `DELETE /api/elements/:id` |
| Clear canvas | `clear_canvas` | `DELETE /api/elements/clear` |
| Describe scene | `describe_scene` | `GET /api/elements` (parse manually) |
| Export scene | `export_scene` | `GET /api/elements` (save to file) |
| Import scene | `import_scene` | `POST /api/elements/sync` |
| Snapshot | `snapshot_scene` | `POST /api/snapshots` |
| Restore snapshot | `restore_snapshot` | `GET /api/snapshots/:name` then `POST /api/elements/sync` |
| Screenshot | `get_canvas_screenshot` | `POST /api/export/image` (needs browser) |
| Viewport | `set_viewport` | `POST /api/viewport` (needs browser) |
| Export image | `export_to_image` | `POST /api/export/image` (needs browser) |
| Export URL | `export_to_excalidraw_url` | Only via MCP |

### Format Differences Between Modes (Critical)

1. **Labels**: MCP accepts `"text": "My Label"` on shapes (auto-converts). REST requires `"label": {"text": "My Label"}`.
2. **Arrow binding**: MCP accepts `startElementId`/`endElementId`. REST requires `"start": {"id": "..."}` / `"end": {"id": "..."}`.
3. **fontFamily**: Must be a string (e.g. `"1"`) or omit entirely. Never pass a number.
4. **Updating labels via REST**: Re-include `"label"` in the PUT body to ensure it renders correctly after updates.

---

## Coordinate System

The canvas uses a 2D coordinate grid: **(0, 0) is the origin**, **x increases rightward**, **y increases downward**. Plan your layout before writing any JSON.

**General spacing guidelines:**
- Vertical spacing between tiers: 80–120px (enough that arrows don't crowd labels)
- Horizontal spacing between siblings: 40–60px minimum
- Shape width: `max(160, labelCharCount * 9)` to prevent text truncation
- Shape height: 60px single-line, 80px two-line labels
- Background/zone padding: 50px on all sides around contained elements

---

## Layout Anti-Patterns (Critical for Complex Diagrams)

These are the most common mistakes that produce unreadable diagrams. Avoid all of them.

### 1. Do NOT use `label.text` (or `text`) on large background zone rectangles

When you put a label on a background rectangle, Excalidraw creates a bound text element centered in the middle of that shape — right where your service boxes will be placed. The text overlaps everything inside the zone and cannot be repositioned.

**Wrong:**
```json
{"id": "vpc-zone", "type": "rectangle", "x": 50, "y": 50, "width": 800, "height": 400, "text": "VPC (10.0.0.0/16)"}
```

**Right — use a free-standing text element anchored at the top of the zone:**
```json
{"id": "vpc-zone", "type": "rectangle", "x": 50, "y": 50, "width": 800, "height": 400, "backgroundColor": "#e3f2fd"},
{"id": "vpc-label", "type": "text", "x": 70, "y": 60, "width": 300, "height": 30, "text": "VPC (10.0.0.0/16)", "fontSize": 18, "fontWeight": "bold"}
```

The free-standing text element sits at the top corner of the zone and doesn't interfere with elements placed inside.

### 2. Avoid cross-zone arrows in complex diagrams

An arrow from an element in one layout zone to an element in a distant zone will draw a long diagonal line crossing through everything in between. In a multi-zone infra diagram this produces an unreadable tangle of spaghetti.

**Design rule:** Keep arrows within the same zone or tier. To show cross-zone relationships, use annotation text or separate the zones so their edges are adjacent (no elements between them), and route the arrow along the edge.

If you must connect across zones, use an elbowed arrow that travels along the perimeter — never through the middle of another zone.

### 3. Use arrow labels sparingly

Arrow labels are placed at the midpoint of the arrow. On short arrows, they overlap the shapes at both ends. On crowded diagrams, they collide with nearby elements.

- Only add an arrow label when the relationship name is genuinely essential (e.g., protocol, port number, data direction).
- If you're adding a label to every arrow, reconsider — it usually adds visual noise, not clarity.
- Keep arrow labels to ≤ 12 characters. Prefer omitting them entirely on dense diagrams.

---

## Quality: Why It Matters (and How to Check)

Excalidraw diagrams are visual communication. If text is cut off, elements overlap, or arrows cross through unrelated shapes, the diagram becomes confusing and unprofessional — it defeats the whole purpose of drawing it. So after every batch of elements, verify before adding more.

### Quality Checklist

After each `batch_create_elements` / `POST /api/elements/batch`, take a screenshot and check:

1. **Text truncation** — Is all label text fully visible? Truncated text means the shape is too small. Increase `width` and/or `height`.
2. **Overlap** — Do any shapes share the same space? Background zones must fully contain children with padding.
3. **Arrow crossing** — Do arrows cut through unrelated elements? If yes, route them around using curved or elbowed arrows (see Arrow Routing below).
4. **Arrow-label overlap** — Arrow labels sit at the midpoint. If they overlap a shape, shorten the label or adjust the arrow path.
5. **Spacing** — At least 40px gap between elements. Cramped layouts are hard to read.
6. **Readability** — Font size ≥ 16 for body text, ≥ 20 for titles.
7. **Zone label placement** — If you used `text`/`label.text` on a background zone rectangle, the zone label will be centered in the middle of the zone, overlapping everything inside. Fix: delete the bound text element and add a free-standing text element at the top of the zone instead (see Layout Anti-Patterns above).

If you find any issue: **stop, fix it, re-screenshot, then continue.** Say "I see [issue], fixing it" rather than glossing over problems. Only proceed once all checks pass.

---

## Workflow: Drawing a New Diagram

### Mermaid vs. Direct Creation — Which to Use?

**Use `create_from_mermaid`** when: the user already has a Mermaid diagram, or the structure maps cleanly to a flowchart/sequence/ER diagram with standard Mermaid syntax. It's fast and handles conversion automatically, though you get less control over exact layout.

**Use `batch_create_elements` directly** when: you need precise layout control, the diagram type doesn't map to Mermaid well (e.g., custom architecture, annotated cloud diagrams), or you want elements positioned in a specific coordinate grid.

### MCP Mode (optional — only if the excalidraw MCP tools are loaded)

1. Call `read_diagram_guide` for design best practices (colors, fonts, anti-patterns).
2. Plan your coordinate grid on paper/in comments — map out tiers and x-positions before writing JSON.
3. New diagram → you already snapshotted, cleared, and opened a new tab in Step 0.
4. Use `batch_create_elements` — create shapes and arrows in one call. Custom `id` fields (e.g. `"id": "auth-svc"`) make later updates easy.
5. Set shape widths using `max(160, labelLength * 9)`. Use `text` field for labels.
6. Bind arrows with `startElementId` / `endElementId` — they auto-route to element edges.
7. `set_viewport` with `scrollToContent: true` to auto-fit.
8. `get_canvas_screenshot` → run Quality Checklist → fix issues before next iteration.

**MCP element + arrow example — brand defaults set inline, not fixed up after:**
```json
{"elements": [
  {"id": "lb", "type": "rectangle", "x": 300, "y": 50, "width": 180, "height": 60, "text": "Load Balancer", "fontFamily": 2, "roughness": 0, "strokeColor": "#04246b", "backgroundColor": "#ffffff"},
  {"id": "svc-a", "type": "rectangle", "x": 100, "y": 200, "width": 160, "height": 60, "text": "Web Server 1", "fontFamily": 2, "roughness": 0, "strokeColor": "#04246b", "backgroundColor": "#ffffff"},
  {"id": "svc-b", "type": "rectangle", "x": 450, "y": 200, "width": 160, "height": 60, "text": "Web Server 2", "fontFamily": 2, "roughness": 0, "strokeColor": "#04246b", "backgroundColor": "#ffffff"},
  {"id": "db", "type": "rectangle", "x": 275, "y": 350, "width": 210, "height": 60, "text": "PostgreSQL", "fontFamily": 2, "roughness": 0, "strokeColor": "#6B29F7", "backgroundColor": "#f4effe"},
  {"type": "arrow", "x": 0, "y": 0, "startElementId": "lb", "endElementId": "svc-a", "roughness": 0, "strokeColor": "#6B29F7"},
  {"type": "arrow", "x": 0, "y": 0, "startElementId": "lb", "endElementId": "svc-b", "roughness": 0, "strokeColor": "#6B29F7"},
  {"type": "arrow", "x": 0, "y": 0, "startElementId": "svc-a", "endElementId": "db", "roughness": 0, "strokeColor": "#6B29F7"},
  {"type": "arrow", "x": 0, "y": 0, "startElementId": "svc-b", "endElementId": "db", "roughness": 0, "strokeColor": "#6B29F7"}
]}
```
`fontFamily: 2` on the shape is enough — the server now carries it into the
bound label it generates, so the label renders in the brand font immediately.

### CLI/REST Mode (default)

1. Plan your coordinate grid first.
2. New diagram → you already parked, cleared, and opened a new tab in Step 0.
3. Create elements with `POST /api/elements/batch`. Use `"label": {"text": "..."}`
   for labels — the label inherits the shape's `fontFamily`/`fontSize`
   server-side, so brand props on the shape are enough.
4. Bind arrows with `"start": {"id": "..."}` / `"end": {"id": "..."}`.
5. Screenshot → decode → Read → run Quality Checklist:

```bash
# screenshot (browser tab must be open); returns {"success","format","data"(base64)}
curl -s -X POST http://127.0.0.1:3000/api/export/image \
  -H "Content-Type: application/json" -d '{"format": "png"}' \
  | python3 -c "import json,sys,base64; open('/tmp/canvas.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'].split(',')[-1]))"
# then Read /tmp/canvas.png
```

To save the finished PNG deliverable, run the same decode with your
`diagrams/<name>.png` path. For the editable source:

```bash
# .excalidraw export
curl -s http://127.0.0.1:3000/api/elements | python3 -c "
import json,sys
els=json.load(sys.stdin)
json.dump({'type':'excalidraw','version':2,'source':'cli','elements':els,'appState':{}},open('diagram.excalidraw','w'))"
```

**REST API element + arrow example:**
```bash
curl -X POST http://127.0.0.1:3000/api/elements/batch \
  -H "Content-Type: application/json" \
  -d '{
    "elements": [
      {"id": "svc-a", "type": "rectangle", "x": 100, "y": 100, "width": 160, "height": 60, "label": {"text": "Service A"}},
      {"id": "svc-b", "type": "rectangle", "x": 400, "y": 100, "width": 160, "height": 60, "label": {"text": "Service B"}},
      {"type": "arrow", "x": 0, "y": 0, "start": {"id": "svc-a"}, "end": {"id": "svc-b"}, "label": {"text": "calls"}}
    ]
  }'
```

---

## Arrow Routing — Avoid Overlaps

Straight arrows can cross through elements in complex diagrams. Use curved or elbowed arrows when needed:

**Curved arrows** (smooth arc over obstacles):
```json
{
  "type": "arrow", "x": 100, "y": 100,
  "points": [[0, 0], [50, -40], [200, 0]],
  "roundness": {"type": 2}
}
```
The intermediate waypoint `[50, -40]` lifts the arrow upward. `roundness: {type: 2}` makes it smooth.

**Elbowed arrows** (right-angle / L-shaped routing):
```json
{
  "type": "arrow", "x": 100, "y": 100,
  "points": [[0, 0], [0, -50], [200, -50], [200, 0]],
  "elbowed": true
}
```

**When to use which:**
- Fan-out (one source → many targets): curved arrows with waypoints spread to avoid overlapping
- Cross-lane (connecting to side panels): elbowed arrows that go up, then across, then down
- Long horizontal connections: curved arrows with a slight vertical offset

**Rule:** If an arrow would pass through an unrelated shape, add a waypoint to route around it.

**Points format**: Both `[[x, y], ...]` tuples and `[{"x": ..., "y": ...}]` objects are accepted; both are normalized automatically.

---

## Workflow: Iterative Refinement

Using `describe_scene` and `get_canvas_screenshot` together is what makes this skill powerful.

- **`describe_scene`** → returns structured text: element IDs, types, positions, labels, connections. Use this when you need to know *what's on the canvas* before making programmatic updates (find IDs, understand bounding boxes).
- **`get_canvas_screenshot`** → returns a PNG image of the actual rendered canvas. Use this for *visual quality verification* — it shows you exactly what the user sees, including truncation, overlap, and arrow routing.

**Feedback loop (MCP):**
```
batch_create_elements
  → get_canvas_screenshot → "text truncated on auth-svc"
  → update_element (increase width) → get_canvas_screenshot → "overlap between auth-svc and rate-limiter"
  → update_element (reposition) → get_canvas_screenshot → "all checks pass"
  → proceed
```

**Feedback loop (REST):**
```
POST /api/elements/batch
  → POST /api/export/image → save PNG → evaluate
  → PUT /api/elements/:id (fix issues) → re-screenshot → evaluate
  → proceed
```

---

## Workflow: Refine an Existing Diagram

1. `describe_scene` to understand current state — note element IDs and positions.
2. Identify elements by `id` or label text (not by x/y coordinates — they change).
3. `update_element` to resize/recolor/move; `delete_element` to remove.
4. `get_canvas_screenshot` to confirm the change looks right.
5. If updates fail: check the ID exists with `get_element`; check it's not locked with `unlock_elements`.

---

## Workflow: Mermaid Conversion

For converting existing Mermaid diagrams to Excalidraw:

**MCP mode:**
```
create_from_mermaid(mermaidDiagram: "graph TD\n  A --> B\n  B --> C")
```
After conversion, call `set_viewport` with `scrollToContent: true` and `get_canvas_screenshot` to verify layout. If the auto-layout is poor (nodes crowded, edges crossing), identify problem elements with `describe_scene` and reposition with `update_element`.

**REST mode:**
```bash
curl -X POST http://127.0.0.1:3000/api/elements/from-mermaid \
  -H "Content-Type: application/json" \
  -d '{"mermaid": "graph TD\n  A --> B\n  B --> C"}'
```

---

## Workflow: File I/O

- Export to `.excalidraw`: `export_scene` with optional `filePath`
- Import from `.excalidraw`: `import_scene` with `mode: "replace"` or `"merge"`
- Export to image: `export_to_image` with `format: "png"` or `"svg"` (requires browser open)
- Share link: `export_to_excalidraw_url` — encrypts scene, returns shareable excalidraw.com URL
- CLI export: `node scripts/export-elements.cjs --out diagram.elements.json`
- CLI import: `node scripts/import-elements.cjs --in diagram.elements.json --mode batch|sync`

## Workflow: Snapshots

1. `snapshot_scene` with a name before risky changes.
2. Make changes, evaluate with `describe_scene` / `get_canvas_screenshot`.
3. `restore_snapshot` to roll back if needed.

## Workflow: Duplication

`duplicate_elements` with `elementIds` and optional `offsetX`/`offsetY` (default: 20, 20). Useful for repeated patterns or copying layouts.

## Error Recovery

- **Elements not appearing?** Check `describe_scene` — they may have been created off-screen. Use `set_viewport` with `scrollToContent: true`.
- **Arrow not connecting?** Verify element IDs with `get_element`. Make sure `startElementId`/`endElementId` (MCP) or `start.id`/`end.id` (REST) match existing element IDs.
- **Canvas in a bad state?** `snapshot_scene` first, then `clear_canvas` and rebuild. Or `restore_snapshot` to go back.
- **Element won't update?** It may be locked — call `unlock_elements` first.
- **Layout looking wrong after import?** Use `describe_scene` to inspect actual positions, then batch-update positions.
- **Duplicate text elements / element count doubling?** The frontend has an auto-sync timer that periodically sends the full Excalidraw scene back to the server (overwriting). Excalidraw internally generates a bound text element for every shape that has `label.text`. If you clear and re-send elements, Excalidraw may re-inject its cached bound texts, causing duplicates. To clean up: (1) use `query_elements` / `GET /api/elements` to find elements of `type: "text"` with a `containerId`; (2) delete the unwanted ones with `delete_element`; (3) wait a few seconds for auto-sync to settle before exporting. The safest approach is to **never put labels on background zone rectangles** — use free-standing text elements instead.

---

## References

- [`reference/cheatsheet.md`](reference/cheatsheet.md): Complete MCP tool list (26 tools) + REST API endpoints + payload shapes.
- [`reference/brand-example.md`](reference/brand-example.md): A worked brand recipe (Bowtie Funnel) mapped to exact element properties — copy the structure, swap in your brand.
- `scripts/*.cjs`: Zero-dependency Node helpers for the REST path (`healthcheck`, `create-element`, `update-element`, `delete-element`, `clear-canvas`, `export-elements`, `import-elements`).
