# V5.4.2 — Frankenstein fast-path proof findings

**Status:** technically successful; visually useful but not promoted as final scene  
**Runtime:** 10.000 s, 1280×720, 24 fps, H.264

## What was tested

The V5.4.1 generic motion proof was specialized into a Frankenstein beat without custom modeling or custom animation.

Ready ingredients:
- Quaternius universal rig + ready clips;
- ready table;
- ready lever;
- ready candle;
- ready wall/slab pieces;
- JavaScript camera/light/flash/editing.

Specificity techniques:
- automatic right-hand bone detection;
- contact point sampled from the ready interaction clip;
- lever placed from that sampled contact;
- ready Creature death/rise/reaction clips;
- camera cuts and electrical flash;
- ready props arranged only in the interaction bubble.

## Runtime evidence

The scene found the actual right-hand bone: `hand_r`.

Recorded contact point:
- x = -0.4677712274
- y = 0.9209868294
- z = 0.2481397840

Work-table height after normalization: 0.5930661281.

Exact clips:
- Idle_Loop;
- Walk_Formal_Loop;
- Interact;
- Death01;
- LayToIdle;
- Hit_Chest;
- Zombie_Idle_Loop;
- Hit_Knockback.

## What worked

- real skeletal motion remained intact after story-specific staging;
- two actors moved independently;
- ready props loaded and were normalized automatically;
- a generic interaction clip could be aligned to a story prop using bone/contact information;
- the Creature could be staged as inert -> rising -> reacting using only ready clips;
- the 10-second scene rendered deterministically to MP4.

## What failed or remained weak

### Victor design
The bare universal base human still reads as a game mannequin rather than Victor. Motion is solved, character specificity is not.

### Recoil
The complete Hit_Knockback clip is too violent for the beat. It throws Victor to the ground and reads as physical impact rather than horror/startle.

### Creature rise
LayToIdle is useful but the unmodified timing makes the Creature become upright too quickly and too cleanly.

### Contact
The hand-to-lever auto-fit makes the action plausible in a wide shot, but it is not yet precise enough for a hero macro contact shot.

### Set
Ready walls/altar/candle prove the interaction-bubble idea, but the resulting environment is still obviously low-poly/game-like. It is a staging proof, not final art direction.

## Changes decided for V5.4.3

1. replace bare Victor with a ready Quaternius Male Peasant model on the same 65-joint universal skin;
2. switch contact action to PickUp_Table and sample only its useful reach portion;
3. replace stone altar with a second ready table for a clearer creation slab;
4. auto-fit the Creature's Death01 pose onto the slab;
5. slow LayToIdle by sampling it over a longer shot;
6. use only the first 0.27 seconds of Hit_Knockback for Victor's startle, then cut directly to a real retreat walk.

## General conclusion

The fast path is valid.

The best shortcut is not “accept the entire closest animation.” It is:

**ready clip + useful time segment + contact fitting + camera/edit + next ready clip.**

Custom animation remains unnecessary at this stage.
