# Frankenstein Prototype — Version Log

## V5.1 — clean bespoke visual baseline

### Intent
Remove the obvious asset-library look that remained in V4.

### Replaced
- Open Peeps visible character atoms;
- Font Awesome visible story props;
- generic icon ingestion as a production strategy;
- repeated universal transition logic.

### Added
- bespoke vector characters and props;
- partial-face chiaroscuro;
- 1831-frontispiece-informed composition;
- period galvanism references;
- shot-specific transitions;
- a narrower Living Engraving palette.

### What improved
The film became more authored and story-specific. Character/environment/prop integration became visually more coherent.

### Defects exposed
- bespoke art can still be weak;
- anatomy, gesture and cloth need better reference-driven design;
- Ingolstadt exterior is stylistically coherent but too generic;
- hero apparatus needs finer historical/functional validation;
- typography direction was convenient rather than deliberately chosen;
- scoring “Victor” or “laboratory” as one asset hides weak subparts.

## V5.2 — atomic governance audit

### Intent
Make every visible/audible/edit decision individually inspectable and prevent first-found-asset selection.

### Audit result
- 62 atomic Items;
- 62 decision records;
- 11 material research sources currently logged;
- 6 prototype shots;
- structural validation passes;
- strict-final validation intentionally fails.

### Important current decisions
- reject the generic V5.1 Ingolstadt skyline for final use;
- rebuild exterior identity from location-specific period evidence;
- keep the 1831-informed creation tableau direction, but block final approval until child Items pass;
- Victor's coat remains unresolved until the costume-year/art-direction contract is deliberate;
- voltaic pile and Leyden jars remain promising bespoke reconstructions, not final-approved assets;
- title treatment remains provisional.

### Next improvement target
Rebuild the highest-risk HERO Items first: Ingolstadt exterior, Victor profile/pose/hands/costume, creature anatomy/eye/drapery, and apparatus contact macro. Do not spend effort polishing low-impact texture while HERO Items remain weak.


## V5.2.1 — source-fidelity obligation audit

### Intent
Test explicit edition-level source obligations alongside the existing Item audit rather than relying only on visual/historical references.

### Added
- 14 literary-source obligations;
- Item cross-links for 19 affected Items;
- 1818 and 1831 Project Gutenberg editions retained as candidate/comparative sources; no edition is globally enforced;
- 1831 edition retained as alternative/comparative evidence;
- source-obligation schema and validation.

### New defects exposed
- nearly exhausted candle: missing from current render;
- hard breathing: not directly represented;
- dull-yellow eye / yellow-skin contrast: only partially represented;
- creature's initial convulsive motion: only partially represented;
- Ingolstadt steeple/location identity: too weak in current generic skyline.

### Clarification
The current voltaic pile, Leyden jars and electrical contact are interpretive historical reconstructions. They are not presented as apparatus explicitly named by Shelley.

### Next visual priority
Use the combined literary + historical constraints to rebuild the exterior, creature eye/skin/motion, dying practical light, Victor/creature reaction, and apparatus macro before any global polish pass.


## V5.2.2 — source-contract flexibility correction

### Problem found
The first V5.2.1 implementation made the 1818 source choice too rigid and allowed an episode-specific decision to leak into method state.

### Correction
- source contract is OPEN and best-fit/revisable during development;
- 1818 and 1831 are candidates/references rather than universal requirements;
- edition-specific obligations remain conditional;
- a future better source may replace the current direction through explicit dependency revalidation;
- Frankenstein remains only a worked example of the general system.

### Reusable lesson
Do not confuse reproducibility with immutability. Final output needs a recorded source contract; development must remain free to adopt a demonstrably better source, style, asset or method.

## V5.3 — asset-authoring lookdev (not full-film release)

### Trigger
V5.3 primitive lookdev improved research/source logic but still looked visibly coded and low-detail.

### Tried
- high-information engraved creature/Victor/apparatus/window candidates;
- alpha isolation and JS compositing;
- matched shot crops;
- sparse-room remake that deletes weak filler;
- 3.04-second recoil motion test.

### What improved
- creature anatomy/cloth reads substantially stronger;
- Victor has a more credible period silhouette;
- apparatus and window carry much more historical/visual detail;
- the sparse composition feels cleaner and more authored than the primitive chamber.

### New weaknesses exposed
- crowded asset sheets contaminate HERO extraction;
- premium focal assets reveal low-detail SUPPORT assets immediately;
- static high-detail art has limited articulation;
- exterior remains below target;
- hand/contact interaction needs a dedicated asset;
- no complete V5.3 film should be rendered yet.

### Decision
Promote the asset-authoring architecture, not the current salvaged source files. Produce clean individual HERO assets, preserve JS direction/compositing, and continue lookdev before full render.


### Phase 3 — intended-scale hybrid motion gate

- Creature body/head/eye: promoted to preferred provisional direction after actual shot/motion tests.
- Victor: medium/full-body recoil use passes directionally; portrait enlargement explicitly rejected.
- Victor close-up shot: redesigned to medium doorway recoil rather than forcing weak portrait art.
- Galvanic macro: isolated hand removed; JavaScript brass lever/contact now performs the action.
- First-eye: real engraved eye retained; JS mask now creates closed -> partial -> open states.
- Renderer bug found: ellipse primitive overwrote inherited alpha. Canonical helper now multiplies alpha and a regression test covers it.
- Continuous 11.5-second Victor -> apparatus -> eye test rendered successfully.

### Current blockers
- Ingolstadt exterior still below target;
- creation-chamber support/environment detail still below the new HERO floor;
- clean individually authored final source files/provenance remain preferable to salvaged sheet-derived candidates;
- true independent creature-limb convulsion needs articulated asset structure if retained visibly.

### Decision
Continue V5.3 lookdev. Do not promote a complete film until the exterior/environment gate and remaining source/articulation issues pass.
