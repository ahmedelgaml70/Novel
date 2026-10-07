# E-VID-006 — Ready Rigged Animation Findings

**Status:** active proof; real skeletal rendering confirmed  
**Date:** 2026-10-07

## What is now proven

The ready Quaternius humanoid GLB loads successfully in Three.js/Chromium and produces deterministic frame sequences from real skeletal animation clips.

The first automated run successfully captured **216 frames at 24 fps** before the initial workflow failed only because system FFmpeg was absent. After installing FFmpeg explicitly, the workflow produced a **9.0-second, 1280×720 H.264 MP4**.

This is materially different from V5.3 moving-still animation: the character mesh is skinned to a skeleton and the animation clips drive joints independently.

## Exact runtime inventory

The merged Standard GLB contains **86 animation clips**.

Useful confirmed clips include:

- Idle_Loop
- Walk_Formal_Loop
- Walk_Loop
- Jog_Fwd_Loop
- Sprint_Loop
- Interact
- PickUp_Table
- Push_Loop
- Hit_Chest
- Hit_Head
- Hit_Knockback
- Punch_Cross
- Punch_Jab
- Sitting_Enter / Sitting_Exit / Sitting_Idle_Loop
- LayToIdle
- Death01
- Zombie_Idle_Loop / Zombie_Walk_Fwd_Loop
- Chest_Open
- Consume
- OverhandThrow
- Yes

The exact development GLB downloaded during the successful render is pinned as:

`sha256:853d0a785345afadc3ed423bd3bb72144debe00cd0bb52c258e00387ab40f162`

## Failure discovered in proof v1

The generic fuzzy clip resolver selected:

- `Crouch_Idle_Loop` for semantic “idle”;
- no clip for semantic “run” because the runtime file calls the relevant actions `Jog_Fwd_Loop` / `Sprint_Loop`;
- `Sword_Attack` for generic “attack”.

The animation system worked, but the automatic semantic matching made the demonstration visually misleading.

## Rule learned

Fuzzy semantic matching is appropriate for **discovery/search only**.

Once an asset pack has passed ingestion and its runtime inventory is known, production choreography must bind explicit clip IDs/names (or an approved semantic map generated from that inventory).

A final shot must never silently substitute a merely keyword-related clip.

## Proof v2 choreography

The corrected proof uses explicit runtime names:

1. `Walk_Formal_Loop` — actor A walks toward actor B.
2. `Interact` — actor A performs an upper-body interaction.
3. `Hit_Knockback` — actor B reacts independently.
4. `Hit_Knockback` — actor A performs a recoil/reaction.
5. `Walk_Formal_Loop` — actor A retreats while the gait continues.
6. `Idle_Loop` — settle.

One-shot actions are clamped instead of modulo-looped.

## What this proves and does not prove

**Proves:**
- real rigged character loading;
- independent joint animation;
- two independently animated actors;
- exact ready clip playback;
- deterministic frame capture;
- browser/WebGL → MP4 rendering;
- no custom rigging or custom core animation required.

**Does not yet prove:**
- Frankenstein-specific acting quality;
- final character/outfit suitability;
- final environment quality;
- final engraving visual language;
- automatic semantic action selection for an arbitrary novel.

Those are the next layers. The skeletal-animation foundation itself is now working.


## Proof v2 result

**PASS for the real-animation architecture gate.**

The corrected deterministic render completed successfully:

- runtime: **9.000 s**;
- resolution: **1280×720**;
- frame rate: **24 fps**;
- codec: **H.264**;
- runtime clip inventory: **86 clips**;
- exact selected clips:
  - `Idle_Loop`;
  - `Walk_Formal_Loop`;
  - `Interact`;
  - `Hit_Knockback`;
  - `Jog_Fwd_Loop` is inventoried for later locomotion work.

Observed sequence:

1. actor A approaches with a real skeletal walk;
2. actor A performs `Interact` with independent upper-body/joint motion;
3. actor B performs an independent `Hit_Knockback` reaction;
4. actor A performs its own `Hit_Knockback` recoil;
5. actor A retreats using a real walk cycle plus world travel;
6. both actors settle in `Idle_Loop`.

The contact sheet no longer shows the accidental crouch-idle substitution from proof v1.

### Architecture decision

The core question is answered: **ready free rigged characters + ready free animation clips + Three.js can produce genuine character animation without custom rigging or custom core animation.**

This replaces flat-image translation/zoom as the default architecture for character-performance shots.

### What happens next

Do not spend another iteration proving skeletal animation.

The next proof should add only ready free:
1. period-appropriate character/outfit candidates;
2. a modular environment;
3. relevant props;
4. progressively stronger rendering style.

Keep the exact skeletal-animation path underneath. If styling makes the motion harder to read, the styling loses.
