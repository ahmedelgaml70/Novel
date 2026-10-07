# Novel Production System

**Scope:** universal production governance for any novel selected by Novel.
**Not tied to:** Frankenstein, Living Engraving, one edition, one renderer, or one visual style.

## System versus style versus episode

The production architecture has three layers:

```text
UNIVERSAL PRODUCTION SYSTEM
        ↓
STYLE / RENDERER MODULE
        ↓
EPISODE / NOVEL PROJECT
```

### Universal production system
Applies to every Novel film:
- atomic Item decomposition;
- requirements before candidate selection;
- source/candidate/selection separation;
- provenance and rights tracking;
- source-contract comparison;
- continuity/QC;
- learning loop;
- version/replacement discipline;
- structural versus final-quality gates.

### Style / renderer module
One visual implementation. Today the main experimental module is **Living Engraving**.

A future film may use another JavaScript vector style, 2.5D collage, WebGL/Three.js, hybrid AI + code, procedural 3D, or another approach that proves better.

A style is chosen because it is best for the episode/creative goal. It is not a global constraint.

### Episode / novel project
Contains novel-specific data:
- source candidates/edition choices;
- source-fidelity obligations;
- characters;
- locations;
- props;
- visual references;
- shot manifest;
- candidate assets;
- decisions;
- version log.

Frankenstein is a worked benchmark only.

## Universal production loop

```text
APPROVED NOVEL
→ SOURCE CANDIDATES
→ ADAPTATION / POV / STORY MAP
→ STYLE & RENDERER OPTIONS
→ SHOT PLAN
→ ATOMIC ITEM INVENTORY
→ REQUIREMENTS
→ SOURCES
→ CANDIDATES
→ COMPARISON
→ LOOKDEV / SHOT TEST
→ SELECTION
→ MOTION / AUDIO
→ CONTINUITY
→ QC
→ LEARNING
→ REVISE AS NEEDED
→ FINAL MASTER
```

Every stage remains revisable until final lock. Better evidence or a demonstrably better solution can replace an earlier decision.

## Best-fit, not first-fit

The system optimizes for the best solution for the use case, subject to rights and practical constraints.

Do not use an asset/source/style merely because it was found first, already exists in code, is free, is easy to animate, worked in a previous novel, or belongs to the currently favored visual style.

## Source contracts are episode decisions

The framework never hardcodes "use the 1818 edition", "use the first edition", or any equivalent rule.

Each episode compares candidate sources/editions/translations against:
- completeness/integrity;
- adaptation goal;
- source significance;
- wording/narrative consequences;
- translation quality where relevant;
- rights/provenance;
- creative value.

The source contract may change when a better source is found. Changing it invalidates dependent obligations/decisions and triggers targeted revalidation.

The final master needs a clearly recorded source contract for reproducibility; development does not need to pretend an early source choice is permanent.

## Style choice is also revisable

The same principle applies to visual style.

If Living Engraving proves suboptimal for a particular novel, the system may choose another style. Reuse the universal governance, not necessarily the current renderer.

## Atomic Items

Every independently judgeable visual, audible, camera, lighting, transition, typography, motion, or composition element is an Item when it can fail independently, be sourced/replaced independently, require different evidence, have different continuity obligations, or materially affect quality.

Use `ITEM_GOVERNANCE.md` and `ITEM_CHECKLISTS.md`.

## Sources, candidates and selections

They are separate entities.

A Source can teach us what is true without being usable as final art.
A Candidate is a possible solution.
A Selected Item is a candidate that wins the requirements-based comparison and passes the real shot.

Use `SOURCE_POLICY.md`.

## Learning

Every material failure or success should produce a reusable lesson when appropriate.

Use `LEARNING_SYSTEM.md`.

The system deliberately distinguishes EPISODE, STYLE, CATEGORY, and GLOBAL lessons. Do not promote Frankenstein facts into global rules.

## Final-quality gate

The final gate is strict about **quality/evidence**, but not dogmatic about **which solution must win**.

It should enforce things like:
- source contract is deliberate and recorded;
- required Items are approved;
- provenance/rights are known;
- source contradictions are resolved;
- continuity passes.

It should not enforce a particular edition, Living Engraving, a specific asset, a fixed camera language, a fixed POV percentage, or a fixed rendering stack unless that was deliberately chosen for the current episode.

## Canonical documentation

- `PRODUCTION_SYSTEM.md` — universal system;
- `ITEM_GOVERNANCE.md` — Item lifecycle;
- `ITEM_CHECKLISTS.md` — category-specific considerations;
- `SOURCE_POLICY.md` — evidence/source rules;
- `LEARNING_SYSTEM.md` — how problems become reusable learning;
- `CURRENT_METHOD.md` — current active style/implementation method;
- `VERSION_HISTORY.md` — production-method experiments and evolution;
- `episodes/<episode>/` — novel-specific records;
- `production/<style>/` — renderer/style implementation.
