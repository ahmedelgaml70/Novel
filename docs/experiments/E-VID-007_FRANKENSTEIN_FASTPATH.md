# E-VID-007 — Automatic Prop-to-Hand Fast-Path Experiment

**Status:** REJECTED / SUPERSEDED  
**Date:** 2026-10-07

## Question

Can a story-specific Frankenstein beat be produced even faster by sampling the ready `Interact` hand path, placing a ready lever at maximum natural reach, and using a public-domain historical laboratory plate behind only the interaction-critical 3D geometry?

## What was tested

The experiment intentionally avoided custom animation and IK:

1. load the already-proven ready humanoid rig;
2. play the ready `Interact` clip;
3. find the runtime right-hand bone;
4. sample its world-space path;
5. place a ready CC0 lever at maximum natural reach;
6. normalize a ready table from measured actor height;
7. put a second ready rig on the table and trigger a ready `Hit_Chest` reaction;
8. use William Lewis's 1763–1766 public-domain laboratory engraving as the far environment.

Ready sources:
- Quaternius-compatible merged humanoid / UAL clips;
- Quaternius table conversion (CC0);
- Quaternius Lever (CC0);
- William Lewis chemical-laboratory engraving (public domain).

## Findings

### Useful findings

- The ready assets and historical plate loaded successfully.
- The runtime identified the right hand as `hand_r`.
- The actual `Interact` clip duration is 2.0 s.
- Maximum sampled horizontal hand reach was about 0.355 world units.
- Actor height measured about 1.741 world units.
- Table dimensions after actor-relative normalization were approximately 1.288 × 0.749 × 2.525.
- The sampled contact occurred at about 0.972 s inside `Interact`.
- Draco-compressed ready GLBs require explicit loader-extension support.

### Visual failure

The first render had severe coordinate/scale instability. A second pass added:
- unanimated world wrappers around animated rigs;
- actor-height-relative table/lever scaling;
- per-pose ground locking;
- table-surface locking for the Creature;
- camera framing from measured human scale.

Those changes made the numerical dimensions sane, but the resulting visual remained markedly worse than the pre-existing `frankenstein_fast.js` implementation. The automatic maximum-reach heuristic did not produce a coherent cinematic composition, and the duplicate implementation added complexity without improving the shot.

## Decision

**Do not keep this as a current production path.**

The executable duplicate files and duplicate workflow were deleted from `main`.

Preserve only the reusable findings:
- ingest required glTF extensions before shot assembly;
- separate animated rig-local transforms from world placement;
- normalize ready-asset units against measured actor scale;
- runtime hand-path sampling can be useful as a diagnostic/candidate generator, but maximum reach alone is not a shot-design rule.

The current fast-path implementation is `production/rigged3d/src/frankenstein_fast.js`, which uses a stronger combination:
- ready clothed Victor;
- ready table/walls/candle/lever;
- ready `PickUp_Table` contact-rich clip;
- ready Creature death/rise/reaction clips;
- deliberate clip surgery;
- explicit camera cuts.

## Learning boundary

Do not generalize “IK is required” from this failure. The failure was the simplistic **maximum-reach placement heuristic plus duplicate scene construction**, not the concept of runtime constraints itself.

IK remains an escalation when a selected shot needs exact visible hand contact after ready clip selection, prop fitting, clip surgery and camera/editing have been tried.
