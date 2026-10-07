# Item-Type Checklists

These checklists define what must be considered before selecting or designing each type of film Item. They are not optional decoration: the relevant checklist becomes part of the Item requirements.

## Character identity / silhouette

Check literary identity, age, social status, health, temperament, occupation, period, geography, and the emotional state in this scene. Validate body proportions, recognisable silhouette, posture, clothing hierarchy, and whether the character can stay identifiable without a fully lit face. Confirm the design works in wide, medium, and close views. Reject generic avatar proportions, contemporary body language, or a silhouette that could represent any unrelated story.

## Face / head profile

Determine exactly why the face is being shown. Validate age, bone structure, expression, gaze, asymmetry, shadow pattern, crop, line density, and continuity with the body silhouette. The face should not be more detailed than the shot needs. In Living Engraving, prefer partial information and chiaroscuro over a clean front-facing avatar. Validate the face at delivery resolution, because small eye/mouth errors can dominate perception.

## Hair / facial hair

Validate period plausibility, class/status, grooming, silhouette, direction of strands, interaction with lighting, and continuity across angles. Hair should support character identity, not merely fill the head shape. Search period portraits or museum references where the hairstyle materially matters.

## Costume

Validate date range, geography, social class, occasion, materials, cut, fastening, collar, waist position, sleeve shape, trousers/breeches, footwear, wear state, and silhouette. The correct period is not enough: the costume must also be correct for this character and moment. For hero characters, museum collection objects or period fashion plates are preferred evidence sources.

## Hands

Hands are high-risk perception Items. Validate anatomy, finger count, joint placement, grip mechanics, foreshortening, gesture intention, sleeve relationship, light, and whether the pose communicates story. A hand that is technically present but emotionally meaningless should be redesigned. Close hands require their own approval crop.

## Pose / gesture

Define the action verb first: recoil, hesitate, grip, rise, reach, collapse, observe. Validate weight distribution, centre of mass, joint plausibility, line of action, silhouette, and whether the gesture can be read without narration. Compare at least two gesture directions for hero moments.

## Creature / non-human anatomy

Start from the novel, not later film iconography. Record exact textual descriptors and what is intentionally left ambiguous. Validate proportions, musculature, skin/hair cues, movement quality, emotional intelligence, and recognisable difference from popular adaptations when source fidelity matters. Avoid importing trademarked or culturally dominant later-film design conventions by habit.

## Architecture / exterior

Validate actual place, era, building type, construction materials, roofline, window/door proportions, urban density, climate, and vantage point. For named real locations, search historical maps, engravings, photographs, or institutional archives. A generic Gothic skyline is not sufficient when the story names a specific city and the location is visually important.

## Interior architecture

Validate room purpose, construction, wall/ceiling/floor materials, windows, doors, heating/fireplace, furniture arrangement, plausible circulation, and light sources. The room must support blocking: characters should have a believable reason to stand, enter, move, and look where they do.

## Hero prop / apparatus

Define narrative function and mechanical function before art selection. Validate date, inventor/technology, materials, dimensions, construction logic, controls/terminals, wear, and how a hand would actually operate it. Museum object records and contemporary technical plates are preferred. Never choose a prop merely because it visually reads as “science.”

## Support prop

Validate period, location, material, scale, and story relevance. Remove props that add clutter without world-building value. Repeated support props should still vary naturally rather than looking cloned.

## Book / document / typography object

Determine edition, binding/paper type, page layout, type style, language, and whether text should be legible. If the object is from the novel itself, verify wording and edition. If it is only a background object, avoid readable invented text that could introduce false source information.

## Anatomical / scientific illustration

Validate date, scientific convention, drawing style, labels, anatomical plausibility, and whether the depicted knowledge existed in the story period. Prefer contemporaneous atlases or institutional sources. If reconstructed, document which source plates informed the geometry.

## Lighting source

Every key light needs a plausible source unless deliberate expressionism overrides realism. Record source position, colour/value role, intensity logic, shadow direction, and narrative purpose. Electrical light in an early-19th-century setting must not silently resemble modern room lighting.

## Weather / atmosphere

Validate climate/season/story evidence, particle direction, wind relationship, depth behaviour, interaction with light, and sound correspondence. Atmosphere should create depth and mood; it should not be a generic overlay pasted identically onto every scene.

## Fire / smoke / fog / dust

Validate source of the phenomenon, buoyancy/direction, density, scale, occlusion and light scattering. Secondary motion must follow the scene rather than looping mechanically.

## Electricity / arc / spark

Separate historical apparatus from stylised cinematic effect. Validate where current/charge would plausibly originate, connection points, duration, brightness, branching scale, and whether the effect is intentionally fantastical. Do not let a neon-looking arc modernise the image.

## Camera / framing

The camera is an Item even though it is not a visible asset. Record shot size, perspective, focal emphasis, horizon, angle, movement, easing, start/end composition, depth response, and story reason. Reject movement that exists only to prevent stillness.

## Depth plane / parallax

Each plane must have a visual reason and correct relative motion. Validate foreground occlusion, scale, blur, edge quality, and parallax factor. Excessive parallax makes engraved art feel like cardboard theatre; too little loses depth.

## Transition / edit

Transitions are story grammar, not decoration. Determine why the cut happens at that frame and what visual/audio relationship carries the viewer across it. Repeated signature transitions may become templated. Hard cuts are preferred when they are stronger.

## Title / captions / typography

Validate relation to the novel's publication era and the film's house style. Check typeface licensing, kerning, hierarchy, safe area, contrast, duration, and whether typography is diegetic or editorial. Historical title pages can guide proportion and spacing without being copied blindly.

## Paper / ink / hatching / texture

These define the global visual material. Validate scale at 720p/1080p/vertical crops, temporal stability, line density, compression behaviour, and whether texture obscures faces or text. Randomness must be deterministic so rerenders are reproducible.

## Narration / dialogue / inner voice

Validate source fidelity, character voice, dramatic need, intelligibility, timing, and whether the image can carry the information instead. Do not use narration to explain weak visual storytelling.

## Ambience

Define location, time, weather, room size, perspective and emotional function. Avoid undifferentiated “cinematic ambience.” Build layers that can be individually muted and evaluated.

## Foley

Each Foley cue must correspond to a visible or intentionally off-screen cause, have appropriate material/space, and be synchronized. Reused footstep or impact sounds should not reveal looping.

## Music

Define narrative arc, harmonic/timbral language, instrumentation constraints, historical versus deliberately non-historical choices, motif ownership, and relation to dialogue/sound. Music must not hide pacing problems. Source/license/provenance is mandatory.

## Silence

Silence is an intentional audio Item. Record where layers are removed, what remains (room tone, breath, heartbeat), and why. It is not simply the absence of an audio file.

## Asset source / isolation quality

Check whether the source file supports the way the Item will actually be used. For HERO assets inspect alpha edges, hair, fingers, cloth, negative spaces, transparent margins, contamination from neighboring objects, crop latitude and available resolution. A visually attractive multi-object sheet may fail production if clean extraction damages the silhouette.

## Motion structure

State the motion class before final asset selection:

- `RIGID/SUBTLE`: flat asset acceptable when only transforms, breathing/tremor, parallax or small deformation are needed.
- `DEFORMABLE`: identify required flexible regions and deformation method.
- `ARTICULATED`: identify independent joints/limbs/fingers and the rig/layer structure required.

Test the motion at actual shot scale. Do not infer articulation from static visual quality.

## Detail hierarchy / neighboring Items

Review each HERO Item together with the SUPPORT Items around it. If the focal asset is visibly more authored/detailed than the room, props, foreground or effects, either upgrade those Items or simplify/remove them. Negative space is preferable to generic filler.
