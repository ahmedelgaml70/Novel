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

Agreed:
- candidate selection has two stages;
- Stage A is a hard, evidence-driven eligibility gate;
- Stage B is a comparative creative-opportunity evaluation;
- hard failures such as unsuitable source type, insufficient source, or unresolved rights do not get averaged away by a score.

The detailed Scout design is still under review.

See:
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/STANDARDS.md](docs/STANDARDS.md)
- [docs/NOVEL_SCOUT_PROPOSAL.md](docs/NOVEL_SCOUT_PROPOSAL.md)
