# Standards

These standards are the lens through which every design proposal and experiment is judged.

## Product test

A successful output should feel like a deliberately directed, approximately three-minute cinematic adaptation of a novel—not a generic summary with illustrative media.

## Core creative standards

### Story
- A viewer unfamiliar with the novel should understand the essential narrative.
- Compression must preserve causal clarity.
- Important source facts must not be casually invented or contradicted.
- The adaptation may omit, merge, or compress material when doing so preserves the chosen story experience.

### Immersion
- The viewer should feel situated inside a coherent perspective.
- POV changes must be narratively motivated.
- Visuals, dialogue, inner voice, narration, sound, and silence should share the storytelling load.

### Visual direction
- Every shot should have a narrative or emotional job.
- Generic visual filler is a defect.
- Character, environment, era, object, lighting, and motif continuity matter across the full film.
- Motion should serve the story rather than merely prove that something is moving.

### Audio
- Narration should not duplicate what can already be understood from image and sound.
- Dialogue, inner voice, Foley, ambience, music, and silence are separate storytelling tools.
- Speech intelligibility is a hard requirement.

### Rights and provenance
- The exact source/edition/translation used must be recorded.
- Rights confidence is a publication gate.
- Asset provenance must be retainable.
- Public-domain status of an original work must not be assumed to cover modern translations, editions, illustrations, recordings, or adaptations.

### Reproducibility
- Important prompts, settings, decisions, inputs, assets, timings, versions, and QC results must be stored with the project.
- A production should be understandable and revisable months later.

## Hard failure gates

A production cannot pass solely because its average score is high if it has one of these defects:

- unresolved rights risk,
- wrong or incomplete source,
- major source contradiction,
- incomprehensible causal chain,
- severe continuity failure,
- obvious unusable visual artifact in an important shot,
- unintelligible dialogue/narration,
- broken render or missing required media.

## Evaluation dimensions

The working evaluation set includes:

- novel suitability
- hook
- comprehension
- source fidelity
- causal clarity
- narrative structure
- pacing
- retention potential
- emotional engagement
- immersion
- POV effectiveness
- POV integrity
- visual quality
- visual storytelling
- character consistency
- environment consistency
- historical/setting consistency
- shot composition
- camera motivation
- motion
- editing
- narration
- dialogue
- inner voice
- music
- sound design
- use of silence
- captions
- expressive typography
- motifs
- climax
- payoff
- originality
- technical video quality
- technical audio quality

This list is expected to evolve through experiments.

## Evidence discipline

Every design discussion should distinguish:

- **FACT** — externally verifiable or experimentally demonstrated.
- **ASSUMPTION** — treated as true for planning but not established.
- **HYPOTHESIS** — intentionally testable prediction.
- **DESIGN CHOICE** — a chosen trade-off.
- **EXPERIMENT NEEDED** — insufficient evidence; test instead of debating indefinitely.

## Atomic Item and asset-selection standard

### Item decomposition
Every independently judgeable visible, audible, camera, lighting, effect, transition or typography element is an **Item**. Scene-level quality scores must not hide a weak subpart. Characters, environments and apparatus are decomposed until each independently fail-able component can be researched, replaced and approved separately.

### Requirements before search
For final production, the Item's narrative, source-fidelity, period/location, visual, motion, continuity, technical and rights requirements are written before final candidate selection.

### Best-fit selection
Assets are selected because they best satisfy the defined use case—not because they were found first, already exist in code, are public domain, or are easy to animate.

For HERO/PRIMARY visible Items, use explicit alternatives. Normally compare at least three materially different viable candidates from at least two independent sources, or compare a bespoke design against at least two external references/alternative directions. If nothing is good enough, record `BLOCKED_NO_SUITABLE_ASSET` and redesign rather than using generic filler.

### Source registry
Every material research source is logged when discovered, even if the candidate it informs is rejected. Rights to use facts/reference material and rights to embed an image/audio asset are recorded separately.

### Hard asset gates
A weighted average cannot rescue a hard failure. At minimum, final visible assets require:
- story specificity >= 8/10;
- period fit >= 8/10;
- style fit >= 8/10;
- known provenance/rights.

HERO Items should normally score >= 8 on every applicable critical dimension.

### Shot lock
A shot cannot be locked until every active Item is `FINAL_APPROVED`, the independent shot and style reviews are approved, and all affecting defects are resolved. Missing rights or review evidence blocks lock.

See `docs/production/ITEM_GOVERNANCE.md`.

## User correction and quality enforcement (2026-10-07)

V5.3 is rejected. Complete anatomy, believable proportions/grips, connected
objects, caused physical effects, readable staging and meaningful action are
hard gates. Camera movement and atmosphere do not substitute for story action.
Every active Item must be final before shot lock. The independent quality review
also blocks unresolved defects or an unapproved style. See
`docs/production/QUALITY_REVIEW.md` and `docs/memory/STATE.md`.
