# Decisions

This file records decisions that have been explicitly agreed. Proposals do not belong here until accepted.

## D-001 — Product niche

**Status:** Accepted

The system's primary source material is a **complete novel**.

Standalone chapters, short stories, essays, articles, news items, and generic prompt-generated stories are outside the core niche.

## D-002 — Target duration

**Status:** Accepted

The target finished video is approximately **3 minutes**.

This target is long enough to support real narrative progression and short enough to require deliberate compression.

## D-003 — Experience, not summary

**Status:** Accepted

The intended viewer experience is:

> For the next three minutes, I entered this novel.

The machine should favor cinematic, experiential storytelling over a narrated plot-summary format.

## D-004 — Immersive POV as a core creative principle

**Status:** Accepted

The dominant language should feel immersive and situated inside the novel.

A literal fixed POV percentage is **not** yet accepted. The exact balance between embodied POV, observer shots, establishing shots, symbolic shots, and external reveals is an experiment.

## D-005 — Quality hierarchy

**Status:** Accepted

1. Viewer experience / overall quality
2. Storytelling and retention
3. Immersion
4. Visual and narrative consistency
5. Source fidelity
6. Rights and originality
7. Reproducibility
8. Automation
9. Cost
10. Speed and scale

## D-006 — Development method

**Status:** Accepted

Each major stage follows:

PROPOSE → CRITIQUE → ALTERNATIVES → TRADE-OFFS → FACT/ASSUMPTION/HYPOTHESIS → EXPERIMENT IF NEEDED → AGREE → IMPLEMENT → TEST → DOCUMENT.

The repository must distinguish accepted decisions from drafts and hypotheses.

## D-007 — Selection is gate first, ranking second

**Status:** Accepted

Novel selection has two fundamentally different layers:

### Stage A — Hard eligibility

Evidence-driven checks. A failure blocks production.

Examples:
- source is not actually a novel,
- no trustworthy complete source,
- rights status is insufficiently clear for the intended use.

### Stage B — Creative opportunity

Only eligible novels are compared for production priority.

Creative factors must not be allowed to compensate numerically for a hard eligibility failure.

## D-008 — Full novel before adaptation

**Status:** Accepted

The production system should ground adaptation in the complete source novel rather than relying only on third-party summaries.

## D-009 — Stateful production and granular recovery

**Status:** Accepted

The conceptual system is not a one-way generator. QC should be able to route a failure back to the smallest responsible stage—for example, one shot, one audio element, or one narrative decision—without unnecessarily rebuilding the entire film.

## Open decisions

The following are intentionally **not yet locked**:

- exact POV ratio,
- narration density,
- average shot length,
- number of shots,
- default visual style,
- degree of photorealism,
- amount of generated motion versus composed motion,
- final Scout source mix,
- creative-opportunity scoring method,
- benchmark novel set,
- exact human-review gates,
- implementation stack.
