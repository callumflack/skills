---
name: claim-diagram-card
description: Create or update mnemonic diagram cards for KB Claim notes. Use when the user asks to diagram, illustrate, make a Stutz-like card, make an ASCII memory diagram, or add a flash-card-style visual to a wiki claim.
created: 2026-05-04
modified: 2026-05-04
---

# Claim Diagram Card

Use this for remembering system insights visually.

## Output

Update the existing claim note in place. Add or replace one `## Diagram Card` section containing:

1. A very simple ASCII diagram.
2. One rough hand-drawn illustration embedded with Obsidian image syntax at width 600:

```md
![[image-name.jpg|600]]
```

Do not create a separate wiki page unless Callum asks. Do not add front/back flash-card text unless Callum asks. Do not use Mermaid, Excalidraw, TLDraw, or living JSON diagrams unless Callum asks.

## Read

1. Open the target `wiki/* — Claim*.md` note.
2. Identify the smallest mechanism worth remembering.
3. If a `## Diagram Card` already exists, preserve Callum's retained structure and replace only the stale diagram material.

## ASCII

Keep it dumb and memorable. Prefer one of these shapes:

```text
before -> mechanism -> after
```

```text
bad loop:
x -> y -> pain

good loop:
a -> b -> less pain
```

Rules:

- 2-8 lines is usually enough.
- No decorative box art.
- Use the claim's own words when possible.
- Optimize for recall, not completeness.

## Betterments

Watch for these failure modes:

- Image text lies: generated handwriting may misspell or mutate labels. Keep labels short and verify visually.
- Too much concept per card: one mechanism, not a map of the note.
- Style drift: yellow card, black marker, ugly mnemonic, no polished diagram.
- False precision: ASCII is a recall hook, not a second explanation.
- Overuse: only claims with a visible mechanism deserve cards.

Use this visual grammar when it fits:

```text
seed / sprout = local system grows after install
fork          = wrong side vs right side
loop          = feedback / repair
monster       = failure mode
filter        = selection / constraint
copy machine  = commoditized thing
```

## Illustration

Generate one raster image when image generation is available.

Style:

- warm yellowed index-card or notebook paper
- black felt-tip marker
- jittery real handwriting
- rough arrows
- scribbly imperfect lines
- mnemonic, not polished
- no clean vector look
- no gradients

Prompt shape:

```text
Create a rough real-handwriting flash-card diagram on a warm yellowed index-card paper background. It should look like a messy photographed notebook sketch made with a black felt-tip marker: jittery handwritten lettering, uneven baseline, imperfect spacing, shaky arrows, scribbly thick lines, visible crossed-over strokes, not clean vector art.

Subject: "[claim title]".

Show: [3-5 visual elements from the claim mechanism].

Use only black ink on yellowish paper. Make it intentionally hand-scrawled, organic, and mnemonic, not polished, not typographic, not digital-looking.
```

After generation:

1. Keep the original generated image where the tool saved it.
2. Copy/compress it into `_media/` with a descriptive filename.
3. Keep the vault copy under 1 MB. Do not embed an over-1MB generated PNG in a wiki note.
4. Embed it in the claim note as `![[filename.jpg|600]]`.

## Sub-1MB Image Rule

The image generator usually returns a large PNG. The vault copy should usually be a stripped JPEG.

Preferred command:

```bash
magick input.png -resize '1600x1600>' -strip -quality 82 '_media/descriptive-name.jpg'
```

Verify size:

```bash
ls -lh '_media/descriptive-name.jpg'
```

If it is still over 1 MB, lower quality or resize until it is under 1 MB:

```bash
magick input.png -resize '1400x1400>' -strip -quality 72 '_media/descriptive-name.jpg'
```

Hard fallback:

```bash
magick input.png -resize '1200x1200>' -strip -quality 68 '_media/descriptive-name.jpg'
```

Prefer `jpg` for these yellow-card diagrams. Use `png` only if the compressed PNG is under 1 MB and visibly better.

If image generation is unavailable, write the exact image prompt under the diagram card and say the image was not generated.

## Completion

For a wiki note update, pass the wiki write gate:

- allowed frontmatter only
- `modified: YYYY-MM-DD`
- internal links remain wikilinks
- `_INDEX` updated only if the page summary changed
- `LOG.md` appended
