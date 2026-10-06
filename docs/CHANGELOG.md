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

### Verification
- Local fixture test suite: **3/3 passing**.
- Sample ingest: **7 records**, producing 4 `TYPE_REVIEW`, 2 `REJECT_OBVIOUS_NON_NOVEL`, and 1 `REJECT_NON_TEXT`.
- Live catalog endpoint availability and current catalog publication were verified independently.
- A live catalog download could not be executed inside the development sandbox because outbound DNS/network access is unavailable there; this is an environment limitation, not recorded as a successful live run.

### Next
- Step 1B.2: evidence-backed novel-form resolution.
- Explicit Work vs Edition/Source entities.
- Complete-source availability checks.
- Rights precheck and evidence records.
