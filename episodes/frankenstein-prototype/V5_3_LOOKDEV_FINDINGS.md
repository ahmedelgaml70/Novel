# V5.3 Look-Development Findings

**Date:** 2026-10-07
**Status:** failed visual gate; no V5.3 full-film render promoted

## Purpose

Test whether the new requirements-first creature/exterior/character directions could reach the quality target using improved bespoke Canvas/vector geometry alone.

## Matched frames reviewed

- exterior variant A
- exterior variant B
- creation tableau creature A
- creation tableau creature B
- Victor close-up / doorway grip
- first-eye variant A
- first-eye variant B
- recoil tableau A
- recoil tableau B

## Result

**No current lookdev frame is approved for V5.3 final integration.**

### Exterior

The source-informed composition improved conceptually, especially the steeple/river/bridge/city hierarchy, but the rendered architecture still reads as coded blocks. The redraw discards too much of the historical engraving's architectural density and irregularity.

Decision: reject the current primitive/vector reconstruction as final art. Preserve the multi-source research direction, but test a higher-information asset-authoring method.

### Creature

The new source-driven requirements are stronger than V5.1: proportionate human anatomy, dull yellow eye, flowing dark hair, breathing/convulsive motion instead of zombie motion. However, both rendered head variants remain visibly geometric and illustrative rather than convincingly engraved/human.

Variant A is slightly clearer at the eye; variant B gives stronger hair/shadow mass. Neither is good enough to select.

Decision: preserve the design requirements; reject the current primitive implementation.

### Victor

The temporal correction and recoil concept are better, but the close-up exposes weak face/hand anatomy. The grip hand and head still look like constructed symbols rather than authored historical illustration.

Decision: do not polish the current geometry. Replace the asset-authoring layer.

### Creation/recoil tableaux

The dying candle is a useful source-fidelity addition, but the room and characters are still too diagrammatic. More post-processing would hide defects rather than solve them.

## Root cause

The current renderer is asking low-level JavaScript geometry to perform two jobs:

1. **art authoring** — create premium human/architectural illustration;
2. **film direction** — animate, compose, light, move camera, edit and render.

JavaScript is already strong at the second job. The failed lookdev shows that forcing it to do all of the first job with hand-authored primitive geometry destroys source detail and keeps anatomy/architecture below the target.

## Next experiment

Introduce a **bespoke asset-authoring layer**. Candidate assets may be:

- a directly reusable handpicked historical/public-domain source when it is genuinely the best visual asset;
- a bespoke traced/redrawn/vectorized asset derived from multiple references;
- a bespoke generated illustration produced against the locked Item requirements and then validated like any other candidate.

These are not automatic winners. They must enter the same Source → Candidate → Shot Test → Selection process.

JavaScript remains responsible for:

- asset isolation/layering;
- recoloring and house-style normalization;
- masks;
- 2.5D depth/parallax;
- camera;
- lighting;
- fog/rain/particles;
- selective deformation;
- transitions/editing;
- typography;
- audio synchronization;
- deterministic final render.

## Promotion condition

Do not render the full V5.3 film until at least these approval stills pass:

1. Ingolstadt exterior;
2. creature close-up/eye;
3. creature body in creation tableau;
4. Victor doorway/recoil close-up;
5. apparatus contact macro.

Only then animate and render the sequence.
