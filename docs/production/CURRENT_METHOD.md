# Living Engraving — Current Production Method

**Method version:** 5.2.2  
**Status:** canonical / current  
**Visual baseline:** Frankenstein V5.1. V5.2 is a governance/method update; it does not claim a new visual render.  
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
