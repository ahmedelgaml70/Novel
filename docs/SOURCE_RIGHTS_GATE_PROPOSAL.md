# Exact Source + Rights Gate — Step 1B.4 Proposal

**Status: DRAFT / UNDER REVIEW**

This stage answers a narrower question than creative selection:

> Do we have a complete, traceable source text for this exact novel, and does the available evidence satisfy our configured rights policy strongly enough to proceed?

This is a provenance and risk-control system. It is **not legal advice** and must not claim universal/global public-domain status.

## Why Work-level age is not enough

The machine must distinguish:

```text
UNDERLYING WORK
        ↓
EDITION / SOURCE TEXT
        ↓
TRANSLATION
        ↓
ANNOTATIONS / INTRODUCTION / NOTES
        ↓
ILLUSTRATIONS / COVER / SCANS
        ↓
PROVIDER TERMS / TRADEMARK
```

Each layer may have different rights.

A public-domain underlying novel does not automatically make:
- a modern translation,
- annotated edition,
- introduction,
- cover illustration,
- audiobook,
- or film adaptation

safe to reuse.

## Proposed hard rule for early production

For automatic progression in the first version, prefer:

1. a Work already resolved as `NOVEL`;
2. an exact `DIRECT_EDITION` / direct-text source;
3. original-language text only;
4. no translator;
5. no modern introduction/annotation incorporated into the adaptation source;
6. no illustrations, cover art, audiobook, or scan imagery used as production assets;
7. explicit item-level provider status or license evidence;
8. a configured jurisdiction policy whose evidence requirements are satisfied;
9. complete-source QA passes.

Anything outside this narrow path becomes `RIGHTS_REVIEW`, not an automatic pass.

## Rights state vocabulary

Do not use a misleading universal state such as `PUBLIC_DOMAIN=true`.

Use:

```text
RIGHTS_POLICY_PASS
RIGHTS_REVIEW
RIGHTS_REJECT
UNKNOWN
```

A PASS means:

> The evidence satisfies the currently configured operational policy for the stated jurisdictions and intended use.

It does **not** mean universally copyright-free everywhere.

## Rights dossier

Each source candidate gets:

```json
{
  "work_id": "...",
  "edition_id": "...",
  "source_provider": "gutenberg",
  "source_record_id": "...",
  "source_language": "en",
  "original_language": "en",
  "translator": null,
  "relationship": "DIRECT_EDITION",
  "intended_use": "cinematic_adaptation",
  "jurisdiction_profile": [],
  "underlying_work": {
    "status": "UNKNOWN",
    "evidence": []
  },
  "edition_text": {
    "status": "UNKNOWN",
    "evidence": []
  },
  "translation": {
    "status": "NOT_APPLICABLE",
    "evidence": []
  },
  "supplemental_content": {
    "used": false,
    "items": []
  },
  "provider_terms": {
    "status": "UNKNOWN",
    "evidence": []
  },
  "decision": "RIGHTS_REVIEW",
  "decision_reason": "",
  "reviewed_at": null
}
```

## Provider-specific evidence

### Project Gutenberg

Treat the **individual ebook header/license** as required evidence.

Project Gutenberg explicitly states:
- most ebooks are unrestricted by U.S. copyright, but some are distributed with copyright-holder permission;
- the catalog can be wrong;
- the license/header inside the ebook controls its status;
- non-U.S. users must independently check local law;
- translations and editions can have independent copyright;
- Project Gutenberg trademark/license terms are separate from the underlying text.

Policy:

```text
Gutenberg catalog status only
        → insufficient

individual ebook header explicitly unrestricted in U.S.
        → usable U.S. evidence

ebook posted with permission / additional terms
        → RIGHTS_REVIEW

outside-U.S. publication
        → jurisdiction-specific evidence still required
```

Store the complete original header/license text or an auditable extracted record and its hash.

### Standard Ebooks

Standard Ebooks states that content it produces is dedicated to the public domain via CC0, while third-party content displayed on its site may still be copyrighted.

Policy:
- record the exact ebook;
- preserve Standard Ebooks' CC0/provenance statement;
- still evaluate the underlying literary Work and the target jurisdiction independently;
- do not assume third-party artwork displayed on the site is automatically reusable outside its documented status.

### Library of Congress

Rights statements are item-specific.

Examples show materially different language:
- some digitized books explicitly state that the books in the collection are public domain and free to use/reuse;
- other rare-book records say the Library is not aware of restrictions but place the final determination on the user.

Policy:

```text
explicit "public domain / free to use and reuse"
        → strong provider evidence

"not aware of restrictions" / user must determine
        → RIGHTS_REVIEW
```

Do not collapse both statements into the same status.

## Jurisdiction profiles

Copyright is territorial.

The machine should therefore run rights rules against an explicit profile rather than a global boolean.

Concept:

```json
{
  "profile_id": "initial-publication",
  "producer_jurisdictions": [],
  "distribution_scope": "global_platform",
  "required_rules": []
}
```

The exact jurisdiction profile must be an explicit project setting.

No source should be labelled globally public domain merely because it passes a U.S. rule.

## U.S. evidence

Current Project Gutenberg guidance states that in 2026 qualifying works first published in 1930 or earlier are unrestricted by U.S. copyright under its 95-year rule.

The U.S. Copyright Office also emphasizes that duration depends on publication date and other factors, and that pre-1978 works require the historical duration rules.

Operational policy:
- prefer explicit provider/item evidence where possible;
- retain original publication evidence;
- do not infer a modern edition's status solely from the original Work's publication year.

## Egypt / life-plus-50 example

WIPO Lex's English text of Egypt's Law No. 82 of 2002 states in Article 160 that an author's economic rights are protected for the author's lifetime plus 50 years after death.

WIPO's current Egypt profile shows the consolidated law amended through 2020.

Operational consequence:
- an author-death-date rule can be part of a configured jurisdiction evaluator;
- the machine stores the legal source/version used;
- the calculation is evidence for the policy decision, not a claim of universal legal clearance.

## Translation rule

Translation is a separate rights object.

Early automatic policy:

```text
original-language source
        → may proceed if other rights gates pass

translation
        → RIGHTS_REVIEW
```

Later, translations may auto-pass only when the exact translator/translation rights are independently established.

This deliberately sacrifices catalog breadth for safety in v1.

## Source completeness gate

Rights-clear but incomplete text still fails.

For the exact chosen source, store:

- retrieval timestamp;
- stable source identifier;
- provider;
- format;
- byte hash;
- normalized-text hash;
- title;
- author;
- language;
- translator if any;
- source relationship;
- chapter/section structure;
- word count;
- opening fingerprint;
- ending fingerprint;
- provider rights/header evidence.

### Automated integrity checks

Flag:
- zero/very short text;
- missing beginning/end markers where expected;
- duplicated large blocks;
- broken encoding;
- extremely high OCR-noise rate;
- missing volumes/parts;
- table-of-contents mismatch;
- source labelled excerpt/abridged/selections;
- composite volume when a clean direct edition is expected.

### Cross-source completeness

For important production sources, compare against at least one independent edition when practical:

- chapter/section count;
- rough word-count ratio;
- beginning/end;
- obvious missing major sections.

Large differences route to `SOURCE_REVIEW`.

The comparison is about completeness, not forcing editions to be textually identical.

## Clean text versus raw source

Never overwrite the acquired source.

Store:

```text
raw_source
        ↓
immutable + hashed

clean_text
        ↓
machine-readable extraction

cleaning_manifest
        ↓
exact transformations performed
```

Possible cleaning:
- remove provider license/header from adaptation text;
- remove navigation boilerplate;
- normalize line endings;
- preserve chapter boundaries.

Do not silently modernize or paraphrase the source during cleaning.

## Source ranking

If multiple rights-eligible direct sources exist, rank them by:

1. completeness confidence;
2. textual cleanliness;
3. provenance quality;
4. original-language status;
5. absence of supplemental copyrighted material;
6. structural quality/chapter boundaries;
7. ease of machine parsing.

Do **not** pick a source merely because it is the prettiest edition.

## Source lifecycle

```text
SOURCE_CANDIDATE
      ↓
RELATIONSHIP_CHECK
      ↓
SOURCE_ACQUIRED
      ↓
SOURCE_HASHED
      ↓
INTEGRITY_CHECK
      ↓
RIGHTS_EVIDENCE_COLLECTED
      ↓
JURISDICTION_POLICY
      ↓
┌──────────────────┬─────────────────┬─────────────┐
│ RIGHTS_POLICY_PASS│ RIGHTS_REVIEW   │RIGHTS_REJECT│
└──────────────────┴─────────────────┴─────────────┘
      ↓
DESIGNATED_PRODUCTION_SOURCE
```

Only a designated production source may enter complete-novel analysis.

## Human gate during Director Mode

Even when the automated policy passes, the first production versions should expose a concise rights/source dossier for human confirmation before public release.

The goal is not to ask the human to redo the research.

The review should answer:

- Is this the exact Work?
- Is this the exact source text we will use?
- Is it complete?
- Are we using any translation or supplemental material?
- What provider statement supports the source?
- Which jurisdictions were evaluated?
- What remains uncertain?

## Failure routing

```text
translation unclear
    → find original-language source or rights review

modern annotated edition
    → find clean direct edition

weak LoC rights statement
    → find stronger source or rights review

Gutenberg item posted with permission
    → reject automatic path / rights review

incomplete source
    → search another edition

composite source
    → isolate verified direct source; otherwise review

jurisdiction rule unresolved
    → human/legal review
```

## Critique

### Strengths
- prevents Work-level public-domain status from leaking onto a modern edition;
- makes translation risk explicit;
- source provenance becomes reproducible;
- exact provider statements are preserved;
- avoids global-public-domain overclaiming;
- keeps legal ambiguity out of creative scoring;
- allows source replacement without changing Work identity.

### Weaknesses
- conservative v1 will reject/review many usable translated novels;
- copyright evaluation cannot be made universally automatic;
- legal rules change and need versioned jurisdiction evaluators;
- provider rights statements are not equivalent to legal opinions;
- cross-source completeness comparisons can be noisy between legitimate editions.

### Accepted cost if approved

We prefer:
- more `RIGHTS_REVIEW`,
- fewer automatic candidates,
- original-language English classics initially,

over silently building films from a questionable source.

## Proposed Step 1B.4 implementation slices

### 1B.4a — Source acquisition + immutable manifest
- retrieve exact source;
- hash raw bytes;
- store metadata;
- preserve provider header/license;
- never overwrite original.

### 1B.4b — Source integrity QA
- structural checks;
- completeness heuristics;
- cross-source comparison hooks.

### 1B.4c — Rights evidence
- Gutenberg header parser;
- LoC rights-statement parser;
- Standard Ebooks provenance/CC0 parser;
- translation flagging.

### 1B.4d — Jurisdiction evaluator
- versioned rules;
- explicit policy profile;
- PASS / REVIEW / REJECT;
- no global boolean.

## Decisions requested

1. Rights attach to the exact **Work + Edition/Source + translation**, not just the Work.
2. No universal `public_domain=true` field.
3. v1 automatically handles original-language sources only; translations route to review.
4. Provider item-level evidence is required; catalog metadata alone cannot pass rights.
5. Ambiguous LoC-style rights statements route to review.
6. Raw source is immutable and hashed; cleaning produces a separate derived text plus manifest.
7. Completeness is a hard gate independent of rights.
8. Large source corpora remain runtime data, not Git content.
9. Public release retains a human rights/source confirmation gate during Director Mode.
10. Jurisdiction rules are explicit, versioned, and configurable rather than assumed global.
