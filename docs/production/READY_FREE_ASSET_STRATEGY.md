# Ready-Free Asset Strategy

**Status:** current production policy

## Principle

Do not build a model, rig, animation, environment module, prop, or effect from scratch when a ready free asset can satisfy the Item better after reasonable adaptation.

Search order:

READY + COMPATIBLE + RIGHTS-CLEAR -> READY + ADAPTABLE -> FALLBACK FREE ECOSYSTEM / RETARGET -> MODIFY/COMBINE READY ASSETS -> CUSTOM AUTHORING ONLY IF THE ABOVE FAIL

Ready assets are still candidates, not automatic winners. They must satisfy the locked Item requirements and actual shot.

## Primary humanoid ecosystem — Quaternius

Current first choice for the real-animation proof because the pieces are explicitly designed to work together:

- Universal Base Characters — 6 game-ready humanoid bases, 20 hairstyles, humanoid rig, glTF/FBX, CC0.
- Universal Animation Library — 120+ humanoid animations, GLB/FBX, CC0.
- Universal Animation Library 2 — 130+ additional animations, GLB/FBX, CC0.
- Modular Character Outfits - Fantasy — 12 outfits / 62 modular parts, same humanoid ecosystem, glTF/FBX, CC0.

Why it is first:
- one compatible ecosystem minimizes retargeting work;
- real skinned meshes and real bone animation;
- enough locomotion/action/emote coverage for proof-of-concept filmmaking;
- clear rights for commercial output;
- glTF/GLB is directly usable from Three.js.

## Secondary humanoid ecosystem — KayKit

Use when Quaternius lacks an action or visual direction.

- Adventurers characters are rigged/animated, glTF/FBX, CC0.
- Character Animations provides a large free humanoid animation library including locomotion, interaction, sitting/lying, dodging, combat and simulation/emote actions.

Prefer staying inside one rig ecosystem for a shot or character where possible. Cross-ecosystem retargeting is allowed when the benefit is material.

## Ready environments

Search these before constructing architecture ourselves:

1. Quaternius Medieval Village MegaKit — 300+ modular environment pieces, glTF, CC0.
2. Kenney Modular Dungeon, Castle and Retro Medieval kits — modular CC0 3D pieces.
3. Other Quaternius/Kenney environment kits selected by the actual novel.

The final visual style comes from materials, lighting and post-processing. The default asset texture does not need to resemble the final engraving.

## Ready props

Search in this order:

1. Quaternius Fantasy Props MegaKit — 200+ furniture, tools, books, potions and related props, glTF, CC0.
2. Kenney CC0 3D packs.
3. Poly Haven CC0 for higher-detail HERO furniture and objects.
4. Other rights-cleared sources recorded in the source registry.

Do not use a generic ready prop when the prop is story-critical and a better specific candidate exists.

## Rendering/style — use ready engine capabilities first

For the first rigged-animation proof, do not build an engraving shader from scratch.

Start with official Three.js capabilities:
- MeshToonMaterial for quantized/toon lighting.
- OutlineEffect or the current toon outline pass for silhouette treatment.
- a restrained palette.
- simple paper/grain overlay.
- built-in lights and fog.

Only add a custom hatch/engraving shader after the real-animation proof succeeds.

## No-custom rule for the first real-animation proof

The first proof may not contain:
- a custom human rig.
- a custom walk cycle.
- custom recoil keyframes if a usable ready reaction/dodge/hit clip exists.
- a custom body-spasm animation if a ready reaction/spawn/hit/body-motion clip can communicate the test.
- a modeled-from-scratch room.
- modeled-from-scratch furniture.

Allowed work:
- select and import assets.
- choose, trim, time-scale and blend existing clips.
- place actors and props.
- recolor materials.
- swap modular clothing and hair.
- camera, lighting and fog.
- clip sequencing.
- small bone pose offsets on top of a ready clip only when necessary.
- final stylization and rendering.

## Escalation when an action is missing

Search current animation library -> search second compatible free library -> blend/time-scale/combine existing clips -> retarget a free clip from fallback ecosystem -> only then consider authoring a new animation.

Any escalation to custom authoring must record why the ready-free search failed.

## Proof target

One 8–10 second sequence:

1. actor walks into the scene using a ready locomotion clip.
2. actor reaches/interacts using a ready interaction/action clip.
3. second rigged character moves independently using a ready reaction/spawn/hit/body-motion clip.
4. first actor recoils/steps back using a ready reaction/dodge clip.
5. camera and lighting continue independently.

Success means the viewer clearly sees joint-level animation: feet plant, knees, hips, spine, shoulders, arms and head move independently. The test fails if it reads as a still image being translated or zoomed.

## Final-film rule

The proof asset set is not automatically the final novel asset set.

For each film, handpick the best ready free character, outfit, environment and prop for that story. If the ready pool is inadequate for a HERO Item, then and only then escalate to specialized or custom work.
