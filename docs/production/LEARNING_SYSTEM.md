# Production Learning System

## Purpose

Novel should get better because of its failures.

A weakness is not considered "learned" merely because it appears in a changelog. A lesson is complete only when the system can explain:

1. what failed;
2. why it failed;
3. whether the cause is episode-specific or reusable;
4. what changes should prevent recurrence;
5. how the prevention will be checked next time.

The purpose is continuous improvement without overfitting one novel, one style, or one renderer.

## Scope levels

### EPISODE
Specific to one novel, edition, scene, character, location, or adaptation choice.

Examples:
- Frankenstein's Ingolstadt exterior lacks enough location identity.
- a particular Dracula shot loses spatial clarity.

Episode lessons stay in the episode unless a reusable pattern emerges.

### STYLE
Applies to one visual language.

Examples:
- Living Engraving close-ups expose weak vector facial anatomy.
- heavy line-boil can destroy fine facial information.

### CATEGORY
Applies across styles to one production category.

Examples:
- hands require dedicated close-up references;
- historical apparatus needs functional validation before illustration;
- typography needs a licensing and era check.

### GLOBAL
Applies to any Novel production.

Examples:
- requirements must exist before asset selection;
- first-found asset is not evidence of best fit;
- scene-level averages must not hide failed HERO Items;
- a working render is not final artistic approval.

## Lesson lifecycle

```text
OBSERVED
→ ANALYZED
→ PREVENTION_PROPOSED
→ TESTED
→ PROMOTED
→ ENCODED
→ VERIFIED_IN_LATER_WORK
```

A lesson can also become:
- `REJECTED` — hypothesis was wrong;
- `SUPERSEDED` — a better rule replaced it;
- `EPISODE_ONLY` — intentionally not generalized.

## Required lesson record

Each lesson should capture:

- id;
- title;
- scope;
- source episode/version/Item;
- observed weakness;
- evidence;
- root cause;
- consequence;
- prevention rule;
- detection method;
- implementation changes;
- validation/test;
- confidence;
- status;
- future verification notes;
- superseded_by if replaced.

## Promotion rule

Do not promote every local observation into a global rule.

Promote to CATEGORY/GLOBAL when at least one is true:

1. the failure has appeared in multiple contexts;
2. the mechanism clearly generalizes;
3. the cost of recurrence is high enough to justify a preventative gate;
4. an experiment confirms the rule outside the originating shot.

Otherwise keep it EPISODE or STYLE scoped.

## Prevention hierarchy

Prefer the strongest reasonable mechanism:

```text
automated test / validator
> required structured record
> checklist gate
> explicit current-method rule
> documentation note
```

Not every artistic defect can be automated. Do not create fake numeric certainty for subjective visual judgment.

## Replacement discipline

When a lesson changes:
- update the active prevention rule;
- mark the old lesson SUPERSEDED;
- link the replacement;
- remove obsolete current instructions;
- retain historical reasoning in the lesson/version history.

There must never be two contradictory active rules.

## Learning from successful improvements

Record positive findings too.

If a change materially improves quality:
- state what improved;
- identify why;
- determine whether the mechanism is reusable;
- preserve the successful constraint or primitive.

The system should learn what works, not only what fails.

## Example lesson types from the Frankenstein benchmark

These are methodology lessons, not Frankenstein rules:

- generic asset packs can remain visually generic after normalization;
- close-ups need dedicated design quality rather than enlarged weak rigs;
- expensive per-object SVG texture filters are better moved to global post-processing;
- repeated universal transitions create a templated feeling;
- story/location specificity must beat generic atmosphere;
- source text, historical evidence, art-direction evidence, and asset rights are separate evidence roles;
- one "character" score hides failures in hands, hair, costume, pose, and face;
- source/edition choices should be revisable best-fit decisions, not hardcoded framework rules.

These lessons may evolve as later films challenge them.
