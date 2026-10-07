# Project understanding and lessons retained

Date: 2026-10-07. Read and synchronized through origin/main
`acb1054472976ee33f0595154059dbfe708c83c8`.

## The goal

Novel is a reusable system that selects suitable complete novels and turns an
approved source into an understandable, immersive cinematic experience of about
three minutes. The viewer should feel they entered the novel. Direction, causal
storytelling, continuity, source fidelity, sound and editing define success.
Frankenstein is the current benchmark. Living Engraving is a revisable style
option. Neither defines the whole system.

The system covers discovery and eligibility, source/rights evidence, complete
novel understanding, adaptation/POV/story map, screenplay/world bible, shot and
sound planning, production, fault-routing quality review and retained learning.
Automation, cost and speed follow viewer quality in the accepted hierarchy.

## What the attempts taught us

| Attempt | Evidence and lesson | Consequence for the next work |
| --- | --- | --- |
| JavaScript feasibility and full runtime | Rendering works; three minutes amplified primitive artwork and repetition. | Test a demanding short beat before extending runtime. |
| Procedural art and texture | Effects did not repair weak anatomy, scene design or close-ups. | Correct the underlying asset and staging before treatment; test at delivery scale. |
| Generic asset ingestion | Palette and hatching did not create character/story specificity. | Ready assets still need requirements, comparison and actual-shot review. |
| Bespoke/hybrid still art | More detail helped stills; crowded sheets, alpha contamination and mixed detail caused failures. | Asset structure must fit the required motion; physical integration and supporting-art quality matter. |
| V5.3 | User rejected anatomy, hands, contacts, physics, staging, style and insufficient action. | Keep the rejection authoritative; pans and atmosphere cannot stand in for action. |
| V5.4 mechanics | Shared anchors repaired coupled coordinates; tests did not approve grip, electricity or acting. | Retain attachment lessons; inspect complete visible contact in motion. |
| Local V5.5 generated still/warp | User abandoned the approach. The mesh test pinched the torso and distorted the coat despite passing joint tests. | Stop image generation and raster warping as the performance solution. |
| V5.4.1 ready skeletal proof | Latest findings report a deterministic nine-second proof, two independent actors and 86 runtime clips. | Keep the proven foundation; do not spend another iteration proving skeletal animation. |
| Semantic clip resolver | Keyword matching selected crouch idle and unsuitable actions. | Inventory the actual export and bind explicit reviewed clip names; missing actions remain searches. |

The failed local attempt is preserved in Git stash
`8c11a8641bd19d805b2f4bc254faaf24f2cdbd5b`. It must not be restored as the
active method. It was produced from an outdated checkout; fetching and reading
the current baseline before production is now an explicit project lesson.

## Current direction and limits

Use ready compatible, rights-cleared characters, animation clips, outfits,
environments and props before custom construction. Quaternius is the documented
primary ecosystem and KayKit the fallback. Those names are search priorities,
not approval of every asset in their catalogs.

The user requires ready assets usable with Hyperframe and JavaScript. The
repository's tested skeletal renderer is Three.js. Hyperframe compatibility and
its integration role have not been verified; no integration is implemented by
this learning review.

The skeletal PASS is reported by E-VID-006_FINDINGS.md. This session did not
rerender the proof or independently approve its acting. A technical PASS does
not approve Frankenstein character identity, costume, environment, style,
sound, hands, physical support or viewer comprehension. All episode defects
and human review requirements remain unresolved.

Source selection remains OPEN and revisable. The 1818 and 1831 candidates must
be compared for the adaptation. Publication date, diegetic time and reference
date are separate; costume must not automatically inherit the edition date.

## The next experiment

Keep the existing skeletal-animation path. Verify the Hyperframe interface
before relying on it. Define one Frankenstein beat and its required actions,
contacts, framing and sound. Compare suitable ready outfit/character, set and
prop candidates; inventory actual files, dimensions, rig compatibility, clip
names, durations and provenance. Bind explicit clips and assemble the beat.

Review silent playback with a locked camera and inspect start, intermediate and
end frames at delivery size: can a viewer identify actor, action, target and
change? Check feet, weight, joints, hands, contacts, collision, identity and
source fit. Then review sound in context. Compare simple toon/outline and the
chosen engraving treatment while keeping motion readable. Do not scale runtime
until the beat passes its actual artistic/story gates.

## Audit changes and verification

The latest-main sync exposed 19 missing Item-to-source-obligation links. The
reconciliation derives reverse links from the existing obligation records; it
does not invent new literary facts. Existing `active` flags are mirrored into
the new validator's `active_in_current_cut` field: 67 records, 59 active and
eight retired. No retired Item is reactivated. The registry has 14 sources;
old prose/tests claiming 20 sources and 62 Items were stale.

The merged production validator had also lost the independent quality/memory
gate and skipped SUPPORT/ATMOSPHERIC Items in final checks. The integration is
restored: every active Item is evaluated, and shot/style defects block the same
strict-final command. An integration regression asserts that quality blockers
appear in its result.

Actual verification: structural and renderer validation passed; 33 Python and
four Node tests passed. The combined strict-final gate rejected all 59 active
Item states, the open source contract and 17 independent quality blockers.
`git diff --check` passed. Results are retained in `experiments.json`. Structural checks protect record integrity. The strict-final
gate must continue to reject incomplete source, Item, shot and style approval.

Read STATE.md, current decisions, PRODUCTION_SYSTEM.md, LEARNING_SYSTEM.md,
READY_FREE_ASSET_STRATEGY.md, READY_ASSET_INGESTION_GATE.md, E-VID-006_FINDINGS.md,
the relevant Item/source records and the episode quality review before new work.
