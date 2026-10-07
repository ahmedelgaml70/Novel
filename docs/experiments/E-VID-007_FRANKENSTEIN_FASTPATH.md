# E-VID-007 — Frankenstein Fast-Path Specificity Proof

**Status:** rendering  
**Date:** 2026-10-07

## Question

Can the already-proven ready-rigged motion system produce a recognizable Frankenstein-specific causal beat **without custom animation and without building a full 3D laboratory**?

## Fast-path construction

Only interaction-critical elements are true 3D:

- Victor — ready rigged humanoid;
- Creature — same ready rig, role-specific proportions/material and lying orientation;
- table/slab — ready free model;
- lever — ready Quaternius CC0 model;
- floor/contact support.

The far environment is a public-domain 1763–1766 chemical-laboratory engraving by William Lewis.

## Specificity shortcut under test

The hand is **not custom-keyframed** and IK is deliberately deferred.

Instead:

1. play the ready `Interact` clip on Victor;
2. find the runtime right-hand bone;
3. sample its world-space path across the clip;
4. find its maximum natural reach;
5. place the ready lever at that point;
6. synchronize lever rotation and light response to the discovered contact time;
7. start the Creature's ready reaction clip immediately after contact;
8. play Victor's ready recoil;
9. retreat with a ready walk.

If this produces readable contact, it is faster than IK and becomes the first interaction shortcut. If it fails visually, IK is the next escalation.

## Ready sources

- Human motion: Quaternius-compatible merged development humanoid already validated in E-VID-006.
- Table: Quaternius Ultimate Furniture conversion; CC0 evidence recorded by the source repository.
- Lever: Quaternius Lever; Poly Pizza lists it as Public Domain / CC0.
- Far laboratory: William Lewis chemical-laboratory engraving, 1763–1766; Wikimedia Commons public domain.

## Acceptance

The test passes only if an unfamiliar viewer can infer, without audio:

**Victor approaches → operates something → the Creature reacts → Victor recoils/retreats.**

The camera may support the beat but may not substitute for body action.

This is a specificity test, not final art approval.
