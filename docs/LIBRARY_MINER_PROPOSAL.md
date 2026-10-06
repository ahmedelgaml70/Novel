# Library Miner — Step 1B Proposal

**Status: DRAFT / UNDER REVIEW**

This file defines the proposed behavior of the Library Miner arm of Novel Scout. It does not become accepted architecture until the relevant decisions are moved into `docs/DECISIONS.md`.

## Goal

The Library Miner should answer:

> From large, rights-aware or bibliographically useful book corpora, which works are credible **novel** candidates worth deeper review?

It is not responsible for final creative selection. Its job is to cheaply create a clean, evidence-backed pool of eligible or reviewable novel candidates.

## Design principle

Do not crawl human-facing catalog pages when a source explicitly provides machine-readable catalogs.

Prefer:
1. bulk catalog/file,
2. documented feed/API,
3. targeted page fetch only when needed for one shortlisted work.

## Proposed initial sources

### 1. Project Gutenberg — primary bulk source

Use Project Gutenberg's machine-readable catalog as the first large inventory source.

Preferred input:
- `pg_catalog.csv` for fast ingestion and iteration.
- RDF/MARC later only if they provide metadata we actually need.

Project Gutenberg explicitly provides machine-readable XML/RDF/CSV metadata for database/tool use rather than crawling the website.

Important limitations:
- Gutenberg metadata tracks Gutenberg release dates, not necessarily original print publication dates.
- A Gutenberg ebook may differ from its original print source.
- Gutenberg's copyright determinations are U.S.-oriented.
- Bulk text should come from mirrors/bulk archives rather than roboting the main site.

Therefore Gutenberg supplies discovery metadata and a strong source candidate, but not by itself the final original-publication or worldwide-rights determination.

### 2. Standard Ebooks — curated supplementary source

Use Standard Ebooks as a high-quality supplementary corpus, not as the only bulk feed dependency.

Current constraint:
- new-release RSS/Atom feeds are public;
- full OPDS/catalog feeds are access-controlled for Patrons Circle/supporters and some eligible open-source projects.

Therefore v1 should not require authenticated Standard Ebooks feed access.

### 3. Open Library — bibliographic enrichment, not bulk production backend

Open Library is useful for:
- Work/Edition distinction,
- author identity,
- first publication information,
- subject metadata,
- edition/identifier cross-checking.

Current guidance from Open Library:
- low-volume human-centered APIs are supported,
- responses should be cached,
- bulk/high-volume ingestion should use monthly data dumps,
- the API should not be treated as a third-party commercial data backend.

Therefore v1 uses Open Library only for targeted enrichment after cheap filtering.

## Pipeline

```text
BULK CATALOG INGEST
        ↓
RAW SOURCE RECORDS
        ↓
NORMALIZE
        ↓
DEDUPE / IDENTITY RESOLUTION
        ↓
CHEAP NON-NOVEL FILTERS
        ↓
NOVEL CLASSIFICATION
        ↓
COMPLETE-SOURCE AVAILABILITY
        ↓
RIGHTS PRECHECK
        ↓
BIBLIOGRAPHIC ENRICHMENT
        ↓
SOURCE-INTEGRITY CHECK
        ↓
ELIGIBLE / REVIEW / REJECT
        ↓
SCOUT CANDIDATE STORE
```

## Stage B1 — Raw ingestion

Each imported source record is stored before normalization.

Reason:
- parsing rules will change;
- source metadata may later prove useful;
- we need provenance for every normalized field.

Proposed raw record:

```json
{
  "ingest_id": "uuid",
  "source_system": "gutenberg",
  "source_record_id": "1342",
  "source_snapshot": "2026-10-06",
  "source_locator": "...",
  "raw": {},
  "ingested_at": "..."
}
```

## Stage B2 — Normalization

Convert source-specific fields into a common candidate shape.

Minimum normalized fields:

```json
{
  "candidate_id": "uuid",
  "canonical_title": "",
  "title_variants": [],
  "authors": [
    {
      "name": "",
      "authority_ids": {}
    }
  ],
  "languages": [],
  "subjects": [],
  "source_records": [],
  "work_ids": {},
  "first_publication_year": null,
  "work_type": "unknown",
  "status": "discovered"
}
```

Never discard the original raw record when normalizing.

## Stage B3 — Deduplication / identity resolution

The same novel may appear:
- in multiple formats,
- under spelling variants,
- with subtitle differences,
- in several editions,
- in multiple languages,
- in multiple source catalogs.

Deduplication should be evidence-based.

### Strong identity signals
- shared authoritative work ID,
- same author authority ID + normalized title,
- confirmed cross-source edition/work mapping.

### Medium identity signals
- normalized title + normalized author,
- title variant + publication metadata,
- fuzzy title match with strong author agreement.

### Weak signals
- title alone.

Weak signals must never auto-merge candidates.

### Important model distinction

Maintain separate concepts:

```text
WORK
"Pride and Prejudice"

EDITION / SOURCE
specific Gutenberg transcription
specific Standard Ebooks edition
specific print-derived text
specific translation
```

The **candidate** is the work.
The **production source** is a specific edition/text.

This prevents rights and provenance from being accidentally attached to the wrong edition.

## Stage B4 — Cheap non-novel filters

Before using an LLM, eliminate records clearly marked as incompatible categories where metadata is trustworthy.

Potential exclusions:
- poetry,
- drama/play,
- essay,
- speech,
- periodical,
- collection,
- anthology,
- dictionary/reference,
- non-fiction,
- short-story collection.

Do not rely solely on subject tags because historical catalog metadata is inconsistent.

If metadata is ambiguous, keep the candidate rather than falsely rejecting it.

## Stage B5 — Novel classification

The system must establish that a work is actually a novel.

Proposed output:

```json
{
  "work_type": "novel | not_novel | disputed | unknown",
  "confidence": "high | medium | low",
  "evidence": [
    {
      "source": "...",
      "claim": "...",
      "locator": "..."
    }
  ]
}
```

Proposed rule:
- `novel + high confidence` → continue.
- `not_novel + high confidence` → reject.
- `disputed/unknown` → classification review.
- never classify solely from title wording.

## Stage B6 — Complete-source availability

A candidate cannot pass Library Miner without at least one traceable complete text candidate.

Store:
- source provider,
- edition/source description,
- language,
- translator,
- format,
- stable identifier,
- retrieval method,
- checksum once acquired,
- whether front/back matter is included,
- known completeness concerns.

Do not download every full text during the cheapest pass if metadata can first eliminate the candidate.

## Stage B7 — Rights precheck

Library Miner performs a **precheck**, not final legal adjudication.

Its output is:

```text
LIKELY_ELIGIBLE
NEEDS_RIGHTS_REVIEW
INELIGIBLE
UNKNOWN
```

Precheck evidence may include:
- source provider's rights/public-domain statement,
- author death information,
- original publication information,
- edition/translation dates,
- provider-specific license/header.

A candidate may not become production-ready solely from this precheck.

## Stage B8 — Targeted bibliographic enrichment

Only surviving candidates get targeted enrichment.

Potential fields:
- first publication year,
- original language,
- author dates,
- alternate titles,
- work/edition identifiers,
- genre/form classification,
- edition history.

Cache every response with provider, query, timestamp, raw response, and normalized fields.

## Stage B9 — Source-integrity check

Before a text becomes the designated production source, check for:
- obvious truncation,
- missing chapters,
- empty/repeated sections,
- OCR corruption,
- accidental multi-volume partials,
- table-of-contents mismatch,
- suspiciously short word count,
- encoding failure.

This is source QA, not literary analysis.

## Proposed candidate states

```text
DISCOVERED
NORMALIZED
DUPLICATE_LINKED
TYPE_REVIEW
NOT_NOVEL
SOURCE_MISSING
RIGHTS_REVIEW
SOURCE_QA_FAILED
ELIGIBLE
```

## Storage strategy — proposal

### Git should store
- schemas,
- source adapter definitions,
- filtering rules,
- accepted/rejected test fixtures,
- small benchmark candidate records,
- decision logs,
- reproducible test snapshots.

### Git should NOT store
- giant upstream catalogs,
- thousands of complete novel texts,
- large caches,
- raw bulk dumps.

Large external datasets should be reproducibly downloadable from manifests/scripts.

Proposed runtime layout:

```text
data/
  raw/
  normalized/
  cache/
  candidates/
  sources/
```

with large data ignored by Git.

## Incremental refresh

Run modes:

```text
FULL
initial bootstrap / parser migration

INCREMENTAL
new or changed source records

RECHECK
re-run rules against existing normalized candidates
```

Track upstream snapshot/hash, last successful ingest, source IDs, and changed/new records.

## Failure policy

- Source unavailable → retain candidate and evidence; mark unavailable.
- Parser failure → retain raw record and error.
- Conflicting metadata → retain both claims and flag conflict.
- Duplicate uncertainty → possible-duplicate link; do not auto-merge.
- Rights uncertainty → escalate; never infer approval from creative value.

## Deterministic filters before AI

Use deterministic filtering wherever evidence is strong:
- missing title,
- explicit incompatible content type,
- explicit drama/poetry/reference classification,
- known duplicate source record,
- unusable source format when required.

Use language-model judgment only where metadata is ambiguous.

## LLM role

Good uses:
- resolve ambiguous literary form,
- reconcile title variants,
- explain conflicting metadata,
- produce evidence-grounded classification rationale.

Bad uses:
- invent publication dates,
- decide rights from intuition,
- merge records solely on semantic similarity,
- re-evaluate thousands of obvious metadata records expensively.

## Test corpus before scale

Create fixtures with:
1. obvious novel,
2. short-story collection,
3. novella,
4. play,
5. essay collection,
6. multi-volume novel,
7. same novel in two editions,
8. same title by different authors,
9. translated edition,
10. corrupted/truncated text,
11. anthology containing a novel,
12. disputed literary classification.

## Definition of Step 1B complete

Library Miner v1 is complete when it can:
1. ingest a real machine-readable catalog snapshot;
2. normalize records reproducibly;
3. preserve source provenance;
4. resolve obvious duplicates without unsafe merges;
5. reject clear non-novels cheaply;
6. route ambiguous classification to review;
7. identify at least one complete source candidate per survivor;
8. create a rights-precheck state;
9. enrich selected survivors without abusing external APIs;
10. run source-integrity QA;
11. output eligible/review/rejected candidate sets;
12. repeat the run without duplicating state;
13. explain every rejection.

## Critique

### Strengths
- scalable without crawling human-facing sites,
- provenance-first,
- separates work identity from edition/source identity,
- cheap filters precede expensive reasoning,
- preserves ambiguity instead of fabricating certainty,
- incremental and reproducible,
- compatible with Opportunity Hunter discoveries.

### Weaknesses
- metadata alone will misclassify some historical literary forms,
- rights precheck cannot provide global legal certainty,
- cross-source identity resolution can become complex,
- bulk catalog changes may require adapter maintenance,
- initial corpus may still be biased toward canonical English-language literature.

### Deliberate response

These are acceptable because Opportunity Hunter exists specifically to broaden discovery. Library Miner optimizes for **reliable inventory**, not cultural exhaustiveness.

## Decisions requested

To accept Step 1B, lock:
1. Project Gutenberg CSV as the first bulk adapter.
2. Standard Ebooks as supplementary/targeted unless broad feed access is available.
3. Open Library as cached targeted enrichment in v1; bulk dumps only if later needed.
4. Work and Edition/Source as separate entities.
5. Preserve raw upstream records before normalization.
6. Run deterministic filters before LLM reasoning.
7. Route ambiguity to review rather than forced classification.
8. Keep large catalogs/full-text corpora outside Git; Git stores code, schemas, manifests, fixtures, and decisions.
9. Require an adversarial fixture corpus to pass before full-catalog ingestion.
