# Atomic Item Governance — Current Production Rule

**Status:** accepted / current  
**Applies to:** every production shot, every visible element, every audible element, every edit decision  
**Goal:** prevent scene-level quality scores from hiding a weak character, prop, sound, effect, transition, or historical detail.

## Core rule

A scene is not an asset. A character is not one asset. A laboratory is not one asset.

Every independently judgeable element is an **Item**. Each Item must have its own purpose, constraints, evidence, source trail, candidate set when applicable, selection decision, continuity obligations, and QC state.

An Item is accepted because it is the best available solution for a defined use case—not because it happened to be found first, was easy to implement, or already exists in the renderer.

## Hierarchy

```text
FILM
  -> SEQUENCE / BEAT
      -> SHOT
          -> ITEM
              -> CANDIDATE(S)
                  -> SOURCES / EVIDENCE
                  -> DECISION
                  -> APPROVAL FRAME / AUDIO CHECK
                  -> CONTINUITY CHECK
```

An Item can appear in several shots. In that case, it keeps one identity record and has per-shot variants only where needed.

## Atomicity test

Create a separate Item when at least one of these is true:

- it can visibly or audibly fail while the rest of the shot remains acceptable;
- it has its own historical, literary, anatomical, technical, or rights constraints;
- it can be replaced independently;
- it has its own continuity requirements;
- it has its own motion or timing;
- it materially affects composition or audience attention;
- it requires a different source/evidence trail;
- it is a hero detail the audience is expected to notice.

Examples:

- `victor_character` is too broad for final QC;
- `victor_head_profile`, `victor_hair`, `victor_coat`, `victor_cravat`, `victor_hand`, `victor_recoil_pose` are independently judgeable Items;
- `galvanic_apparatus` is too broad;
- `voltaic_pile`, `leyden_jar`, `copper_wire`, `brass_contact`, and `electric_arc` are separate Items.

## Item importance

Every Item is tagged with one of four attention tiers.

| Tier | Meaning | Search / validation expectation |
|---|---|---|
| `HERO` | audience attention is intentionally directed here | exhaustive comparison; historical/story evidence; approval frame required |
| `PRIMARY` | materially supports story, character, or composition | multiple viable candidates or bespoke alternatives; explicit comparison |
| `SUPPORT` | needed for world coherence but not a focal point | evidence and fit check; comparison proportional to impact |
| `ATMOSPHERIC` | texture, particles, ambience, secondary motion | aesthetic/continuity/technical validation; source where reference-dependent |

A low-attention tier does not waive rights or provenance requirements.

## Item lifecycle

```text
DEFINED
-> REQUIREMENTS_LOCKED
-> SOURCES_COLLECTED
-> CANDIDATES_COLLECTED
-> CANDIDATES_COMPARED
-> SELECTED
-> SHOT_FIT_APPROVED
-> CONTINUITY_APPROVED
-> FINAL_APPROVED
```

Other states:

```text
REJECTED
REPLACED
NEEDS_REVALIDATION
BLOCKED_NO_SUITABLE_ASSET
REFERENCE_ONLY
```

No Item may be treated as final merely because code can render it.

## Required Item record

Every Item record in `item_inventory.json` must contain:

```json
{
  "id": "victor_coat",
  "category": "costume",
  "importance": "HERO",
  "shot_ids": ["creation_chamber", "victor_at_door"],
  "purpose": "Identify Victor as a young early-19th-century European student and preserve his silhouette across shots.",
  "requirements": {
    "story": [],
    "period": [],
    "visual": [],
    "motion": [],
    "continuity": [],
    "technical": [],
    "rights": []
  },
  "source_ids": [],
  "decision_id": "decision_victor_coat",
  "status": "NEEDS_REVALIDATION"
}
```

The requirements are written **before** final asset selection. This prevents the found asset from defining the requirement after the fact.

## Candidate-before-selection rule

The workflow is:

```text
DEFINE WHAT WE NEED
-> DEFINE HOW WE WILL JUDGE IT
-> SEARCH / DESIGN MULTIPLE SOLUTIONS
-> LOG EVERY MEANINGFUL SOURCE
-> REJECT UNSUITABLE CANDIDATES EXPLICITLY
-> COMPARE VIABLE CANDIDATES AGAINST THE SAME REQUIREMENTS
-> PICK THE WINNER
-> TEST IT IN THE ACTUAL SHOT
```

Never:

```text
FIND ASSET
-> invent reasons it is good
-> force the scene around it
```

## Search stopping rule

For `HERO` and `PRIMARY` visible Items, do not stop at the first acceptable candidate.

Search until one of these conditions is met:

1. at least **3 materially different viable candidates** have been compared, from at least **2 independent sources**, and the winner is clear; or
2. a bespoke design has been produced and compared against at least **2 external references / alternative directions**; or
3. the search has been exhausted enough to document `BLOCKED_NO_SUITABLE_ASSET`, in which case the Item must be redesigned rather than filled with generic art.

For `SUPPORT` Items, the minimum comparison can be smaller, but the record must still explain why the selected solution is appropriate.

## Global validation dimensions

Every visible Item is scored on the dimensions that apply to it. Scores are 0–10.

- **story specificity** — does it belong to this exact novel/scene?
- **source fidelity** — does it contradict the novel or chosen adaptation contract?
- **period fit** — is it plausible for the intended time/place?
- **functional accuracy** — for apparatus/tools, does form reflect function?
- **anatomical / physical plausibility** — when applicable.
- **style fit** — does it belong to the film's visual language without looking imported?
- **shot fit** — perspective, silhouette, scale, crop, focal hierarchy, lighting.
- **continuity fit** — can it remain the same identity across shots?
- **animation suitability** — can it move/layer without falling apart?
- **technical quality** — resolution/vector quality, edges, alpha, performance.
- **rights confidence** — exact provenance and permitted use are recorded.
- **originality / non-genericity** — would this still look authored for this film?

The core hard gate remains:

```text
story_specificity >= 8
period_fit >= 8
style_fit >= 8
rights/provenance known
```

For `HERO` Items, the selected candidate should normally score >= 8 on every applicable critical dimension, not merely average above 8.

## Weighted scoring is secondary

A weighted score may help rank viable candidates, but it cannot rescue a hard failure. A beautiful but historically wrong prop is rejected. A perfectly accurate but generic-looking hero character is rejected. An ideal-looking asset with unclear rights is rejected.

## Selection decision record

`asset_decisions.json` stores both the winner and the rejected alternatives.

A selection record must answer:

- What job does this Item perform?
- What were the non-negotiable requirements before search?
- Which sources defined those requirements?
- Which candidates were considered?
- Why was each rejected candidate rejected?
- Why is the winner better for this exact shot/use case?
- What trade-off remains?
- What approval frame/timecode proves the choice works?
- What would trigger replacement later?

A decision with only `selected_asset: X` is incomplete.

## Bespoke is not automatically best

A bespoke vector can still be anatomically weak, historically generic, compositionally poor, or visually amateur. Bespoke work must compete against references and alternative designs using the same gate.

Likewise, a historical/public-domain asset is not automatically good merely because it is authentic or free. It must satisfy the current shot.

## Source registry rule

Every source discovered during research that materially informs a requirement, candidate, rejection, rights decision, or art direction is entered in `source_registry.json` immediately.

Sources are retained even if the candidate they support is rejected. The purpose is to preserve what we learned and prevent repeated research.

See `SOURCE_POLICY.md`.

## Shot lock rule

A shot cannot be marked production-ready until:

- all `HERO` Items are `FINAL_APPROVED`;
- all `PRIMARY` Items are at least `CONTINUITY_APPROVED`;
- no visible Item is `BLOCKED`, `UNKNOWN_RIGHTS`, or `NEEDS_REVALIDATION`;
- the shot has an approval still or short motion test;
- audio Items have been checked in context;
- composition remains readable at delivery resolution;
- no Item looks like it came from a different visual project.

## Current Frankenstein consequence

The existing V5.1 film is a **prototype benchmark**, not a final asset-approved production. It contains strong bespoke work, but many Items were selected before this atomic comparison protocol existed.

They are therefore recorded as `NEEDS_REVALIDATION` until they have been compared under this policy. We do not grandfather them into approval merely because they already appear in the renderer.

## Replacement discipline

When an Item is replaced:

1. update its decision record;
2. mark the previous selection `REPLACED` with the reason;
3. update source references if new research was used;
4. update affected shot approval frames;
5. rerun continuity checks;
6. record the methodological learning in `VERSION_HISTORY.md` if the change teaches a reusable lesson;
7. do not keep two active current selections for the same Item.

The repository should always make it obvious what is current.

## Learning closeout

When an Item fails or an improvement materially succeeds, decide whether the finding is EPISODE, STYLE, CATEGORY or GLOBAL.

A meaningful issue is not closed by replacement alone. Record the reusable lesson in the learning system when appropriate, including root cause, prevention and detection. Then encode the prevention in the strongest reasonable mechanism: validator/test, structured record, checklist, method rule, benchmark or episode-only note.

Do not promote novel-specific facts into global rules. See `LEARNING_SYSTEM.md`.
