# Fast Path — Specific Cinematic Shots from Ready Free Assets

**Status:** active production shortcut  
**Goal:** turn generic ready humanoid motion into story-specific cinematic action with minimal custom work.

## Core idea

Do not search for an animation named after the exact story beat.

Use:

READY BASE CLIP
+ CONTACT / IK TARGETS
+ LOOK-AT TARGETS
+ PROP MOTION
+ SMALL ADDITIVE LAYERS
+ EDITING / CAMERA
= STORY-SPECIFIC ACTION

The rig and clip supply biomechanics. The director supplies intention.

## 1. Interaction bubble

Only model/render in full 3D what must physically interact:

- actors;
- floor/contact surface;
- one or two hero props;
- door/lever/table/chair/bed edge if touched.

Everything else may be:

- a high-quality 2D/2.5D background plate;
- historical/public-domain art;
- layered depth cards;
- fog/light/shadow;
- simple modular set extension.

This keeps genuine contact/motion while avoiding the cost of building an entire room.

## 2. Contact anchors

Every interactive prop can expose named targets such as:

- right_hand_target;
- left_hand_target;
- door_handle;
- lever_handle;
- table_edge;
- chair_seat;
- gaze_target.

A generic ready clip such as Interact becomes specific when the hand is constrained toward the exact target and the prop responds.

Example:

Victor activates apparatus
= Walk_Formal_Loop
→ Interact
→ right hand IK to lever_handle
→ head look-at Creature
→ lever rotates
→ electrical event
→ Hit_Knockback / recoil

No custom Victor animation is required.

## 3. Clip surgery

Before authoring a new animation, try:

- trim a useful segment from an existing clip;
- time-scale it;
- clamp a one-shot instead of looping;
- crossfade between clips;
- combine upper/lower body when compatible;
- add a small additive layer;
- use the same clip with a different camera/framing.

Three.js already provides clip playback, crossfading, additive animation modes, and clip/subclip utilities.

## 4. Specificity layers

A reusable animation becomes character-specific through cheap parameters:

- body proportions / character base;
- hair;
- outfit pieces;
- material palette;
- posture;
- action speed;
- head/gaze direction;
- hand contact target;
- prop response;
- lighting;
- camera;
- sound.

The exact motion file does not need to know who Victor is.

## 5. Film-editing cheats

Prefer editorial solutions over new animation when they improve the scene:

- cut on action;
- foreground occlusion during transition;
- reaction shot instead of showing every hand detail;
- insert of the prop rather than a difficult full-body interaction;
- silhouette/rim light for weak facial detail;
- over-shoulder framing;
- match cut between two ready clips;
- brief close-up only when the asset supports close-up scale.

These are normal filmmaking techniques, not quality compromises.

## 6. Ready-animation fallback ladder

When an exact action is absent:

1. search exact runtime inventory;
2. search the second Quaternius library;
3. search KayKit;
4. combine / trim / time-scale / crossfade ready clips;
5. use IK/contact constraints to make a generic interaction exact;
6. use Mixamo manually as an emergency humanoid-animation source if needed;
7. custom animation only after the above fail.

## 7. Fast environment strategy

Do not build every historical location as a complete 3D set.

For most shots:

REAL 3D FOREGROUND
- characters;
- floor;
- hero table/door/prop;
- nearby occluders;

2.5D BACKGROUND
- period engraving / city view / interior art;
- depth-separated cards;
- subtle parallax;
- fog and lighting.

Use a fully modular 3D room only when the camera or actor interaction genuinely requires it.

## 8. Fast character strategy

Start from the compatible ready humanoid ecosystem.

For each character, create a recipe rather than a custom model:

- base body;
- scale/proportion parameters;
- hairstyle;
- outfit modules;
- material palette;
- posture;
- available clip set.

The same rig and animation library can serve many characters.

## 9. Motion quality gate

The shortcut is accepted only if:

- planted feet still look planted;
- hand contact reads correctly where visible;
- gaze supports the dramatic beat;
- prop reaction is synchronized;
- camera/editing does not hide a broken pose;
- the result still contains real joint-level animation.

Do not use camera motion to replace missing body motion.

## 10. Fastest Frankenstein proof

Use the existing V5.4.1 motion foundation.

Build only:

- Victor: ready humanoid + closest acceptable period silhouette/outfit;
- Creature: ready humanoid base, altered proportions/material/hair;
- one table/slab;
- one lever/contact;
- one candle/light source;
- one high-quality laboratory background plate;
- fog/rain/lightning.

Choreography:

Walk_Formal_Loop
→ Interact + hand IK to lever
→ Creature Hit_Chest / body reaction
→ Creature gaze/head adjustment
→ Victor Hit_Knockback
→ retreat walk
→ cut.

That is enough to test a genuinely story-specific Frankenstein beat without custom rigging, custom locomotion, or a complete custom environment.
