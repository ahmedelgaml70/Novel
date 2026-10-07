# Changelog

This file records meaningful changes to the Novel machine. Design rationale belongs in `DECISIONS.md`; this file records what changed.

## 2026-10-06

### Product definition
- Narrowed the niche to **complete novels only**.
- Set target output to approximately **3 minutes**.
- Established the product promise: the viewer should feel they entered the novel rather than watched a generic summary.
- Made immersive POV a core creative principle while leaving the exact POV ratio experimental.

### Development process
- Established proposal → critique → alternatives → trade-offs → experiment → agreement → implementation → test → documentation.
- Separated accepted decisions from proposals/hypotheses.

### Novel Scout
- Adopted hard eligibility gates before creative ranking.
- Adopted the two-arm discovery model: **Library Miner + Opportunity Hunter**.
- Defined GitHub as source of truth, runtime database as operational state, and a future orchestrator such as n8n as coordination rather than core logic.
- Deferred n8n until stable commands exist.

### Library Miner v0.1
- Selected Project Gutenberg's sanctioned bulk CSV as the first bulk catalog adapter.
- Added SQLite local persistence.
- Added raw-record provenance storage.
- Added normalized source records.
- Added conservative deterministic triage.
- Added non-destructive medium-confidence identity grouping.
- Added a Gutenberg fixture containing novel, play, poetry, audio, short-story-collection, and duplicate-edition cases.
- Added repeatability and triage tests.
- Added Makefile commands and run documentation.
- Runtime catalogs/databases/reports are excluded from Git.

### Library Miner v0.2 — literary-form resolution
- Added explicit `works` and `edition_sources` entities.
- Added provenance-preserving evidence records.
- Added configurable literary-form claim mapping and evidence thresholds.
- Automatic form resolution now requires two independent high-quality sources with no high-quality conflict.
- Duplicate evidence with the same independence key does not double-count.
- Conflicting high-quality evidence becomes `DISPUTED`.
- `NOVELLA` is kept distinct from `NOVEL` and does not pass the novel-only niche gate.
- Added a synthetic evidence fixture for end-to-end sample execution.
- Added five isolated resolver tests; all five pass.

### Library Miner v0.3 — real bibliographic collectors
- Added cache-first Open Library Search collector.
- Added Library of Congress SRU/MARCXML collector.
- Added explicit entity-match gate requiring exact normalized title plus compatible author in v0.1.
- Added MARC 655 genre/form extraction.
- Added conservative form-term parser that does not promote generic `fiction` into `novel`.
- Provider/ecosystem identity now defines evidence independence; multiple editions from one provider cannot satisfy the two-source rule.
- Added collector cache and run-history tables.
- Added offline fixtures and five collector/parser/entity-match tests.
- Live network collector execution has not been claimed from the development sandbox because outbound DNS is unavailable there.

### Experiment E-001 — entity matching
- Added a 20-case adversarial Work-identity benchmark.
- Added three matcher strategies: current strict, subtitle-tolerant, and identifier-hybrid.
- Corrected the baseline to mirror the production matcher exactly.
- Synthetic results: current strict 5 true-strong / 8 true-miss / 0 false-strong; subtitle-tolerant 10 / 3 / 0; identifier-hybrid 7 true-strong + 3 true-review / 3 true-miss / 0 false-strong.
- No production matcher change was made; real provider-record benchmarking is required first.

### Entity matcher v0.2 promoted
- Added a 13-record real-provider benchmark using preserved Open Library and Library of Congress metadata.
- Introduced relationship ground truth: direct edition, augmented edition, composite containing the Work, derivative adaptation, and secondary work about the Work.
- Real benchmark results:
  - current strict: 6 direct strong, 0 unsafe strong, 7 unsafe discarded;
  - subtitle-tolerant: 6 direct strong, **2 unsafe strong** — failed safety gate;
  - hybrid: 6 direct strong, **0 unsafe strong**, 5 unsafe review, 2 unsafe no-match.
- Promoted the hybrid three-state matcher to production collectors.
- Added `record_matches` persistence for reviewable relationships.
- `REVIEW` records cannot create literary-form evidence.

### Verification
- Existing Library Miner fixture tests: **3/3 passing**.\n- New literary-form resolver tests: **5/5 passing**.
- Sample ingest: **7 records**, producing 4 `TYPE_REVIEW`, 2 `REJECT_OBVIOUS_NON_NOVEL`, and 1 `REJECT_NON_TEXT`.
- Live catalog endpoint availability and current catalog publication were verified independently.
- A live catalog download could not be executed inside the development sandbox because outbound DNS/network access is unavailable there; this is an environment limitation, not recorded as a successful live run.

### Next
- Step 1B.3: production-grade bibliographic evidence collectors.
- Complete-source availability checks.
- Exact edition/source integrity checks.
- Rights precheck and rights evidence records.

## 2026-10-07 — Production / Living Engraving governance

### Visual method learning
- Preserved the progression from JavaScript feasibility test -> full 3-minute feasibility -> layered cinematic prototype -> asset-driven renderer -> V4 Living Engraving -> V5.1 clean bespoke remake.
- Recorded what each version attempted, what failed, and which improvement it unlocked in `docs/production/VERSION_HISTORY.md`.
- V5.2 is a governance/method update, not a falsely claimed new visual render.

### Atomic Item governance
- Added `docs/production/ITEM_GOVERNANCE.md`.
- Added category-specific `ITEM_CHECKLISTS.md`.
- Added mandatory production `SOURCE_POLICY.md`.
- Added one canonical `CURRENT_METHOD.md` with obsolete V5.1 asset-selection instructions removed.
- Defined requirements-before-search, source-before-assumption, candidate comparison, hard asset gates, shot-fit testing and continuity approval.

### Frankenstein worked audit
- Decomposed the 24-second V5.1 benchmark into **62 atomic Items** across global material, exterior, chamber, Victor, creature, apparatus, atmosphere/edit, typography and audio.
- Added **62 per-Item decision records**.
- Added **11 material research sources** with provenance/rights roles.
- Rejected the current generic Ingolstadt skyline for final use; 1800 location-specific Ingolstadt evidence is the preferred research direction.
- Kept the 1831-informed creation tableau as a direction but blocked final approval until child Items pass.
- Marked Victor costume, apparatus and title treatment as provisional where the evidence/decision contract is not yet complete.
- No unresolved Item was silently upgraded to final approval.

### Validation
- Added JSON schemas for Items, sources and decisions.
- Added `scripts/validate_production_records.py`.
- Added structural and anti-false-final tests.
- Structural PASS is explicitly not final approval; strict-final is expected to fail while V5.1 Items remain unresolved.

### Reproducibility
- Added the canonical Living Engraving JavaScript renderer, manifest, method state, validator, render command and pinned `skia-canvas` dependency under `production/living_engraving/`.
- Shot-local audio/light cues remain in the scene manifest rather than a hidden absolute timeline.


## 2026-10-07 — production governance

### Living Engraving production method
- Added canonical current-method documentation and separated it from visual-version history.
- Added atomic Item governance and category-specific Item checklists.
- Added a source policy separating evidence/reference sources from visible asset candidates.
- Added machine-readable Item, source and asset-decision records for the Frankenstein prototype.
- Added the canonical current JavaScript renderer package under `production/living_engraving/`.

### Frankenstein prototype audit
- Decomposed the 24-second V5.1 prototype into 62 independently judgeable Items.
- Recorded 62 Item decision records rather than grandfathering existing renderer art into approval.
- Rejected the current generic Ingolstadt skyline for final use and identified period/location-specific research directions.
- Added historical/art/costume/scientific source records instead of treating asset availability as selection evidence.

### V5.2.1 source-fidelity layer
- Designated Project Gutenberg #42324 (1831 edition) as the prototype literary source and retained #41445 (1818) as comparative evidence.
- Added 13 Chapter V source-fidelity obligations and cross-linked them to affected Items.
- Identified the nearly extinguished candle and hard breathing as underrepresented/missing in the current render.
- Explicitly classified the galvanic apparatus as an interpretive historical reconstruction rather than a canonically specified machine.
- Upgraded validation to check Item↔obligation references and report strict-final blockers by category.
