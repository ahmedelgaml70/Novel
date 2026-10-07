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


## V5.2.1 — Literary-source obligation layer

**Goal:** prevent source-fidelity details from disappearing merely because no renderer Item existed for them.

**Changed:**
- designated the exact 1831 Project Gutenberg edition (#42324) as the prototype source text;
- retained the 1818 Project Gutenberg edition (#41445) as comparative evidence;
- added source obligations independent of visual-reference assets;
- linked affected Items bidirectionally to those obligations;
- upgraded strict-final validation to block unresolved HERO obligations and explicit source contradictions;
- converted validator output from an unbounded error dump into detailed examples plus blocker-category totals.

**Immediate findings:** the nearly exhausted candle is absent from the current render; hard breathing is underrepresented; the creature eye/skin treatment needs closer fidelity; and the galvanic apparatus is an interpretive historical reconstruction rather than a canonically specified machine.

**Visual render:** none claimed. This version improves evidence/control for the next visual rebuild.
