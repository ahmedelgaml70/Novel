# Visual Production Improvement History

This file records what each visual-production iteration attempted, what failed, what was learned, and what changed next. It is intentionally separate from `CURRENT_METHOD.md`, which contains only the active instructions.

## E-VID-001 — JavaScript cinematic feasibility test — 12 s

**Goal:** determine whether JavaScript + SVG/frame rendering + FFmpeg could create an actual cinematic video rather than a browser demo.

**Tried:** procedural station environment, fog, train approach, typography, camera-like movement, procedural ambience.

**Found:** deterministic programmatic video was technically viable and editable. Camera, fog, text, timing and sound could be parameterised. The visual ceiling was limited by primitive illustration rather than by the video-rendering concept itself.

**Improvement unlocked:** JavaScript could be the director/compositor, not merely a utility script.

## E-VID-002 — Full-runtime feasibility — Frankenstein — 3:00

**Goal:** answer whether the same approach could sustain an entire three-minute film.

**Tried:** 12 distinct scenes at 15 seconds each, including exterior, travel, study, laboratory, POV hands, eye close-up, corridor, dawn and ending.

**Found:** full duration was feasible, but visual repetition and primitive artwork became the dominant weaknesses. A long runtime amplified generic design decisions.

**Improvement unlocked:** evaluate visual-language quality on short high-pressure scenes before spending time on full runtime.

## E-VID-003 — Second-generation cinematic scene — 18 s

**Goal:** increase visual richness and shot diversity rather than length.

**Tried:** layered SVG art, pseudo-3D depth, reusable character parts, procedural light/fog/rain, textured post-process, wide -> POV -> macro -> eye -> silhouette structure.

**Found:** expensive SVG turbulence/displacement evaluated per frame was wasteful. Texture/effects should be moved into a global post-processing layer. Character close-ups were still a bottleneck.

**Improvement unlocked:** separate clean scene geometry from post-processing; use dedicated close-up art rather than zooming a weak full-body rig.

## E-VID-004 — Asset-driven renderer — 20 s

**Goal:** test whether ready-made visual assets could raise quality while JavaScript handled direction.

**Tried:** reusable SVG ingestion, icon/prop sources, asset normalisation, engraving treatment, modular character, 2.5D perspective, procedural effects.

**Found:** normalisation can make heterogeneous assets more coherent, but generic source assets still remain generic. A renderer cannot turn a weak source asset into a premium bespoke object. Character art remained visibly “asset pack”.

**Improvement unlocked:** asset provenance and story specificity became first-class concerns.

## V4 — Living Engraving — 20 s

**Goal:** establish a coherent house style and a reproducible canonical method.

**Tried:** Open Peeps modular character atoms, line boil/hatching, separate depth planes, manifest-driven scenes, local audio cues, canonical method files, validator, one active renderer.

**Found:** modular assets improved consistency and engineering, but the visual identity still looked too reusable/generic. The method architecture was stronger than the actual art direction. Rive was investigated but not made a dependency because production export was not a free requirement we wanted to impose.

**Improvement unlocked:** single canonical current method, manifest-bound timing, explicit asset registry, replace-not-accumulate documentation discipline.

## V5.1 — Clean bespoke remake — 24 s

**Goal:** remove generic asset-pack appearance and make the scene feel authored for Frankenstein.

**Replaced:** Open Peeps, Font Awesome and generic visible asset ingestion were removed from the active method.

**Tried:** bespoke vector characters/props, period-reference reconstruction, partial-face chiaroscuro, 1831-frontispiece-informed tableau, period galvanic apparatus, shot-specific transitions, narrower palette.

**Research added:** Theodor von Holst 1831 Frankenstein imagery, early-19th-century galvanism/apparatus references, period costume references.

**Found:** the film became more specific, but bespoke does not automatically mean excellent. Anatomy, gesture, cloth, face drawing, city/location specificity and hero-prop fidelity still need stronger reference-driven development. V5.1 also revealed that scoring an entire “asset” hides weak subparts.

**Improvement unlocked:** move from asset-level review to atomic Item governance.

## V5.2 — Atomic production governance — current method update

**Goal:** make every future improvement inspectable and prevent “we found an asset, so we used it” behaviour.

**Changed:**

- every visible/audible/editable element becomes an Item;
- characters, environments and apparatus are decomposed into independently judgeable sub-Items;
- requirements are defined before candidate search;
- every meaningful research source is logged in a source registry;
- hero/primary Items require candidate comparison or bespoke alternatives;
- rejected candidates and reasons are preserved;
- current V5.1 visual Items are not grandfathered into approval; they are marked for revalidation;
- source selection and asset selection are explicitly separate;
- a strict-final validator is introduced so a prototype can pass structural checks while still failing final-asset approval.

**Visual render:** no new visual version is claimed by V5.2 yet. This is a governance/method update that defines how the next visual rebuild must be executed.

## Improvement principle going forward

Each visual version must answer four questions:

1. What exact defect did we observe in the previous version?
2. What alternative approaches did we consider?
3. What did we change and why did it win?
4. What new defect or ceiling became visible after the change?

A version number is not earned by cosmetic code changes. It must represent a meaningful visual, methodological or pipeline improvement that is documented and reproducible.


## V5.2.1 — Literary-source obligations

**Goal:** prevent source-fidelity constraints from vanishing merely because no renderer Item existed for them.

**Added:**
- source-fidelity obligation layer tested against explicit edition-level evidence;
- 14 source-fidelity obligations tied to shots and Items;
- bidirectional Item <-> obligation links;
- strict-final source-fidelity blockers;
- grouped blocker reporting in the validator.

**Immediate findings:**
- the fading candle is missing from the current visual baseline;
- hard breathing is underrepresented and heartbeat does not substitute for it;
- the eye/skin treatment needs closer alignment with the literary source evidence currently under review;
- the generic Ingolstadt exterior also fails a literary location cue: a distinctive steeple should help identify the town;
- galvanic apparatus remains a historical interpretation of the novel's unspecified “instruments of life.”

**Visual render:** none claimed. V5.2.1 improves evidence and control for the next visual rebuild.


## V5.2.2 — Generalized best-fit system + formal learning loop

**Trigger:** review of V5.2.1 exposed an overconstraint: a provisional Frankenstein 1818 source preference had leaked into general method/state.

**Lesson:** reproducibility requires an explicit source decision for a final master, but quality improvement requires source/style choices to remain revisable when better evidence or a better creative solution appears.

**Changed:**
- removed any episode-specific edition from universal method state;
- source contracts are now episode-level, best-fit and revisable;
- 1818 and 1831 remain candidates/references for Frankenstein rather than framework requirements;
- edition-specific obligations remain conditional until the relevant source contract is selected;
- separated universal production governance from the Living Engraving style module and Frankenstein episode;
- added a formal learning system with EPISODE / STYLE / CATEGORY / GLOBAL scopes;
- added a reusable lesson registry so important weaknesses produce prevention rules, tests/checklists or explicit non-generalization decisions.

**New standard:** a weakness is not considered learned merely because it appears in a changelog. Learning is complete only when root cause, scope, prevention and detection are captured and encoded where appropriate.

**Visual render:** none claimed. V5.2.2 improves the machine that will produce the next render.


## V5.3 — High-information asset + JavaScript direction lookdev

**Goal:** test whether the quality ceiling improves when JavaScript stops being the sole illustrator and instead directs high-information story-specific assets.

**Tried:**
- requirements-first creature/exterior/character redesign;
- primitive-only matched stills;
- high-information engraved asset candidates;
- extraction/alpha cleanup;
- sparse-room recomposition;
- intended-scale shot tests;
- 3.04-second recoil motion test;
- 11.5-second continuous Victor -> apparatus -> eye motion test.

**What failed:**
- primitive redraws remained visibly coded even when research was correct;
- crowded asset sheets damaged HERO isolation;
- imported Victor full-body art failed when enlarged into a portrait;
- a weak isolated hand made the apparatus macro worse;
- high-detail HERO assets exposed low-detail support/environment fillers;
- a renderer primitive overwrote inherited alpha and broke the first-eye occlusion state.

**What improved:**
- creature body/head/eye became materially more anatomical and cinematic;
- Victor works at medium/full-body recoil scale;
- apparatus detail improved substantially;
- weak hand interaction was removed and replaced by a deterministic brass lever;
- first-eye shot now uses the real engraved eye with closed -> partial -> open occlusion;
- renderer alpha semantics are fixed and covered by a regression test;
- shot redesign is now explicitly allowed when an asset fails the required scale.

**Current decision:** promote the **hybrid architecture** — high-information handpicked/bespoke assets + JavaScript direction/compositing/motion — but do not claim a final V5.3 film yet.

**Remaining ceiling:** exterior/location layer and supporting chamber architecture still need to reach the new HERO quality floor; final individual source/provenance and articulated creature motion remain unresolved.

## V5.3.0-dev — Hybrid high-information look-development

**Goal:** raise the visual ceiling without sacrificing deterministic JavaScript direction.

**First attempt:** improved primitive/vector redraws for creature, Victor and Ingolstadt.

**Result:** rejected. Requirements and composition improved, but anatomy/architecture still looked like constructed code geometry.

**Pivot:** separated art authoring from film direction. High-information HERO assets may now come from the best per-Item method (handpicked public-domain source, bespoke redraw, generated illustration, etc.), while JavaScript owns composition, masks, camera, lighting, atmosphere, mechanisms, timing and final render.

**Important tests and findings:**
- crowded multi-object asset sheet rejected for HERO extraction because overlaps damaged hair, hands, cloth and alpha edges;
- individual/high-information creature body and head materially outperform primitive versions in actual shots;
- real eye detail + JavaScript occlusion mask produces a stronger dull-yellow eye reveal than procedural/generic glow;
- high-detail assets exposed the old room as too generic, leading to removal of weak shelf/anatomy/skull filler;
- old timber-grid chamber lost a matched-frame comparison to a sparse stone/plaster architecture with arch rhythm;
- rectangular Victor doorway read like a picture frame and was replaced by an arched opening with clipping/occlusion;
- Victor asset is preferred only at medium/full-body scale; portrait enlargement is explicitly rejected;
- contaminated hand interaction was removed and replaced by a controllable JavaScript brass contact/lever;
- flat Creature body supports restrained breathing/lift, but independent convulsive limb articulation remains unresolved.

**Current rule:** no full V5.3 film is promoted until HERO-shot locks pass.

**Visual render:** partial lookdev and motion tests only. V5.1 remains the last complete baseline.

## V5.4.0-dev — Ready-rigged real-animation pivot

**Trigger:** V5.3 hybrid assets improved illustration quality but still could not solve genuine articulated character performance.

**Problem identified:** a flattened image can be moved, warped and masked, but it is still not a real animated actor.

**New constraint:** do not build rigs, locomotion cycles, recoil cycles, rooms or furniture when compatible free ready assets already exist.

**Primary proof stack:** Quaternius Universal Base Characters + Universal Animation Library + Universal Animation Library 2 + compatible ready outfits/environments/props, rendered through Three.js.

**Fallback:** KayKit humanoids/animations, Kenney environments, Poly Haven HERO props.

**First test:** E-VID-006, an 8–10 second real-animation proof using only ready rigged characters and ready animation clips for the core performance.

**Style policy:** prove real skeletal motion first with simple toon/outline rendering. Do not spend time on a custom engraving shader until the animation gate passes.

**Visual render:** not yet claimed. V5.4-dev is an architectural pivot and test definition.


## V5.4.1 — Ready-rigged skeletal animation proof passes

**Goal:** answer the specific failure behind V5.3: can we get real articulated character animation without building rigs or animation cycles ourselves?

**Result:** yes.

A ready Quaternius humanoid GLB with 86 runtime clips was loaded in Three.js and rendered deterministically to a 9-second 1280×720 / 24 fps H.264 proof.

The corrected proof binds exact runtime clips:
- Idle_Loop;
- Walk_Formal_Loop;
- Interact;
- Hit_Knockback.

It demonstrates:
- planted/gait-driven locomotion;
- joint-level upper-body interaction;
- independent second-actor reaction;
- first-actor recoil;
- two independent skeletons;
- camera motion independent of character animation.

**Important failure learned:** fuzzy semantic matching originally mapped “idle” to Crouch_Idle_Loop and could not find “run” because the library names it Jog/Sprint. Final choreography now uses explicit runtime clip bindings after ingestion inventory.

**Decision:** the real-animation gate passes. Flat still-image movement is no longer the default for performance shots. The next visual work should add ready free outfits/environments/props and styling on top of this skeletal foundation rather than revisiting the moving-still architecture.
