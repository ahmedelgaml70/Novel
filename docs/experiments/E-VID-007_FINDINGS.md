# E-VID-007 — Frankenstein Fast-Path Findings

**Status:** V5.4.4 render in progress  
**Updated:** 2026-10-08

## Purpose

Test the fastest story-specific route after the generic skeletal-animation proof passed:

- ready rigged actors;
- ready animation clips;
- ready interaction props;
- automatic prop-to-hand-path fitting before IK;
- high-information historical background;
- no custom character animation;
- no complete custom 3D laboratory.

## V5.4.3 — mechanically useful, visually rejected

A complete 10-second artifact was rendered and inspected.

### What worked

- real skeletal locomotion;
- real right-hand bone found: `hand_r`;
- contact point derived from the ready interaction clip;
- ready lever placed at that hand path rather than custom-keyframing the hand;
- causal sequence could be assembled:
  approach -> contact -> flash -> Creature motion -> Victor recoil -> retreat.

Recorded contact audit:

- contact world coordinate: approximately `[-0.247, 0.989, 0.420]`;
- ready table height: approximately `0.563`.

This proves the contact-fitting mechanism itself is technically viable.

### What failed visually

1. **Victor was incomplete.**
   The prepared Male_Peasant GLB was an outfit/body-part asset, not a complete actor. It accepted the compatible rig but rendered headless.

2. **Creature motion contradicted the scene.**
   `LayToIdle` was designed to transition a character toward upright idle. On the slab it made the Creature sit/stand and immediately read as generic game animation.

3. **Shot scale was weak.**
   The camera remained too distant for the contact and reaction to read with cinematic force.

4. **The support environment remained sparse.**
   Correct motion alone did not make the room feel authored or historically rich.

### Decision

V5.4.3 is **not approved** as a visual direction.

The fast-path architecture remains promising, but clips/parts must be used according to what they actually represent.

## V5.4.4 — simpler correction

V5.4.4 deliberately removes more rather than adding complexity.

### Character

Victor returns to the complete ready universal base human until a complete period character assembly passes the character-ingestion gate.

No incomplete outfit GLB is allowed to masquerade as a full actor.

### Creature

The Creature remains physically horizontal on the slab for the entire sequence.

Removed:
- `LayToIdle`;
- full sit-up/stand-up awakening.

Current ready motion:
- `Hit_Chest` for the primary convulsive event;
- only a partial `Zombie_Scratch` segment for secondary movement;
- idle for the remaining slab state.

The root remains rotated to the slab orientation throughout.

### Environment

Far background:
- William Lewis chemical-laboratory engraving, 1763–1766, public domain.

Real 3D interaction zone only:
- ready table/slab;
- ready work table;
- ready Quaternius lever;
- ready KayKit candle;
- actors and floor.

This is the intended interaction-bubble architecture.

### Contact

Still no IK.

The system:
1. samples the real hand bone across `PickUp_Table`;
2. chooses a natural reach sample;
3. fits the lever/work surface to that reach;
4. synchronizes the lever and light event to contact.

If V5.4.4 contact is visibly convincing, this becomes the preferred shortcut because it is simpler than IK.

If contact visibly misses/slides, escalate only the interacting arm to IK.

### Camera/runtime

Runtime shortened to approximately eight seconds.

Camera is closer and beat-specific:
- approach/contact;
- Creature convulsion;
- Victor recoil;
- aftermath.

## Current acceptance gate

The artifact must communicate without audio:

**Victor approaches -> operates the contact -> Creature convulses on the slab -> Victor recoils and retreats.**

Reject if:
- hand/lever contact visibly floats;
- Creature appears to stand or leave the slab unintentionally;
- body motion looks like rigid-object translation;
- historical plate and 3D interaction zone look incoherently pasted together;
- the camera is doing the storytelling instead of the actors.

## Escalation policy

Pass:
- preserve no-IK contact fitting for similar simple interactions.

Fail only at hand contact:
- add right-arm IK; leave the rest of the animation untouched.

Fail at Creature motion:
- search another ready lying/convulsion/reaction clip or use an additive upper-body layer before authoring animation.

Fail mainly at visual integration:
- improve material/light/background integration; do not replace the working skeletal-motion architecture.
