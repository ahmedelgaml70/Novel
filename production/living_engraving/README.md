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
