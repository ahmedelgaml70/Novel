# Rigged 3D Ready-Asset Director

**Status:** V5.4-dev proof scaffold

This module exists to prove real character animation with ready free assets. It does not build rigs or animation cycles.

## One-time asset acquisition

Download the free Standard versions from the official Quaternius pages:

1. Universal Base Characters.
2. Universal Animation Library.
3. Universal Animation Library 2.

Optional for the first set:
4. Medieval Village MegaKit.
5. Fantasy Props MegaKit.

All are recorded in `../../docs/production/READY_FREE_ASSET_STRATEGY.md`.

## Character preparation

Use the Godot/UE glTF base character and the non-root-motion Standard animation GLBs.

The compatible rigs can be merged into one animation-ready GLB with Node/glTF-Transform. A public no-Blender reference pipeline demonstrates 66 matched rig nodes and 86 merged clips from the two Standard libraries.

We may implement or reuse an equivalent merge utility, but we do not author/retarget the animations manually.

Expected local outputs:

- `public/assets/human_a.glb` — rigged character + ready clips.
- `public/assets/human_b.glb` — second character or clone/variant.
- `public/assets/environment.glb` — optional ready modular set.

Vendor binaries are not committed until provenance/size policy is finalized.

## Proof sequence

8–10 seconds:

- actor A: ready walk clip.
- actor A: ready interact/reach/action clip.
- actor B: ready reaction/body-motion clip.
- actor A: ready recoil/dodge/hit-reaction clip.

JavaScript controls only:
- action selection/crossfade;
- actor placement;
- camera;
- lighting;
- environment placement;
- material substitution/stylization;
- timing and final render.

## Hard rule

If the character is moved as one rigid image/object to fake the action, the proof fails.

Root/world translation needed for locomotion is allowed only while the skeleton itself is visibly playing a locomotion clip.

## Visual treatment

First test: Three.js toon material + outline only.

Do not build a custom engraving shader until the skeletal-motion gate passes.

## Fastest possible proof

The zero-prep browser proof loads the already-merged ready animated human GLB remotely.

From the repository root:

```bash
cd production/rigged3d
sh run_remote_demo.sh
```

On macOS the script opens the browser automatically. No npm install, Blender, local asset merge, or manual retargeting is needed for this proof.

The page displays the actual runtime clip list and automatically runs known ready clips. Use the clip buttons to inspect any additional reaction/interact actions exposed by the 86-clip GLB.

This remote binary is for development proof only. Production provenance remains pinned/rebuilt from the official Quaternius CC0 packs.
