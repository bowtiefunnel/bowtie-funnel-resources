# Brand recipe — worked example (Bowtie Funnel)

**This is an example, not a mandate.** It shows how to turn one brand's colors
and fonts into an exact Excalidraw element recipe so every generated diagram
comes out on-brand and identical. Copy the *structure*; swap the hex/font values
below for whatever brand the user gave you in Step -1. If the user said
"default," use the neutral palette from the skill's Step -1 instead.

The recipe below is the Bowtie Funnel palette.

## Element defaults (apply to every element)

| Property | Value | Why |
|---|---|---|
| `roughness` | `0` | Crisp "architect" lines — never hand-drawn sketchy (default is 1; always override) |
| `fontFamily` | `2` (helvetica/sans) | Closest to DM Sans. Excalidraw's default for bound labels is 5 (Excalifont, hand-drawn) — always override |
| `strokeWidth` | `2` | Uniform weight everywhere |

## Color mapping (Bowtie Funnel hex values)

| Use | Property values |
|---|---|
| Key / emphasis node | `strokeColor: #6B29F7`, `backgroundColor: #f4effe` (light purple wash) |
| Standard node | `strokeColor: #04246b`, `backgroundColor: #ffffff` or `#faf9f7` |
| Start/end or external actor | ellipse, `strokeColor: #04246b`, `strokeStyle: dashed`, white fill |
| Arrows | `strokeColor: #6B29F7` |
| Title text | `strokeColor: #04246b` (Navy), fontSize 30 |
| Eyebrow label | `strokeColor: #6B29F7` (Purple), `fontFamily: 3` (mono), UPPERCASE, fontSize 14 |
| Annotation / caption text | `strokeColor: #6b6760` (Gray), fontSize 13 |
| Node labels | Navy on white/paper nodes; Purple on the light-purple key node; fontSize 16–18 |

Never use Cyan `#17b5e7`, Gold, or green as text — fills/borders/dots only (they fail contrast as text on white). This is a Bowtie Funnel rule; apply the equivalent contrast rule for the user's own low-contrast accents.

## Layout rules

- Flow left → right; fan-outs stacked vertically with even spacing (e.g. 160px between centers).
- Node sizes: main nodes ~280×120, output nodes ~340×100. Width ≥ `labelChars × 9`.
- Keep node labels to ≤ 2 short lines; details go in a Gray annotation text element
  placed **below** the box (x = box x + 2, y = box bottom + 16), never inside it.
- Eyebrow at top-left, title directly under it, diagram starts ~60px below the title.
- Number sequential outputs in the label ("1 · …", "2 · …") instead of labeling arrows.
- Bind arrows with `startElementId`/`endElementId`; no arrow labels unless essential.

## Known MCP gotchas (this setup)

1. **Bound labels inherit `fontFamily`/`fontSize` from the shape automatically**
   — set `fontFamily: 2` alongside `text` in the same `create_element`/
   `batch_create_elements` call and the generated bound label matches at
   creation time (the MCP server carries both through into the label it hands
   the frontend). No post-creation query-and-fix pass needed.
2. **The frontend auto-sync duplicates bound labels** — after creating or editing
   labeled shapes, query text elements and delete duplicates (same text, same
   containerId) and orphans (`containerId: null` copies sitting mid-canvas).
3. **You can't reliably edit a bound label's text after creation** — the frontend
   re-asserts the old text. Delete the shape + its label + its arrows and recreate
   with a **new id** (same id resurrects stale state).
4. **Resizing a box does not re-route its arrows** — delete and recreate the arrows
   so bindings recompute.
5. Always finish with `get_canvas_screenshot` and check: no truncation, no strays,
   arrows touch box edges, no hand-drawn font anywhere.

## Export convention

Save finished diagrams to a `diagrams/` folder (or wherever the user names) as both `.excalidraw` (editable
source) and `.png` (shareable), same basename, kebab-case.
