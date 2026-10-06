# Bibliographic Evidence Collectors — Step 1B.3 Proposal

**Status: ACCEPTED; v0.1 IMPLEMENTED**

This stage supplies real evidence to the literary-form resolver implemented in Step 1B.2.

It does **not** yet decide copyright/rights. Its question is narrower:

> Can we establish, from independent external evidence, whether this Work is a novel?

## Design goal

Evidence collection must be:
- source-grounded,
- reproducible,
- cached,
- conservative about entity matching,
- independent from the LLM that may later interpret conflicts,
- cheap enough to run only on candidates that survived initial catalog triage.

The collector must never turn a weak search match into strong evidence merely because the title looks similar.

## Proposed evidence ladder

### Tier A — high-quality evidence eligible for automatic resolution

#### Library of Congress catalog via SRU

Role:
- authoritative/bibliographic lookup,
- work/edition identity cross-check,
- explicit genre/form extraction where present.

Why SRU:
- the ordinary loc.gov Books/Printed Material JSON endpoint does not represent all Library catalog data;
- the Library of Congress documents SRU/Z39.50 access to its catalog;
- MARCXML is available through the SRU gateway;
- MARC 655 is specifically the genre/form field.

Evidence policy:
- only explicit, relevant genre/form terms count toward literary-form resolution;
- generic subject terms such as `Fiction` do not prove `NOVEL`;
- a record must first pass identity matching.

Authority level:
`authoritative`

#### Open Library targeted Work/Edition enrichment

Role:
- title/author/work identity,
- edition history,
- first-publication metadata,
- subjects/explicit form signals where present,
- second independent catalog ecosystem.

Operational constraint:
- use only targeted/batched, cached requests;
- do not use the public API as a bulk backend;
- if future scale requires bulk enrichment, switch to Open Library's published data dumps.

Evidence policy:
- exact explicit form evidence may count;
- generic `fiction` alone does not prove novel form;
- descriptions inferred by an LLM do not become bibliographic facts unless the underlying source explicitly supports the classification.

Authority level:
`bibliographic`

### Tier B — supporting evidence, not sufficient for auto-finalization by default

#### Wikidata

Role:
- entity resolution,
- alternate titles,
- identifiers,
- structured `instance of` / subclass relationships,
- discovery of linked references.

Because Wikidata is collaboratively edited, v1 stores it as supporting structured evidence rather than one of the two high-quality sources required for automatic resolution.

Authority level:
`knowledge_graph`

#### Project Gutenberg metadata

Role:
- initial discovery,
- title/author/language/subject hints,
- complete-text candidate.

It remains catalog evidence. `Fiction` or bookshelf membership is not enough to finalize literary form.

Authority level:
`catalog`

## Entity matching gate

Before evidence from an external record can attach to a Work, the match itself must be evaluated.

### Strong match
At least one:
- shared authoritative identifier,
- ISBN/LCCN/OLID cross-link confirmed,
- exact normalized title + author plus compatible publication context.

### Probable match
- strong title similarity + author identity + compatible date/language.

### Weak match
- title only,
- author only,
- fuzzy title without corroboration.

Policy:
- strong matches may attach evidence automatically;
- probable matches attach as `MATCH_REVIEW` until corroborated;
- weak matches are not used as form evidence.

## Evidence object

Every collector should emit the same contract:

```json
{
  "work_id": "...",
  "claim_key": "literary_form",
  "claim_value": "novel",
  "provider": "library_of_congress",
  "authority_level": "authoritative",
  "independence_key": "loc:lccn:...",
  "source_locator": "...",
  "claim_text": "Novels",
  "match": {
    "status": "strong",
    "basis": ["title", "author", "lccn"]
  },
  "raw": {}
}
```

The raw response or an auditable subset must be cached so future code changes can re-interpret evidence without repeating network requests.

## Collector order

For each `TYPE_REVIEW` or unresolved Work:

```text
1. Open Library batch/targeted lookup
       ↓
2. Library of Congress SRU lookup
       ↓
3. If still unresolved, Wikidata supporting lookup
       ↓
4. Resolver
       ↓
NOVEL / NOVELLA / NOT_NOVEL / DISPUTED / UNKNOWN
```

This is an ordering for cost and convenience, not authority. The resolver still applies the evidence policy independently.

## Cache-first behavior

Every external request should be keyed by:
- provider,
- normalized query or identifier,
- collector version.

Store:
- request,
- timestamp,
- response status,
- raw response hash,
- raw response/cache path,
- parsed evidence,
- parser version.

A repeated run should use the cache unless:
- `--refresh` is requested,
- cache is missing,
- parser needs a new raw field that was not retained.

## Rate limiting / source respect

- identify the application where a provider asks for a User-Agent/contact;
- obey provider rate limits;
- batch where supported;
- cache aggressively;
- do not crawl HTML when a documented API/protocol exists;
- do not distribute traffic to evade limits.

## LLM role

The LLM may:
- interpret ambiguous prose from an already matched authoritative record,
- summarize conflicts,
- propose likely entity matches for review.

The LLM may not:
- manufacture bibliographic claims,
- upgrade a weak match into a strong match without evidence,
- classify a work solely from general knowledge,
- convert `fiction` into `novel` without an explicit form basis.

## Failure states

- `NO_MATCH` — provider returned no credible record.
- `MATCH_REVIEW` — likely entity match but insufficient confidence.
- `NO_FORM_EVIDENCE` — correct record found but no explicit usable form term.
- `PROVIDER_ERROR` — request/parse failure.
- `EVIDENCE_CONFLICT` — resolver receives incompatible high-quality claims.

These are not equivalent and must remain distinguishable.

## Critique

### Strengths
- two genuinely different bibliographic ecosystems can support automatic resolution;
- source matching is treated as its own risk rather than hidden inside classification;
- LoC genre/form metadata is semantically closer to the exact question than generic fiction tags;
- supporting sources can improve review without weakening the high-quality threshold;
- cache-first design preserves reproducibility and respects public APIs.

### Weaknesses
- many old records may lack explicit genre/form terms;
- Open Library metadata quality varies;
- LoC records are edition-level and matching editions to our Work can be difficult;
- two-source policy may leave many genuine novels as `UNKNOWN`;
- SRU/MARC parsing is more complex than a modern JSON API.

### Why the conservatism is acceptable

False negatives cost us extra review.

False positives contaminate the niche and can allow short-story collections or novellas into a system explicitly branded around novels.

At this stage, false negatives are cheaper.

## Experiment before scaling

Use a benchmark set of at least:
- 10 obvious novels,
- 5 novellas,
- 5 short-story collections,
- 3 plays,
- 3 poetry/essay collections,
- 5 deliberately difficult/disputed works.

Measure:
- automatic resolution rate,
- correct resolution rate,
- unresolved rate,
- false-positive novel rate,
- entity-match errors,
- requests per resolved Work.

The primary safety metric is:

> **false-positive NOVEL rate**

It should be near zero before automatic filtering is trusted.

## Decisions requested

1. Library of Congress SRU/MARC becomes the first authoritative form-evidence adapter.
2. Open Library remains a targeted, cached bibliographic adapter and can count only when its evidence is explicit.
3. Wikidata is supporting evidence in v1 and does not count toward the two-source high-quality threshold.
4. Project Gutenberg metadata remains discovery/catalog evidence, not final form evidence.
5. External entity matching is a separate gate; weak matches cannot contribute evidence.
6. All external evidence requests are cache-first and auditable.
7. We optimize first for near-zero false-positive `NOVEL` classification rather than maximum automatic coverage.

## Implementation status

Implemented in `scripts/evidence_collectors.py`:
- cache-first Open Library Search adapter;
- Library of Congress SRU/MARCXML adapter;
- strong entity-match gate;
- explicit genre/form parsing;
- provider-level independence;
- collector run history and cached raw responses;
- offline parser/matcher fixtures and tests.

Current v0.1 hypothesis: exact normalized title + compatible author is intentionally conservative. Benchmarking must measure how many valid records it misses before matching is relaxed.
