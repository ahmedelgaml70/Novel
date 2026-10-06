# Experiment E-001 — Work Entity Matching

**Status:** Synthetic benchmark complete; real-provider benchmark required before production change.

## Question

Can we relax the current exact-title matcher enough to recover legitimate catalog variants without increasing the dangerous failure mode:

> attaching evidence from the wrong Work?

## Safety metric

The primary metric is:

**FALSE_STRONG** — a different/unsafe Work is accepted as a strong identity match.

Any candidate matcher with a non-zero FALSE_STRONG rate fails the safety gate.

Secondary metrics:
- TRUE_STRONG — correct Work accepted automatically;
- TRUE_REVIEW — correct Work routed to review rather than lost;
- TRUE_MISS — correct Work rejected;
- FALSE_REVIEW — incorrect/unsafe candidate sent to review;
- FALSE_NOMATCH — incorrect Work safely rejected.

## Matchers

### A — Current strict production matcher

Exact normalized title + compatible author.

### B — Subtitle-tolerant candidate

Adds improved punctuation/ampersand normalization and allows a conservative title core split at colon/semicolon when author identity is compatible.

### C — Identifier hybrid candidate

Uses an authoritative shared identifier where available; otherwise exact match is strong and less-certain title-core/partial cases go to review.

## Synthetic adversarial corpus

20 cases:
- 13 true/safe same-Work relationships,
- 7 wrong or unsafe direct-attachment relationships.

Cases include:
- exact title,
- missing subtitle,
- punctuation,
- ampersand,
- author reordering,
- author initials,
- transliteration,
- translation-title changes,
- same title/different author,
- same author/different work,
- partial volume,
- collection containing a target title,
- authoritative-ID conflict.

## Results

| Matcher | True strong | True review | True miss | False strong | False review | Correct no-match |
|---|---:|---:|---:|---:|---:|---:|
| A — current strict | 5 | 0 | 8 | **0** | 0 | 7 |
| B — subtitle tolerant | 10 | 0 | 3 | **0** | 0 | 7 |
| C — identifier hybrid | 7 | 3 | 3 | **0** | 3 | 4 |

## Interpretation

The current matcher is safe on this fixture but rejects too many legitimate variants.

Matcher B substantially improves automatic recall on the synthetic corpus without introducing a false strong match.

Matcher C is deliberately more cautious: some uncertain variants are routed to review rather than accepted or discarded.

**No production matcher change is approved from this result alone.**

The benchmark is synthetic and deliberately small. It cannot estimate the real false-positive rate across historical bibliographic records.

## Next experiment

Build a real-provider benchmark from actual Open Library and Library of Congress responses for a mixed set of:
- obvious novels,
- novellas,
- story collections,
- plays,
- same-title/different-author collisions,
- subtitle variants,
- translations,
- multi-volume works.

For each provider record, manually establish ground truth once and preserve the raw response as a fixture.

Then run A/B/C on the exact same records.

## Promotion rule

A replacement production matcher may be considered only if:

1. FALSE_STRONG remains zero on the synthetic corpus;
2. FALSE_STRONG is zero or effectively zero on the real-provider benchmark;
3. it materially lowers TRUE_MISS or review burden;
4. risky partial/collection records are never silently upgraded to strong;
5. results are reproducible from stored provider fixtures.
