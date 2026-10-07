# E-VID-006 — Ready Rigged Real-Animation Proof

**Status:** ACTIVE

## Question

Can the Novel video system produce unmistakably real character animation without building rigs, animation cycles, rooms, or props ourselves?

## Architecture under test

Quaternius/KayKit ready rigged humanoids + ready animation clips + ready modular environment/props + Three.js animation/rendering.

## Primary asset stack

- Quaternius Universal Base Characters — CC0, glTF/FBX.
- Quaternius Universal Animation Library — CC0, 120+ clips.
- Quaternius Universal Animation Library 2 — CC0, 130+ additional clips.
- Quaternius Modular Character Outfits - Fantasy — CC0, compatible humanoid rig.
- Quaternius Medieval Village MegaKit / Fantasy Props MegaKit — CC0.

## Fallback stack

- KayKit Adventurers + KayKit Character Animations — CC0.
- Kenney modular 3D environment packs — CC0.
- Poly Haven CC0 HERO furniture/props where higher detail is required.

## Engine

Three.js.

Use ready capabilities first:
- GLTFLoader.
- AnimationMixer.
- animation clip blending/crossfades.
- MeshToonMaterial.
- OutlineEffect / toon outline.
- native camera/lights/fog.

No custom engraving shader is allowed until the real-animation gate passes.

## No-build constraints

The proof may not contain:
- a custom human skeleton or skinning setup.
- a custom walk cycle.
- a custom recoil cycle if an adequate ready reaction/dodge/hit animation exists.
- a room modeled from scratch.
- furniture modeled from scratch.
- a still-image character substitute.

Minor clip trimming, speed changes, blending and small corrective bone offsets are allowed.

## Sequence

Target runtime: 8–10 seconds.

Beat 1 — actor A walks into the set using a ready locomotion clip.
Beat 2 — actor A reaches/interacts using a ready interaction/action clip.
Beat 3 — actor B performs an independent body reaction using a ready reaction/spawn/hit/body-motion clip.
Beat 4 — actor A recoils or steps backward using a ready reaction/dodge clip.
Beat 5 — both characters remain independently animated while camera/light continue.

## Acceptance criteria

The proof passes only if:
- feet visibly plant and leave the ground naturally.
- knees/hips/spine/shoulders/arms/head visibly animate as separate joints.
- at least one action changes body pose rather than moving the whole model as one rigid object.
- the two actors can move independently.
- camera motion is clearly separate from actor motion.
- the result cannot reasonably be described as a still image being panned, translated, or zoomed.
- no custom rig or custom locomotion/action animation was required.

## Style gate

First pass uses simple toon + outline styling only.

Only after motion passes do we compare:
1. plain toon;
2. toon + monochrome/sepia palette;
3. toon + outline + paper/grain;
4. later engraving/hatching treatment if needed.

Motion quality is evaluated before ornamental styling.

## Failure handling

If a required action is absent:
1. search the same animation library.
2. search the second Quaternius library.
3. search KayKit.
4. blend/time-scale/combine ready clips.
5. retarget a free clip.
6. only then consider custom animation.

Every escalation must document which ready sources were searched and why they failed.

## Result policy

A successful proof replaces the moving-still character architecture for performance shots.

A failed proof does not mean returning to PNG movement automatically. Diagnose whether the failure came from the asset, clip, retargeting, camera, or stylization first.
