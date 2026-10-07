# Living Engraving — Current Production Method

**Method version:** 5.4
**Status:** canonical / current repair workflow; artistic production held for redesign
**Visual baseline:** V5.3 USER_REJECTED. V5.4 is a mechanics repair experiment, not an approved film.
**Goal:** produce an authored, cinematic, approximately three-minute novel adaptation in JavaScript without generic visible assets.

This document contains **only the active method**. Historical approaches and failed experiments belong in `VERSION_HISTORY.md`. When a method changes, remove the obsolete instruction here, replace it with the new one, update the version history, validate, and rerender. Never keep competing current instructions.

## 0. Governing files

The current production method is defined by:

- `docs/production/CURRENT_METHOD.md` — current operating procedure;
- `docs/production/ITEM_GOVERNANCE.md` — atomic Item lifecycle and approval;
- `docs/production/ITEM_CHECKLISTS.md` — category-specific considerations;
- `docs/production/SOURCE_POLICY.md` — source/provenance discipline;
- `docs/production/VERSION_HISTORY.md` — historical learning only;
- `AGENTS.md` — entry instructions for every production session;
- `docs/memory/STATE.md`, `lessons.json`, `experiments.json` — current state, corrections and tested learning;
- `docs/production/QUALITY_REVIEW.md` — shot quality and learning protocol;
- `episodes/<episode>/quality_review.json` — blocking defects and human review evidence;
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

## 2. Visual direction requires redesign

V5.3's Living Engraving execution was rejected by the user for style and quality.
Engraving is a candidate direction, not an approved house style. Do not treat
incomplete drawings, generic schematic heads, repeated open-hand shapes, weak
proportions or motionless tableaux as aesthetic conventions.

Compare materially different frames for the same narrative beat before locking
a direction. Test complete anatomy, readable action, palette, material, depth
and dedicated hero art. Review a motion sample as well as a still. Texture,
shadow and camera motion cannot rescue failed construction or unclear staging.
The user's visual-direction preference remains pending; mechanics work can proceed.

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

Avoid front-facing avatar geometry. Intentional shadow may reveal only part of a face, but the underlying construction must remain complete and plausible. Close-ups require dedicated design quality; never solve a close-up by merely zooming a weak full-body rig.

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

Electrical arcs need documented behavior and motivated contact points. The current repair experiment removes unsupported arcs and their audio. A geometric attachment test does not validate a historical circuit or discharge. Every active cable must derive both endpoints from named device ports shared with its drawing.

Global texture/post-processing happens after clean scene composition where practical. Heavy per-object/per-frame SVG filters are avoided because earlier testing showed they are computationally wasteful.

## 16. Camera and editing

Camera is an Item with its own narrative job. Record shot size, focal emphasis, horizon, angle, start/end composition, movement, easing, depth response and motivation.

Reject camera motion whose only reason is “something should move.” Required story action must read with the camera locked. Articulated movement, weight transfer and contact require their own motion review. Intentional stillness needs a narrative reason; atmosphere does not count as character action.

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

Historical title pages may guide proportion and hierarchy but should not be copied blindly. The current title uses a bundled EB Garamond Roman under SIL OFL 1.1, logged as SRC-FR-014. This is a modern revival chosen for portable prototype rendering, not proof of an exact 1818 typeface. Final edition-specific typography remains provisional.

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
  "purpose": "Mechanics diagnostic; art and electrical behavior unapproved",
  "transition_out": "hard_cut",
  "quality_status": "REDESIGN_REQUIRED",
  "cues": {}
}
```

Renderer code should implement reusable primitives and shot renderers; it should not hide story timing that belongs in the manifest.

## 20. Rendering

The current renderer uses Node, skia-canvas 3.0.8, 1280×720 at 24 fps, 48 kHz stereo audio and FFmpeg H.264/AAC output. All code-generated variation is deterministic. Install Node 22 LTS and FFmpeg through the environment’s ordinary package manager, then use the committed npm lockfile:

```bash
cd production/living_engraving
npm ci --no-audit --no-fund
npm run validate
npm run render
npm run review
```

`npm run render` recreates `frames/`, `soundscape.wav`, and `living_engraving_current.mp4`. `npm run review` creates `review-output/index.html`, shot stills, isolated transparent crops, marked context frames and solo audio WAVs. Those generated files are ignored by Git; reviewed summaries and selected evidence frames belong under the episode’s `reviews/` directory. The generated gallery is an inspection aid, not an approval.

For a partial render:

```bash
START_FRAME=432 END_FRAME=480 node render_current.js
```

Ranges are half-open frame numbers. Partial rendering is for inspection only; run the complete render before encoding a master. Review stills use integer frames divided by FPS, so they correspond to the encoded film. A chosen per-Item review frame is recorded in `review-summary.json`.

Assets are bundled, not fetched during rendering. `asset_manifest.json` binds the font, font licence and historical city plate to SHA-256. The renderer loads `assets/fonts/EBGaramond.ttf` explicitly and fails when missing. It never silently substitutes a system font. The episode and renderer manifests must match byte-for-byte as parsed objects; `validate_method.js` checks this and version agreement.

For each independently drawable component, enclose drawing calls in `paint(ctx, itemId, callback)`. Apply scene transforms outside the wrapper so solo layers preserve shot coordinates. `render(ctx, frame/FPS, itemId)` returns the selected layer with transparency; cropping is measured from nontransparent pixels. If an active Item mapped as a layer produces no pixels, review generation fails.

Do not mislabel other kinds of Item as transparent sprites:

- historical city windows are an integrated detail of the source plate;
- hatching/palette are shared visual attributes, reviewed on representative shots;
- composition/shadow masks are inspected with context;
- camera, pose motion and transitions require start/end frames and the actual video segment;
- audio requires a solo stem and listening in context;
- removed elements are explicitly retired, not silently dropped from the record.

Inspect the gallery at delivery size, then watch the encoded movie and listen to its mix. Still frames alone cannot approve movement or sound. See `episodes/frankenstein-prototype/reviews/V5_3_REVIEW.md` for observed defects and review limits.

## 21. Validation and shot lock

Run structural governance validation before claiming progress:

```bash
make production-validate
```

Structural PASS means records are internally consistent. It does **not** mean assets are final.

A shot cannot be locked until:

- independent shot and style reviews are approved; all affecting defects are resolved;
- every active Item, including support, atmospheric, style, edit and audio Items, is `FINAL_APPROVED`;
- no visible Item remains `NEEDS_REVALIDATION`, blocked, or unknown-rights;
- approval frame/motion test passes;
- audio passes in context;
- composition reads at delivery resolution;
- no Item looks imported from another visual project.

Before calling the film final:

```bash
make production-validate-final
```

The strict-final gate must fail while unresolved Items remain. It checks all active Items, requires explicit critical scores in 8–10 (missing values fail), the selected candidate’s final status, comparison coverage, external provenance, dated approved evidence with a verified file hash and real shot binding, and continuity evidence for recurring Items. Do not mark subjective scores or review verdicts merely to make the command green.

Decision evidence entries use `review_evidence: [{path, sha256, shot_id, reviewed_at, verdict}]`. Paths must be repository-relative existing files; `verdict` must be `APPROVED`. `continuity_evidence` must describe review across every recurring appearance. Keep this evidence separate from automatically generated diagnostic summaries.

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

V5.3 is USER_REJECTED. V5.4 is a focused mechanics repair experiment; the other
shots retain rejected benchmark construction and must not be presented as a
finished revision. There are 67 Item records, 59 active and 8 retired. Active
Items all require revalidation. Style, staging, hands, proportions, completeness,
meaningful character action, physical support and audio remain open quality gates.

Shared apparatus ports replace independent wire coordinates. The switch rotates
toward its actual contact; grip, wrist and a two-link arm use one state. The
unconnected foreground cable and duplicate jar are removed. Unsupported sparks,
crackle and arc-hit audio are removed. These repairs establish geometric
constraints only, not approved anatomy or a historically/electrically valid circuit.

The literary source remains the 1818 text (SRC-FR-012). The earlier tableau used
the 1831 frontispiece (SRC-FR-001); the 1801–1805 pile and later costumes remain
interpretive choices, not evidence of the novel's chronology. The novel leaves
the instruments unspecified. Resolve the adaptation/source-era contract before
claiming historical accuracy. Sources and rejected candidates remain preserved.

## 25. Memory, quality and improvement loop

Read `docs/memory/STATE.md`, atomic lessons and the episode quality review before
each production change. Identify the fault, compare solutions, write the experiment,
make one focused repair and record actual results plus remaining limitations.
Update memory at the end of the change so future chats inherit corrections.

Follow `QUALITY_REVIEW.md`. Blocking defects stay open until each affected shot
has dated, hash-bound human review evidence. Every shot needs readability,
anatomy, motion, physics, continuity, style and audio review. Generated diagnostics
and passing tests do not grant artistic approval. A pan is not proof of action.

`make production-validate` checks memory and record integrity.
`npm test` in the renderer tests geometric constraints.
`make production-validate-final` combines Item approval with the independent
quality gate. It must fail while style, shot reviews or defects remain unresolved.

A version is earned by a meaningful improvement and recorded learning. Do not
extend to three minutes until one redesigned shot passes the complete quality gate.
