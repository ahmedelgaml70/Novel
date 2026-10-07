# Living Engraving — Current Production Method

**Method version:** 5.3.0-dev  
**Status:** canonical / current  
**Visual baseline:** Frankenstein V5.1 remains the last complete baseline. V5.3 is active look-development: hybrid high-information assets + JavaScript direction. No full V5.3 film is promoted until HERO-shot locks pass.  
**Goal:** produce an authored, cinematic, approximately three-minute novel adaptation in JavaScript without generic visible assets.

This document contains **only the active method**. Historical approaches and failed experiments belong in `VERSION_HISTORY.md`. When a method changes, remove the obsolete instruction here, replace it with the new one, update the version history, validate, and rerender. Never keep competing current instructions.

## 0. Governing files

The current production method is defined by:

- `docs/production/CURRENT_METHOD.md` — current operating procedure;
- `docs/production/ITEM_GOVERNANCE.md` — atomic Item lifecycle and approval;
- `docs/production/ITEM_CHECKLISTS.md` — category-specific considerations;
- `docs/production/SOURCE_POLICY.md` — source/provenance discipline;
- `docs/production/VERSION_HISTORY.md` — historical learning only;
- `episodes/<episode>/item_inventory.json` — every atomic visible/audible/edit Item;
- `episodes/<episode>/source_registry.json` — every material source discovered;
- `episodes/<episode>/asset_decisions.json` — candidates, rejections and selections;
- `episodes/<episode>/scene_manifest.json` — shot order, timing and local cues;
- `production/living_engraving/render_current.js` — one canonical renderer.

No Item is final merely because it already exists in the renderer.

## 1. Output standard

The film must feel authored for one specific novel, not like a book-summary template, explainer animation, icon video, stock-motion graphic or unrelated asset collection.

A visible element may enter the final film only as:

1. bespoke art created for this production;
2. a handpicked rights-cleared historical/public-domain asset that genuinely wins for the use case; or
3. a bespoke reconstruction informed by documented references.

Generic icon packs, generic character packs, random stock illustration, placeholder SVGs and visually convenient but historically implausible props are forbidden in final shots.

Minimum hard gates for visible final Items:

```text
story_specificity >= 8/10
period_fit >= 8/10
style_fit >= 8/10
rights/provenance known
```

For HERO Items, all applicable critical dimensions should normally be >= 8.

## 2. Current visual language

The current house style is **Living Engraving**:

- early-19th-century engraved/etched illustration;
- black, parchment, smoke and muted sepia;
- cold cyan reserved for unnatural/electrical light;
- brass/copper only where materially justified;
- strong chiaroscuro;
- incomplete faces rather than clean avatar portraits;
- irregular profiles and silhouettes;
- dense hatch/cross-hatch in shadow;
- paper fibre and ink texture;
- deterministic micro-jitter/line boil;
- restrained character motion;
- purposeful camera movement;
- atmosphere, cloth and light carrying much of the motion.

Readability comes from value separation, silhouette, rim light and composition—not by turning the palette bright or modern.

## 3. Repository structure

```text
docs/production/
  CURRENT_METHOD.md
  ITEM_GOVERNANCE.md
  ITEM_CHECKLISTS.md
  SOURCE_POLICY.md
  VERSION_HISTORY.md

episodes/<episode>/
  README.md
  VERSION_LOG.md
  item_inventory.json
  source_registry.json
  asset_decisions.json
  scene_manifest.json

schemas/production/
  item.schema.json
  source.schema.json
  asset_decision.schema.json

production/living_engraving/
  METHOD_STATE.json
  render_current.js
  scene_manifest.json
  validate_method.js
  render.sh
  package.json

scripts/validate_production_records.py
tests/test_production_governance.py
```

Do not create active files called `render_v4.js`, `final2.js`, `old_method.md`, etc. Git history and version history retain the past.

## 4. Story first

Before visual work:

1. designate the exact novel source/edition under the source-rights process;
2. understand the complete novel, not only a summary;
3. choose the adaptation concept and POV contract;
4. build the three-minute story map;
5. create an audiovisual screenplay;
6. create the shot/sound plan;
7. only then begin final Item design.

Each shot must establish, reveal, escalate, reframe or pay off something. Delete decorative shots that do none of these.

POV is used when it increases immersion or helps us experience the novel directly. Mix subjective POV, observer shots, environmental wides, silhouette mediums, object macros and rare character close-ups. Do not impose a fixed POV percentage.

## 5. Decompose every shot into atomic Items

A scene is not one asset. A character is not one asset. An apparatus is not one asset.

Apply the atomicity test from `ITEM_GOVERNANCE.md`. Separate anything that:

- can fail independently;
- has independent period/story/anatomy/rights constraints;
- can be replaced independently;
- needs its own continuity;
- has its own motion/timing;
- materially affects attention/composition;
- needs a different evidence trail.

Example:

```text
Victor
  -> silhouette
  -> head profile
  -> hair
  -> coat
  -> collar/cravat
  -> hand
  -> recoil pose
  -> gaze
  -> lighting exposure
  -> motion

Galvanic apparatus
  -> voltaic pile
  -> Leyden jar
  -> brass contact
  -> copper wire network
  -> electric arc
```

Every Item receives a tier: `HERO`, `PRIMARY`, `SUPPORT` or `ATMOSPHERIC`.

## 6. Lock requirements before searching

For each Item, define the need before looking for an asset:

- narrative purpose;
- source-fidelity constraints;
- period/location constraints;
- visual/silhouette requirements;
- anatomy/physical requirements when applicable;
- motion/animation requirements;
- continuity obligations;
- technical constraints;
- rights/provenance constraints.

If an asset is found first and the requirements are written afterward to justify it, the selection process is invalid.

## 7. Research and source logging

Whenever a material source is found, add it immediately to `source_registry.json` even if no asset from that source is ultimately used.

Log:

- exact title;
- creator;
- date;
- provider;
- stable URL;
- source roles;
- Items supported;
- rights status/evidence;
- whether visible commercial use is allowed or reference-only;
- authority and period proximity;
- notes on what the source proves and what it does not prove.

Source quality preference:

```text
primary-period source / surviving object
> museum, library or archive catalogue
> scholarly secondary source
> documented public-domain repository
> specialist secondary source
> general reference
> community repost / unsourced image
```

A source is evidence. It is **not automatically the asset**.

## 8. Candidate search: best fit, not first found

For HERO and PRIMARY visible Items, do not stop at the first acceptable asset.

Continue until one of these is true:

1. at least three materially different viable candidates from at least two independent sources are compared and one clearly wins;
2. a bespoke design is compared against at least two external references or alternative directions; or
3. no solution is good enough and the Item is explicitly marked `BLOCKED_NO_SUITABLE_ASSET`.

If blocked, redesign the shot/Item. Do not insert generic filler.

Bespoke art must compete too. “We drew it ourselves” does not excuse weak anatomy, period errors or generic design.

## 9. Candidate comparison

Use the same rubric for all candidates that compete for an Item:

- story specificity;
- source fidelity;
- period fit;
- functional accuracy;
- anatomical/physical plausibility;
- style fit;
- shot fit;
- continuity fit;
- animation suitability;
- technical quality;
- rights confidence;
- originality/non-genericity.

Weighted scores may rank otherwise viable solutions, but a weighted average can never rescue a hard failure.

Examples:

- beautiful but wrong-period -> reject;
- accurate but visibly generic HERO asset -> reject;
- perfect-looking but unclear rights -> reject;
- authentic historical image that destroys depth/editability -> may lose to a bespoke reconstruction.

## 10. Record the decision

`asset_decisions.json` must preserve the winner **and meaningful rejected alternatives**.

Each decision records:

- Item job;
- requirements that existed before search;
- source evidence;
- candidates;
- per-candidate scores;
- rejection reasons;
- why the selected candidate wins for this exact use case;
- remaining tradeoff/risk;
- approval frame/timecode or audio check;
- replacement trigger.

Do not erase rejected research. It prevents the same weak direction from being rediscovered later.

## 11. Test in the real shot

Do not approve visual Items on a white background alone.

A candidate reaches `SHOT_FIT_APPROVED` only after testing:

- intended crop;
- perspective;
- scale;
- lighting;
- depth plane;
- neighboring Items;
- motion;
- delivery resolution.

It reaches `CONTINUITY_APPROVED` only after every recurring appearance is checked.

For every important shot, make a static approval frame before animating it. Fix composition, anatomy and prop plausibility in the still first.

## 12. Characters

Character design is reference-driven.

Validate separately:

- identity/silhouette;
- body proportions;
- head profile;
- hair/facial hair;
- costume;
- hands;
- gesture/pose;
- gaze/expression;
- lighting exposure;
- recurring-angle continuity.

Avoid front-facing avatar geometry. In Living Engraving, faces should often emerge partially from shadow. Close-ups require dedicated design quality; never solve a close-up by merely zooming a weak full-body rig.

For creatures, start from the novel’s descriptors rather than later film iconography.

## 13. Environments and location specificity

Named locations require location-specific research when visually important. A generic Gothic skyline is not acceptable for Ingolstadt simply because it looks atmospheric.

Validate:

- real place/era;
- roofline/building types;
- materials;
- window/door proportions;
- urban density;
- room purpose and circulation;
- plausible light sources;
- character blocking.

Environment depth is built from independently controllable planes. Parallax must be restrained; excessive movement makes the style feel like cardboard theatre.

## 14. Props and apparatus

Define mechanical/narrative function before drawing.

For hero apparatus validate:

- date/technology;
- materials;
- dimensions;
- construction logic;
- terminals/controls;
- how a hand interacts;
- wear;
- visual readability;
- relationship to the source novel.

Museum objects and contemporary technical plates are preferred factual evidence. Never choose something because it merely “looks scientific.”

## 15. Lighting, atmosphere and effects

Every strong light should have a motivated source unless expressionism is explicitly chosen.

Atmospheric layers—rain, fog, dust, cloth, smoke, lightning—must respond to scene depth, wind, light and story. They are not universal overlays.

Electrical arcs are cinematic effects separate from the historical apparatus. Their origin/contact points, scale, duration and brightness must be deliberate; avoid modern neon aesthetics.

Global texture/post-processing happens after clean scene composition where practical. Heavy per-object/per-frame SVG filters are avoided because earlier testing showed they are computationally wasteful.

## 16. Camera and editing

Camera is an Item with its own narrative job. Record shot size, focal emphasis, horizon, angle, start/end composition, movement, easing, depth response and motivation.

Reject camera motion whose only reason is “something should move.”

Transitions are story grammar, not decoration. Prefer hard cuts when stronger. Do not repeat one signature transition until it becomes a template.

## 17. Typography

Typography requires its own evidence and licensing.

Determine:

- relation to edition/publication era;
- whether it is editorial or diegetic;
- hierarchy;
- kerning;
- safe area;
- contrast;
- duration;
- font licence.

Historical title pages may guide proportion and hierarchy but should not be copied blindly. The current Frankenstein title remains provisional until the 1818-versus-1831 typography direction is deliberately selected.

## 18. Audio is atomic too

Split audio into individually judgeable Items:

- narration;
- dialogue;
- inner voice;
- ambience;
- Foley;
- music;
- silence;
- thunder/weather;
- electrical effects;
- heartbeat/breath;
- transitions.

Each cue must have a narrative and spatial cause. Avoid generic “cinematic ambience.”

All event timing lives locally with its shot in `scene_manifest.json`. Do not maintain a second hidden absolute timeline. Moving a shot must move its footsteps, thunder, heartbeat, arcs and other cues automatically.

## 19. Manifest-driven film

The scene manifest is the declarative film plan.

Each shot contains at least:

```json
{
  "id": "galvanic_contact",
  "renderer": "galvanicContact",
  "duration": 4.0,
  "purpose": "...",
  "transition_out": "arc_match_cut",
  "cues": {
    "electrical_crackle": [[0.8, 3.7]],
    "arc_hits": [1.34, 2.17, 3.13]
  }
}
```

Renderer code should implement reusable primitives and shot renderers; it should not hide story timing that belongs in the manifest.

## 20. Rendering

Current baseline requirements:

- JavaScript/Node renderer;
- deterministic frame generation;
- 1280×720 prototype delivery;
- 24 fps current baseline;
- 48 kHz stereo audio;
- FFmpeg for H.264/AAC assembly;
- procedural randomness seeded so rerenders are reproducible.

Render partial frame ranges during development. Do not rerender a full three-minute film to inspect one Item.

## 21. Validation and shot lock

Run structural governance validation before claiming progress:

```bash
make production-validate
```

Structural PASS means records are internally consistent. It does **not** mean assets are final.

A shot cannot be locked until:

- every HERO Item is `FINAL_APPROVED`;
- every PRIMARY Item is at least `CONTINUITY_APPROVED`;
- no visible Item remains `NEEDS_REVALIDATION`, blocked, or unknown-rights;
- approval frame/motion test passes;
- audio passes in context;
- composition reads at delivery resolution;
- no Item looks imported from another visual project.

Before calling the film final:

```bash
make production-validate-final
```

The strict-final gate must fail while unresolved Items remain. That failure is correct and informative.

## 22. Scaling to three minutes

Do not build the final three-minute runtime by making twenty weak shots at once.

Use this loop:

1. build the beat map;
2. decompose the next shot into Items;
3. research/compare HERO and PRIMARY Items;
4. approve static frame;
5. approve motion/audio;
6. lock the shot;
7. move to the next shot;
8. periodically watch all locked shots together for global continuity.

Reuse **systems and verified primitives**, not generic visible art. A reusable camera, fog solver or hatching function is desirable. A generic recurring character pack is not.

## 23. Replacement discipline

When an Item is replaced:

1. update the decision record;
2. mark the old selection `REPLACED` and retain the reason;
3. add any new sources;
4. update approval frames;
5. rerun continuity;
6. update version history when the change teaches a reusable lesson;
7. remove the obsolete current instruction/selection.

There must be one obvious current solution.

## 24. Current Frankenstein status

Frankenstein V5.1 is a benchmark prototype, not a final asset-approved film.

The V5.2 audit isolates **62 Items** across global material, exterior, chamber, Victor, creature, apparatus, atmosphere/edit, typography and audio.

The current strict-final validator intentionally fails because many Items were created before requirements-before-search and candidate-comparison rules existed.

Known current examples:

- the generic Ingolstadt roofline is rejected for final use and must be rebuilt from location-specific historical evidence;
- Victor’s coat is provisional until costume direction is deliberately resolved;
- the current voltaic pile/Leyden jars are promising bespoke reconstructions but require final historical/shot-fit comparisons;
- the title treatment remains provisional;
- parent composition cannot override failed child Items.

V5.1 Items are **not grandfathered** into approval.

## 25. Improvement loop

Every new visual version must answer:

1. What exact defect did the previous version expose?
2. What alternatives were considered?
3. What changed, and why did it win?
4. What new ceiling became visible after the improvement?

A version number is earned by a meaningful visual, methodological or pipeline improvement—not by cosmetic code changes.


## 26. Source contracts and source-fidelity obligations

The framework does **not** prescribe one edition, translation, visual style, or source strategy for every novel.

Each episode has a **source contract** that is selected for that episode and remains revisable when better evidence appears.

### Source-contract lifecycle

```text
SOURCE CANDIDATES
→ COMPARE AGAINST ADAPTATION GOAL
→ PROVISIONAL CHOICE
→ BUILD / TEST
→ RECONSIDER IF BETTER EVIDENCE APPEARS
→ LOCK FOR FINAL MASTER
```

The source contract should consider:
- completeness and integrity;
- source/edition significance;
- wording and narrative consequences;
- language/translation quality;
- rights/provenance;
- suitability for the intended adaptation;
- whether another source would materially improve fidelity or the viewer experience.

Do **not** lock a source because it was researched first.

A source may be replaced later. When that happens:
1. record why the replacement is better;
2. identify which obligations/Items depend on the old source;
3. regenerate or re-evaluate those obligations;
4. rerun affected shot/continuity checks;
5. retain the old decision in history, not in the current instructions.

### Source obligations

Material facts from candidate/selected literary sources are stored in `source_obligations.json`.

Obligations are evidence-bound:
- common facts may apply across several source candidates;
- edition/translation-specific facts remain conditional until that source is selected;
- interpretive choices must be identified as interpretations rather than canon.

An obligation may be represented, deliberately adapted, or intentionally omitted. It may not disappear accidentally because no renderer Item implemented it.

The strict-final gate requires a deliberate source contract for the final master, but **development remains flexible** and can switch to a better source at any time through the replacement process.

## 27. Learning system

Every meaningful weakness should improve future production, not only the current shot.

Use:

```text
OBSERVE
→ DEFINE THE DEFECT
→ IDENTIFY ROOT CAUSE
→ DETERMINE SCOPE
→ PROPOSE PREVENTION
→ TEST THE FIX
→ PROMOTE THE LESSON
→ ENCODE THE PREVENTION
→ VERIFY ON FUTURE WORK
```

Possible scopes:
- `EPISODE` — specific to one novel/scene;
- `STYLE` — specific to Living Engraving or another visual language;
- `CATEGORY` — e.g. hands, historical props, typography, audio;
- `GLOBAL` — should apply to any Novel production.

A lesson is not complete until it produces at least one concrete prevention mechanism where appropriate:
- current-method rule;
- Item checklist;
- validator/test;
- source/candidate requirement;
- renderer primitive change;
- QC check;
- benchmark/experiment;
- explicit episode-only note if it should **not** generalize.

Do not overfit Frankenstein. Episode facts stay in the episode. Only reusable lessons are promoted into the general method.

## 28. Asset-authoring method is chosen per Item

Do not force one art-authoring method across the entire film.

For each visual Item, compare the method that best preserves the required information:
- direct rights-cleared historical/public-domain asset;
- bespoke redraw/trace/vectorization from one or more references;
- bespoke generated illustration constrained by the locked Item requirements;
- procedural JavaScript/vector geometry;
- 3D/mesh or another method when spatial/motion requirements justify it.

JavaScript remains the director/compositor/animator. It does not need to redraw every HERO object from primitives.

### HERO source-file rule

If clean isolation matters, HERO assets should normally exist as independent source files with generous transparent margins. A crowded multi-object sheet is not a final production source when overlap damages hair, hands, cloth, silhouette or alpha edges.

Asset sheets remain useful for ideation and some SUPPORT assets, but they must pass an isolation test before promotion.

## 29. Detail-hierarchy gate

Upgrading the focal asset raises the minimum acceptable quality of nearby SUPPORT Items.

When HERO art becomes more detailed:
1. inspect the surrounding environment/props at the same frame;
2. raise them to a compatible quality level or remove/simplify them;
3. prefer negative space, shadow and atmosphere over weak filler;
4. do not use texture/fog to hide a visible detail mismatch.

A cleaner sparse shot is preferred to a busy shot containing visibly cheaper assets.

## 30. Motion degrees of freedom before asset approval

Before choosing the final asset structure, define what the shot actually needs to move.

Use three practical motion classes:
- `RIGID/SUBTLE` — translation, rotation, scale, breathing, tiny tremor, camera/parallax; a flat asset may be sufficient.
- `DEFORMABLE` — cloth, hair, face planes, bending surfaces; use separated layers, masks, mesh/deformation or purpose-built animation.
- `ARTICULATED` — independent limbs/fingers/joints; use separate parts, rig, mesh or dedicated animated asset.

Do not approve a beautiful static HERO asset for an articulated action unless the required degrees of freedom are actually available.


## 31. Asset approval is shot-scale specific

An asset is not simply “approved” in the abstract.

Record the scale/use cases it has actually passed, for example:
- extreme close-up;
- portrait;
- medium;
- full-body;
- wide silhouette;
- macro prop;
- thumbnail/background.

A candidate that passes at medium/full-body scale may still fail as a portrait source. Do not upscale beyond the validated information content and then compensate with filters.

If a shot asks an otherwise strong asset to operate outside its validated scale, compare two options:
1. author/acquire a dedicated higher-detail asset for that shot; or
2. redesign the shot around the scale the asset genuinely supports.

Choose whichever produces the stronger film. Shot design is revisable; the asset does not dictate the story.

## 32. Weak interaction assets may be removed by shot redesign

Do not keep a weak hand, face, prop or interaction merely because the initial storyboard included it.

If the narrative beat can be expressed more clearly with a better-controllable primitive or edit, redesign it.

Example pattern:
- contaminated/weak hand on a switch fails the gate;
- the shot instead uses a historically plausible lever/contact whose motion is deterministic in JavaScript;
- the human presence can remain in the adjacent shot rather than forcing a bad hand close-up.

This is not “working around quality.” It is choosing the strongest visual grammar for the beat.

## 31. HERO-shot lock before full render

Do **not** render the full film merely because the renderer works.

Before a full-quality sequence render, lock representative approval frames/motion tests for the highest-risk HERO clusters. For the current benchmark these are:

1. story/location-defining exterior;
2. main character at the shot scale actually used;
3. opposing/creature character body and hero close-up;
4. hero prop/mechanism macro;
5. primary environment/set composition.

A HERO lock requires:
- actual shot crop, not isolated asset only;
- delivery-size inspection;
- lighting/mask integration;
- alpha/edge cleanliness;
- continuity with adjacent shots;
- required motion test when movement matters;
- provenance/rights status known enough for the current development stage;
- explicit remaining risks.

If one HERO cluster fails, redesign that Item/shot before rendering the whole film.

## 32. Shot-scale approval is conditional

Asset approval is tied to the scale/use that was tested.

An asset that passes as a medium/full-body silhouette is **not** automatically approved for portrait or macro use. Likewise, a detailed close-up asset is not automatically suitable for wide-shot animation.

Record an approved usage envelope where it matters:

```text
WIDE / SILHOUETTE
MEDIUM / FULL BODY
CLOSE-UP
MACRO
STATIC / RIGID-SUBTLE / DEFORMABLE / ARTICULATED
```

If the story does not require the failing scale, redesign the shot around the asset's proven strength instead of forcing an inferior enlargement.

Current example: the V5.3 Victor asset is preferred for medium/full-body recoil. Portrait-scale use is rejected until a dedicated portrait asset exists.

## 33. Current environment rule: sparse architecture beats low-quality filler

The current Living Engraving chamber uses a sparse stone/plaster architectural shell rather than the old timber-grid room.

Current set hierarchy:

```text
stone/plaster shadow mass
architectural arch/pier rhythm
handpicked Gothic window
arched doorway
slab/table
apparatus
dying candle
character assets
wire/fog/light
```

The old generic shelf/books/anatomy-page/skull filler is **not part of the current chamber method**.

A supporting set element is added only when it improves story, space, period identity or composition enough to justify its visual cost.

## 34. Doorway/character integration rule

Do not place a character inside a rectangular decorative frame that reads as a pasted picture.

For doorway shots:
- build the architectural opening first;
- clip/occlude the character into the opening;
- preserve jamb/arch overlap and floor relationship;
- use local shadow/light to anchor the body;
- test at the intended shot scale.

The current Victor doorway uses an arched opening and medium/full-body recoil asset. The previous rectangular framed presentation is obsolete.

## 35. Hybrid asset architecture — current V5.3 direction

For high-information HERO art, the current preferred architecture is:

```text
requirements
→ source/reference research
→ candidate authoring method
→ clean independent asset
→ alpha/edge QC
→ actual-shot composite
→ shot-scale + motion validation
→ JavaScript direction/compositing
→ final frame sequence
```

JavaScript currently owns:
- deterministic composition;
- camera/parallax;
- masks/occlusion;
- lighting and color normalization;
- fog/rain/particles;
- rigid/subtle motion;
- procedural mechanisms such as the brass contact;
- transitions and timing;
- typography;
- audio synchronization;
- final rendering.

The visible art-authoring method remains per-Item. Primitive geometry is retained where it is genuinely best (for example a controllable contact lever), not as a requirement for every visible object.

## 36. Alpha-isolation QC

A visually cropped asset is not automatically a clean isolated asset.

For assets expected to be one connected object:
1. inspect the alpha mask;
2. count connected non-transparent components;
3. inspect the bounds/area of every component;
4. keep only the intended object component(s);
5. rerender the actual shot at the tightest approved scale;
6. reject unexplained floating fragments before approval.

Manual rectangular erasing is only a first cleanup pass. Macro/close-up Items require structural alpha QC because tiny source-sheet fragments can become conspicuous after scaling.

For intentionally disconnected objects (for example separate wires/parts), define the expected component set instead of blindly keeping only the largest component.

## 37. Current-cut inventory hygiene

The current Item inventory must describe the **actual current cut**.

When an Item is removed or replaced:
1. remove it from the active shot membership;
2. set `active_in_current_cut: false`;
3. retain prior shot membership/reason as history;
4. mark its decision inactive/replaced;
5. ensure strict-final validation ignores it unless it returns;
6. keep the historical learning in version/decision history.

Do not leave an obsolete Item active merely because it once existed in the renderer. This creates false blockers and makes the documentation contradict the current film.

If an inactive Item returns later, reopen its requirements and validation rather than silently reactivating its old approval.
