# Living Engraving Renderer — Canonical Prototype Renderer

This directory contains the current reproducible JavaScript renderer used by the Frankenstein prototype.

The renderer is **not evidence that every visual Item is final-approved**. Quality/selection is governed separately by:

- `../../docs/production/CURRENT_METHOD.md`
- `../../docs/production/ITEM_GOVERNANCE.md`
- `../../episodes/frankenstein-prototype/item_inventory.json`
- `../../episodes/frankenstein-prototype/source_registry.json`
- `../../episodes/frankenstein-prototype/asset_decisions.json`

Do not add alternate active renderers beside `render_current.js`. Replace the canonical implementation when a method change is accepted; preserve history in Git and the version logs.

Generated frames, WAV files and MP4 masters are runtime/output artifacts and are not the source of truth.

## Reproduce the V5.4 repair experiment

Use Node 22 LTS and FFmpeg, then `npm ci`, `npm run validate`, `npm run render`, `npm run review` from this directory. Open `review-output/index.html` for every-Item inspection. The movie is `living_engraving_current.mp4`. Both are runtime artifacts ignored by Git. `LICENSES.md` and `asset_manifest.json` record the bundled font and city plate. See the canonical guide for partial-frame rendering and the episode review for remaining art defects.

V5.3 was rejected by the user. Read `../../docs/memory/STATE.md` and the episode
quality review before continuing. Run `npm test` for geometry constraints. The
4-second macro is a diagnostic candidate; the full film remains blocked for
visual redesign. Unsupported discharge cues are removed.
