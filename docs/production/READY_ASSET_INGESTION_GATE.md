# Ready Asset Ingestion Gate

## Purpose

Catalog/marketing metadata is not the runtime truth. Before a ready pack can drive shot planning, inventory the exact files used by the renderer.

## Required runtime inventory

For rigged/animated GLB or glTF:
- file SHA / provenance;
- file size;
- node count;
- bone/joint count;
- skin count;
- mesh/material count;
- animation clip count;
- exact clip names;
- clip durations;
- root-motion vs in-place classification where relevant;
- skeleton compatibility with the chosen character;
- load/render success in the actual runtime.

For environment/prop packs:
- exact asset names/files;
- dimensions/scale conventions;
- material/texture dependencies;
- polygon/detail class;
- modular snapping/origin conventions;
- rights/provenance;
- actual shot suitability.

## Planning rule

The story/shot planner may only treat a ready capability as AVAILABLE after it appears in the runtime inventory.

If an action is not yet inventoried, mark it SEARCH_REQUIRED rather than inventing a substitute or assuming the pack contains it.

## Quaternius proof example

The current no-Blender Standard merge reference reports 43 clips from UAL1 Standard and 43 from UAL2 Standard: 86 named runtime clips total. This is the capability count for that tested export path, regardless of larger pack-level headline counts.

The demo therefore lists the actual loaded clip names at runtime and resolves semantic actions against those names.


### Character completeness

For character/actor assets, runtime ingestion must classify the file as one of:

- COMPLETE_ACTOR;
- BASE_BODY;
- OUTFIT_PART;
- BODY_PART;
- HAIR_PART;
- ACCESSORY.

A compatible skeleton is not evidence that the asset is a complete visible actor.

Before shot use, record:
- head/face/eyes coverage;
- torso coverage;
- both arms/hands;
- both legs/feet;
- hair/headwear status;
- whether skin/outfit layers expose gaps;
- a neutral rest-pose review frame.

### glTF runtime dependencies

For every GLB/glTF, inventory:
- extensionsUsed;
- extensionsRequired;
- Draco compression;
- Meshopt compression;
- KTX2/Basis textures;
- external buffers/images;
- decoder/runtime versions.

The ingestion gate includes a production-runtime load smoke test. A rights-cleared asset that cannot load in the canonical renderer has not passed ingestion.
