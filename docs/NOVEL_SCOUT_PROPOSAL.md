# Novel Scout — Step 1 Proposal

**Status: DRAFT / UNDER REVIEW**

Nothing in this file becomes an accepted architectural decision until it is moved into `DECISIONS.md`.

## Purpose

The Scout answers:

> What novel should the machine produce next?

It continuously discovers possible novels, eliminates ineligible works, enriches the remaining candidates, and creates an evidence-backed production backlog.

The Scout is not allowed to approve a novel merely because an LLM thinks it sounds interesting.

## Proposed flow

```text
DISCOVERY SOURCES
      ↓
NORMALIZE / DEDUPLICATE
      ↓
IS THIS A NOVEL?
      ↓
BIBLIOGRAPHIC IDENTITY
      ↓
RIGHTS + COMPLETE-SOURCE CHECK
      ↓
HARD ELIGIBILITY GATE
      ↓
LIGHTWEIGHT STORY INSPECTION
      ↓
MARKET / SATURATION SIGNALS
      ↓
CREATIVE OPPORTUNITY PROFILE
      ↓
RANKED BACKLOG
      ↓
HUMAN PICK DURING DIRECTOR MODE
```

## Proposed source roles

A source is trusted only for jobs it is suited to.

### A. Rights-aware discovery and complete-text candidates

**Project Gutenberg**
- large machine-readable catalog,
- clear per-ebook license/header,
- useful complete text,
- U.S.-focused copyright determinations.

Important caveat: Project Gutenberg itself warns that its copyright determinations are U.S.-specific and that some ebooks are distributed with permission rather than because the work is unrestricted. Therefore the individual ebook header/license must be inspected.

**Standard Ebooks**
- curated literary collection,
- useful clean editions,
- policy restricted to books considered in the U.S. public domain due to copyright expiration,
- useful high-quality discovery pool.

Important caveat: its public-domain assessment is also U.S.-oriented.

### B. Bibliographic enrichment

**Open Library**
- Work versus Edition model,
- author and edition metadata,
- first-publish information,
- identifiers,
- subject and edition discovery.

Use for enrichment and cross-checking, not as our sole rights authority or high-volume production backend. Open Library explicitly asks high-volume users to use data dumps rather than treating the API as a commercial backend.

### C. Audience-interest proxy

Potential signal:
- Wikimedia per-article pageviews for the novel/author.

This is a weak interest proxy, not proof that a video will perform.

### D. Existing-video saturation / differentiation

Potential signal:
- YouTube search for the exact title plus relevant intents such as summary, explained, story, novel, and adaptation.
- Follow with video metadata/statistics where useful.

This estimates competition and format saturation; it should not automatically penalize famous novels, because strong demand can coexist with strong competition.

## Hard Eligibility Gate — proposed v1

A candidate must pass all of the following.

### H1 — Novel identity
Evidence supports that the work is a novel rather than a short story, novella presented as a novel, essay, play, or collection.

**Open question:** Should novellas be excluded absolutely, or should the niche use an explicit minimum-length/genre rule? This needs agreement.

### H2 — Complete trustworthy source
At least one complete, traceable source edition is available.

### H3 — Rights confidence
The intended use is legally supportable for the target publishing context with sufficiently high confidence.

If rights are ambiguous:
`NEEDS_REVIEW`, not `PASS`.

### H4 — Source integrity
The acquired source is not obviously truncated, OCR-corrupted beyond practical repair, or missing major sections.

### H5 — Language/translation eligibility
If adaptation requires a translation, the exact translation's rights and provenance must independently pass.

## Creative Opportunity Profile — proposed v1

Do **not** collapse everything immediately into one opaque 0–100 score.

Keep a profile with separate dimensions first:

### Story opportunity
- premise strength
- causal clarity
- emotional arc
- climax/payoff
- compressibility to ~3 minutes

### Immersion opportunity
- strong candidate POV
- embodied/experiential scenes
- useful dialogue/inner voice
- environmental sound potential

### Visual opportunity
- distinctive locations
- iconic objects/motifs
- scene variety
- strong reveals
- ability to maintain continuity

### Audience opportunity
- recognition
- curiosity
- current interest proxies
- educational/cultural familiarity

### Differentiation opportunity
- saturation of existing explainers
- sameness of competing formats
- unexplored POV or visual angle

### Production risk
- cast size
- location count
- chronology complexity
- continuity burden
- difficult effects
- expected cost/time

## Ranking proposal

Use a **Pareto/shortlist approach first**, not a single score.

1. Eliminate hard-gate failures.
2. Remove obviously dominated candidates (worse on nearly every important dimension).
3. Produce a shortlist.
4. Use transparent weighted ranking only for the shortlist.
5. In Director Mode, a human approves the next production.
6. Later, learn weights from benchmark and publication evidence.

Reason: an early single number would create false precision before we have evidence about which variables predict a good film.

## Candidate lifecycle

```text
DISCOVERED
→ NEEDS_METADATA
→ RIGHTS_REVIEW
→ INELIGIBLE
or
→ ELIGIBLE
→ CREATIVE_PROFILED
→ SHORTLISTED
→ SELECTED
→ IN_PRODUCTION
→ PRODUCED
→ POSTMORTEM_COMPLETE
```

A rejected candidate is retained with its reason so the Scout does not repeatedly rediscover and re-research the same unsuitable work.

## Proposed candidate record

```json
{
  "work": {
    "title": "",
    "author": "",
    "original_language": "",
    "first_publication_year": null,
    "work_ids": {}
  },
  "classification": {
    "is_novel": null,
    "evidence": []
  },
  "sources": [],
  "rights": {
    "status": "unknown",
    "jurisdictions": [],
    "edition": null,
    "translation": null,
    "evidence": [],
    "review_required": true
  },
  "signals": {
    "interest": {},
    "competition": {}
  },
  "creative_profile": {
    "story": {},
    "immersion": {},
    "visual": {},
    "audience": {},
    "differentiation": {},
    "production_risk": {}
  },
  "status": "discovered",
  "decision_history": []
}
```

## Critique against our standards

### Strengths
- Rights and source quality cannot be hidden by a high creative score.
- Novel discovery becomes continuous and reproducible.
- Evidence is stored instead of only storing model opinions.
- Ranking can evolve as real performance data accumulates.
- Rejected works remain documented.
- Discovery, rights, bibliography, audience interest, and competition use different evidence channels rather than one overloaded source.

### Weaknesses / risks
- "Is a novel" can be bibliographically ambiguous, especially around novellas.
- Public-domain law is jurisdiction-specific; fully automatic legal certainty is unrealistic.
- Current-interest signals can bias selection toward famous works and short-lived trends.
- YouTube competition counts can confuse demand with saturation.
- LLM creative scores can be inconsistent and overconfident.
- Reading every complete novel before ranking would be expensive; ranking without reading risks shallow selection.
- Historical metadata can disagree across catalogs.

## Proposed mitigation

Use progressive cost:

### Cheap pass
metadata + rights + source availability + rough demand/competition signals.

### Medium pass
synopsis/metadata plus sampled source inspection solely for shortlist triage.

### Expensive pass
complete-novel analysis only after the work becomes a serious production candidate.

This preserves quality while avoiding full analysis of hundreds of novels that will never be produced.

## Questions requiring agreement or experiment

1. Are **novellas** excluded even if commonly marketed/catalogued as novels?
2. Which jurisdictions must pass the rights gate for our initial publication plan?
3. Should current popularity be a meaningful ranking factor or merely a tie-breaker?
4. How much should existing YouTube competition reduce priority?
5. How many novels should remain in the active shortlist at one time?
6. What minimum evidence is required before `rights.status = approved`?
7. How much of the novel should Scout inspect before promotion to the expensive full-analysis stage?
