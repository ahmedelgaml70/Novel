# Current project memory

Updated: 2026-10-07. Repository: ahmedelgaml70/Novel.

## Outcome and current status

The goal remains a directed, understandable, approximately three-minute novel experience.

Frankenstein V5.3 remains **USER_REJECTED** for style, anatomy, staging, physical behavior and insufficient real action. That rejection is preserved and its moving-still choices are not approved standards.

**V5.4.1 changes the active technical direction:** the ready-rigged real-animation proof passes. A free Quaternius humanoid with ready skeletal animation clips was rendered through Three.js to a deterministic 9-second H.264 proof. Real joint-level character animation is now the baseline architecture for performance shots.

## Authoritative requirements

- Use ready free assets before building rigs, animation cycles, environments or props.
- Do not fake character action with still-image translation, zoom or camera movement.
- Every runtime asset is inventoried before the planner depends on it.
- Final choreography binds explicit approved clip names after inventory; fuzzy semantic matching is discovery-only.
- Story/period/source fidelity and Item-level quality gates remain active.
- A technically working rig does not approve character design, costume, environment, art direction or final acting.

## What is now proven

- ready rigged humanoid loading;
- 86 ready runtime animation clips in the tested development GLB;
- two independently animated actors;
- real locomotion, interaction and reaction clips;
- deterministic Three.js/WebGL frame capture;
- 1280×720 / 24 fps / 9-second MP4 output;
- no custom rig or custom core animation required.

## Next work, in order

1. Keep V5.4.1 skeletal motion unchanged as the baseline.
2. Search ready free period-appropriate outfits/character variants.
3. Add a ready modular environment and relevant props.
4. Rebuild one Frankenstein beat using those real actors and ready environment.
5. Compare simple toon/outline versus progressively stronger engraving treatment while keeping motion readable.
6. Only after one complete beat passes visual/story review should we scale to additional shots and the three-minute film.

## Current key records

- `docs/experiments/E-VID-006_FINDINGS.md` — actual skeletal-animation proof and runtime inventory findings.
- `docs/production/READY_FREE_ASSET_STRATEGY.md` — ready-free-first policy.
- `docs/production/READY_ASSET_INGESTION_GATE.md` — runtime inventory gate.
- `production/knowledge/ready_free_asset_sources.json` — vetted asset ecosystems and pinned development rig.
- `production/knowledge/lessons.json` — reusable system lessons.
- `episodes/frankenstein-prototype/quality_review.json` — unresolved historical film-quality defects.

Automated checks validate structure/mechanics/evidence integrity. They do not certify artistic quality or human comprehension.
