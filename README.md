# Novel — 3-Minute Novel Experience Machine

Novel is a reusable production system for discovering suitable **novels** and transforming an approved complete novel into an immersive, cinematic video of approximately three minutes.

The repository is the source of truth for:
- product and creative standards,
- pipeline stages and contracts,
- research/source provenance,
- rights decisions,
- experiments and benchmarks,
- implementation,
- run instructions,
- architecture decisions,
- changes to the system.

## Product promise

> For the next three minutes, the viewer should feel that they entered the novel.

This is **not** a generic book-summary generator. The system is designed around cinematic compression, immersive perspective, source fidelity, visual continuity, sound, editing, and deliberate direction.

## Current conceptual machine

```text
CONTINUOUS NOVEL DISCOVERY
        ↓
HARD ELIGIBILITY GATE
        ↓
CREATIVE OPPORTUNITY RANKING
        ↓
APPROVED NOVEL
        ↓
SOURCE + RIGHTS DOSSIER
        ↓
COMPLETE-NOVEL UNDERSTANDING
        ↓
ADAPTATION CONCEPTS
        ↓
POV CONTRACT
        ↓
3-MINUTE STORY MAP
        ↓
AUDIOVISUAL SCREENPLAY
        ↓
FILM / WORLD BIBLE
        ↓
SHOT + SOUND PLAN
        ↓
ANIMATIC
        ↓
PRODUCTION
        ↓
ROUGH CUT
        ↓
FAULT-ROUTING QC
        ↓
MASTER VIDEO
        ↓
PERFORMANCE + LEARNING
```

This is a stateful production system: a failed shot, audio element, or story decision should route back to the smallest responsible stage rather than forcing the entire production to restart.

## Non-negotiable niche

The source is a **novel**. The system does not treat standalone chapters, articles, essays, short stories, news items, or generic text prompts as equivalent inputs.

Target output: **approximately 3 minutes**.

## Development discipline

For every major stage:

```text
PROPOSE
↓
CRITIQUE AGAINST STANDARDS
↓
IDENTIFY ALTERNATIVES
↓
DEBATE TRADE-OFFS
↓
SEPARATE FACT / ASSUMPTION / HYPOTHESIS
↓
DESIGN AN EXPERIMENT WHEN NEEDED
↓
AGREE
↓
IMPLEMENT
↓
TEST
↓
DOCUMENT
```

Unsettled ideas must be marked as proposals or hypotheses rather than silently becoming architecture.

## Quality hierarchy

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

## Current status

**Step 1: Novel Scout + Eligibility Gate**

Implemented foundation:
- two-arm Scout architecture accepted;
- Library Miner v0.1 implemented;
- Project Gutenberg bulk CSV adapter configured;
- raw provenance + normalized records stored in SQLite;
- conservative deterministic triage implemented;
- medium-confidence duplicate/edition grouping implemented without destructive merging;
- explicit Work and Edition/Source entities implemented;
- evidence-backed literary-form resolver implemented;
- two-independent-source rule for automatic form resolution implemented;\n- real cache-first Open Library + Library of Congress evidence collectors implemented;\n- strong entity matching required before external form evidence attaches to a Work;\n- synthetic + real-provider entity-matching benchmarks added; hybrid STRONG/REVIEW/NO_MATCH matcher promoted after the aggressive subtitle matcher failed the real safety gate;
- novellas remain explicitly distinct and outside the niche;
- adversarial fixture and repeatability tests added;
- local runtime data excluded from Git.

Run:

```bash
make test
make scout-sample
make scout-sync
make scout-report
```

The current miner can now resolve literary form when sufficient independent evidence is stored. It intentionally stops before production-grade evidence collection, rights approval, and full-text QA. Those are the next evidence-backed stages.

See:
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/STANDARDS.md](docs/STANDARDS.md)
- [docs/NOVEL_SCOUT_PROPOSAL.md](docs/NOVEL_SCOUT_PROPOSAL.md)
- [docs/LIBRARY_MINER_PROPOSAL.md](docs/LIBRARY_MINER_PROPOSAL.md)
- [docs/RUN_LIBRARY_MINER.md](docs/RUN_LIBRARY_MINER.md)
- [docs/CHANGELOG.md](docs/CHANGELOG.md)

## Production / visual-governance status

The filmmaking research is now split into a **universal Novel production system** plus optional style/renderer modules. **Living Engraving** is the current experimental style module, not a requirement for every novel.

Current production governance:
- every visible/audible/editable element is an atomic Item;
- requirements are locked before final candidate selection;
- sources are logged even when their candidates are rejected;
- HERO/PRIMARY Items require explicit alternatives/comparison;
- generic visible asset packs are not accepted as final art;
- structural reproducibility and final asset approval are separate gates;
- current instructions and historical version learning are stored separately.

First worked audit: `episodes/frankenstein-prototype/` — 62 Items, 62 decision records, 20 research sources, 14 conditional source obligations, six benchmark shots. Frankenstein is a benchmark/example, not the shape of the universal system. Its episode records also separate diegetic time, publication/edition time, and visual-reference time in `temporal_context.json`.

The V5.1 film is a prototype benchmark, **not** final-approved. The V5.2 strict-final gate intentionally remains red until each important Item wins its own evidence/candidate/shot-fit process.

See:
- [docs/production/PRODUCTION_SYSTEM.md](docs/production/PRODUCTION_SYSTEM.md)
- [docs/production/LEARNING_SYSTEM.md](docs/production/LEARNING_SYSTEM.md)
- [docs/production/CURRENT_METHOD.md](docs/production/CURRENT_METHOD.md)
- [docs/production/ITEM_GOVERNANCE.md](docs/production/ITEM_GOVERNANCE.md)
- [docs/production/ITEM_CHECKLISTS.md](docs/production/ITEM_CHECKLISTS.md)
- [docs/production/SOURCE_POLICY.md](docs/production/SOURCE_POLICY.md)
- [docs/production/VERSION_HISTORY.md](docs/production/VERSION_HISTORY.md)
- [episodes/frankenstein-prototype/README.md](episodes/frankenstein-prototype/README.md)
