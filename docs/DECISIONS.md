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

## D-010 — Two-arm Novel Scout

**Status:** Accepted

Novel discovery uses two complementary arms:

### Library Miner

Systematically mines rights-aware and bibliographic book corpora to build dependable production inventory.

Its job is breadth, repeatability, source traceability, and efficient elimination of ineligible works.

### Opportunity Hunter

Searches beyond the safe library corpus for culturally interesting, underused, newly relevant, or unusually cinematic novels.

Its job is exploration and differentiation.

Both arms converge into the same normalization, identity-resolution, hard-eligibility, and candidate-state system.

The Opportunity Hunter may discover a promising work, but it cannot bypass source or rights gates.

This dual design avoids two opposite failure modes:
- a library-only system repeatedly rediscovering the same canonical classics;
- an opportunity-only system wasting effort on exciting works that cannot legally or practically enter production.

## D-011 — GitHub, runtime database, and orchestration have separate responsibilities

**Status:** Accepted

- **GitHub repository:** source of truth for code, schemas, prompts, tests, documentation, migrations, standards, and decision history.
- **Runtime database:** operational state—discovered candidates, evidence, statuses, run history, and other mutable production knowledge.
- **Orchestrator:** schedules stable capabilities, coordinates external services, retries operations, and manages human approval gates.

The orchestrator must not become the authoritative home of core Novel algorithms.

n8n is a candidate orchestrator, but it is intentionally deferred until the underlying commands are stable.

## D-012 — Library Miner v1 source strategy

**Status:** Accepted

1. Project Gutenberg CSV is the first bulk catalog adapter.
2. Standard Ebooks is supplementary/targeted unless broad machine-readable access is available.
3. Open Library is cached, targeted enrichment in v1; bulk dumps may be added later if justified.
4. Work identity is separate from Edition/Source identity.
5. Raw upstream records are preserved before normalization.
6. Deterministic rules run before LLM judgment.
7. Ambiguity routes to review rather than forced classification.
8. Large catalogs and full-text corpora stay out of Git; Git stores code, schemas, manifests, fixtures, and decisions.
9. An adversarial fixture corpus must pass before full-catalog ingestion.

## D-013 — Library Miner v1 local persistence

**Status:** Accepted for v1 implementation

Library Miner v1 uses **SQLite** for local operational state.

Reasons:
- no database server required,
- transaction-safe,
- queryable and inspectable,
- suitable for the initial single-machine workload,
- included with Python's standard library,
- migration to a hosted database remains possible if concurrency or deployment later requires it.

The SQLite database itself is runtime data and is not committed to Git.

## D-014 — Evidence-backed literary-form resolution

**Status:** Accepted

The system explicitly separates **Work** identity from **Edition/Source** identity.

Literary form is resolved from stored evidence claims rather than from an LLM's unsupported opinion.

Current automatic-resolution policy:

- final states are `NOVEL`, `NOVELLA`, `NOT_NOVEL`, `DISPUTED`, or `UNKNOWN`;
- **novellas are outside the niche** and therefore do not pass the novel eligibility gate;
- catalog fiction signals may route a work into form review but do not by themselves prove that it is a novel;
- automatic form resolution requires at least **two independent high-quality evidence sources** that map to the same form;
- accepted high-quality authority levels in v1 are `authoritative`, `bibliographic`, and `scholarly`;
- repeated claims using the same independence key count once;
- conflicting high-quality form evidence produces `DISPUTED`;
- one high-quality supporting source is insufficient for automatic finalization and remains `UNKNOWN`;
- LLMs may later interpret or reconcile evidence, but the LLM itself is not the evidence source.

This threshold is a conservative operational policy, not a universal bibliographic law. It may be revised if testing shows systematic false positives or false negatives.

## D-015 — Bibliographic evidence collectors

**Status:** Accepted

Literary-form evidence collection uses multiple independent bibliographic ecosystems and a separate entity-match gate.

Accepted v1 policy:

1. **Library of Congress SRU/MARC** is the first authoritative form-evidence adapter.
2. **Open Library** is a targeted, cached bibliographic adapter; its evidence counts only when the matched record contains an explicit usable literary-form signal.
3. **Wikidata** may later provide supporting identity/form evidence but does not count toward the two-high-quality-source threshold in v1.
4. **Project Gutenberg** remains discovery/catalog evidence; generic fiction metadata does not prove novel form.
5. A provider record must pass a strong entity match before its form claim may attach to a Work.
6. Weak matches cannot contribute evidence. Probable matches must be reviewed or corroborated.
7. External requests are cache-first, auditable, rate-limited, and use documented machine interfaces rather than HTML crawling.
8. Independence is counted at the **provider/ecosystem level**. Multiple records or editions from the same provider cannot satisfy the two-source rule by themselves.
9. The initial optimization target is near-zero false-positive `NOVEL` classification, even if this leaves more true novels unresolved.

The first collectors implemented are Open Library Search and Library of Congress SRU/MARC.

## D-016 — Hybrid entity matching with explicit review state

**Status:** Accepted

Production bibliographic collectors use a three-state Work-record matcher:

- `STRONG` — safe enough to attach explicit bibliographic evidence automatically;
- `REVIEW` — plausible relationship retained for inspection but **cannot** contribute evidence automatically;
- `NO_MATCH` — ignored for this Work.

Accepted v0.2 policy:

1. `STRONG` requires an exact normalized title plus compatible author identity.
2. Normalization handles Unicode diacritics, punctuation, and `&` versus `and`.
3. Subtitle/core-title overlap, composite-looking titles, annotated/critical editions, and derivative-looking records route to `REVIEW`, not `STRONG`.
4. Author mismatch prevents automatic attachment.
5. `REVIEW` matches are persisted in the runtime database so they are not lost.
6. Only `STRONG` records may create literary-form evidence.
7. Production matching must continue to be benchmarked against both synthetic adversarial cases and preserved real-provider metadata.

Evidence for this decision:
- synthetic benchmark: hybrid produced zero false-strong matches while reducing missed legitimate variants versus the original strict matcher;
- real-provider benchmark: 6/6 direct editions were strong, 0 unsafe records were strong, 5 risky relationships were routed to review, and 2 were correctly ignored;
- the more aggressive subtitle-tolerant alternative produced 2 unsafe strong matches on real provider metadata and therefore failed the safety gate.

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

## D-017 — Atomic Item production governance

**Status:** Accepted

Every independently judgeable production element—visible, audible, camera, lighting, effect, transition, or typography—is represented as an atomic **Item** with its own purpose, requirements, sources, candidate/selection record, continuity obligations and QC state.

A scene-level or character-level score cannot substitute for sub-Item validation.

## D-018 — Requirements before candidate selection

**Status:** Accepted

For final production, Item requirements are defined before final candidate selection. Candidate search must compare solutions against the same pre-declared requirements.

The machine must not find an asset first and then redefine the need to justify using it.

For HERO/PRIMARY visible Items, first-found acceptance is prohibited. Candidate search stops only after meaningful comparison or an explicit `BLOCKED_NO_SUITABLE_ASSET` decision.

## D-019 — Production source registry

**Status:** Accepted

Every material source discovered during art, historical, technical, anatomical, typography, location, rights or technique research is stored in the episode source registry, including sources attached to rejected candidates.

Source authority, factual/reference role, and visible-asset reuse rights are separate fields. A good factual source is not automatically a reusable asset.

## D-020 — Current method versus improvement history

**Status:** Accepted

Current operating instructions and historical learning are separate.

- `docs/production/CURRENT_METHOD.md` contains only the active method.
- `docs/production/VERSION_HISTORY.md` records what each iteration tried, what failed, what was learned, and what changed next.
- episode `VERSION_LOG.md` records episode-specific defects/improvements.

When a method is replaced, obsolete current instructions are removed rather than left beside the replacement.

## D-021 — Prototype assets are not grandfathered

**Status:** Accepted

Assets/Items created before the current governance method do not automatically become approved because they already render.

The Frankenstein V5.1 benchmark is explicitly subject to V5.2 atomic revalidation. Structural reproducibility and final asset approval are separate gates.

## D-022 — Source contracts are best-fit and revisable

**Status:** Accepted

Source/edition/translation selection is an episode-level decision, not a universal framework rule.

The system compares candidate sources against completeness, adaptation goal, edition significance, wording consequences, translation quality, rights/provenance and creative value.

During development the contract may remain OPEN/PROVISIONAL and may be replaced when a materially better source appears. A final master requires an explicit source contract for reproducibility, but the framework never preselects a specific edition.

Changing the source contract invalidates dependent source obligations and requires targeted revalidation.

## D-023 — Universal production system is separate from style modules and episodes

**Status:** Accepted

The architecture has three layers:

1. universal production governance;
2. optional style/renderer module;
3. episode/novel-specific project data.

Living Engraving is one style module. Frankenstein is one worked benchmark. Neither defines the universal system.

## D-024 — Formal production learning loop

**Status:** Accepted

Material failures and successful improvements are captured as structured lessons with scope, evidence, root cause, prevention rule, detection method and implementation/validation state.

Lesson scopes are EPISODE, STYLE, CATEGORY and GLOBAL.

A lesson is not considered complete merely because it is documented in a version log. Where appropriate, it must change a validator/test, structured record, checklist, method rule, benchmark or other prevention mechanism.

Episode-specific facts are not promoted to global rules without a generalizable mechanism or supporting evidence.

## D-025 — Ready-free-first before custom asset construction

**Status:** Accepted

The production system searches ready free rights-cleared assets before custom modeling, rigging, animation or environment construction.

The preferred order is: compatible ready ecosystem -> adaptable ready asset -> free fallback/retarget -> modify/combine ready assets -> custom authoring only when the ready search fails.

Ready does not mean approved. Every asset still has to satisfy the Item requirements and actual shot.

For the first real-animation proof, Quaternius is the primary humanoid ecosystem because its Universal Base Characters, Universal Animation Library, Universal Animation Library 2 and modular outfit packs are designed to work together and are CC0. KayKit is the current fallback.

This choice is revisable if another free ecosystem proves simpler or better.

## D-026 — Abandon flattened-raster motion and follow the current ready-asset baseline

**Status:** Accepted user direction, 2026-10-07

The user rejected the generated-image/warp approach and instructed use of ready
assets with Hyperframe and JavaScript. The latest repository documents a passed
V5.4.1 ready-rigged Three.js architecture proof. Preserve that foundation; do not
repeat it. Hyperframe's integration role is not yet verified or implemented.
The next task is a story-specific beat with ready characters/outfits, set and
props, retaining existing source, anatomy, contact and shot-quality gates.
