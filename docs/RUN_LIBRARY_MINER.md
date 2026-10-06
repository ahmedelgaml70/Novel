# Run Library Miner v0.2

Library Miner v0.2 includes the first executable Scout slice plus evidence-backed literary-form resolution.

It currently does four things:

1. ingest Project Gutenberg's sanctioned bulk CSV catalog;
2. preserve raw source records and normalized records in SQLite;
3. perform conservative deterministic triage;
4. produce a Markdown report.

It now includes an evidence-backed literary-form resolver. It still does **not** claim rights approval, full-text integrity, or creative ranking.

## Requirements

- Python 3.10+
- Internet access only when downloading the live Gutenberg catalog

No Python packages are required for v0.2.

## Validate the machine first

```bash
make test
```

Then run the included fixture through the complete current slice:

```bash
make scout-sample
```

The sample loads **synthetic test evidence only** to exercise the resolver. It is not production bibliographic research.

Outputs are placed under `data/`, which is ignored by Git.

## Run against the live Gutenberg catalog

```bash
make scout-sync
make scout-report
```

Equivalent commands:

```bash
python3 scripts/scout_library.py sync
python3 scripts/scout_library.py report
```

The default catalog is:

```text
https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv
```

The script uses Project Gutenberg's machine-readable bulk catalog rather than crawling human-facing search pages.

Smoke-test only part of a catalog:

```bash
python3 scripts/scout_library.py sync --limit 1000
```

Use a previously downloaded CSV:

```bash
python3 scripts/scout_library.py sync --catalog /path/to/pg_catalog.csv
```

## Current states

- `REJECT_NON_TEXT` — catalog record is not a text resource.
- `REJECT_OBVIOUS_NON_NOVEL` — high-confidence incompatible metadata with no competing fiction signal.
- `TYPE_REVIEW` — fiction-like metadata exists, but the catalog cannot prove novel form.
- `METADATA_REVIEW` — insufficient deterministic evidence either way.

This conservatism is intentional. Literary form is resolved by the separate evidence-backed resolver; catalog metadata alone remains insufficient for ambiguous fiction.

## Literary-form resolution

After a real catalog sync:

```bash
make scout-materialize
```

This creates explicit `works` and `edition_sources` entities.

Evidence is stored as claims attached to a Work. A production evidence item records:
- provider,
- authority level,
- independence key,
- source locator,
- claim,
- optional supporting text/raw record.

Once evidence collection adapters are added, resolve stored evidence with:

```bash
make scout-resolve
make scout-form-report
```

Current policy requires two independent high-quality sources agreeing on the same literary form and no high-quality conflict.

Possible form states:
- `NOVEL` — eligible on literary form;
- `NOVELLA` — resolved but excluded from this niche;
- `NOT_NOVEL` — resolved incompatible literary form;
- `DISPUTED` — high-quality evidence conflicts;
- `UNKNOWN` — insufficient evidence.

The LLM is not treated as a bibliographic source.

## SQLite ownership

The database is operational state, not source code. It is stored under `data/` and is not committed.

Git stores code, rules/config, tests, fixtures, schemas, decisions, and documentation.

## Next planned slice

Step 1B.3 adds real evidence collection/enrichment adapters, then verifies complete source availability and begins the rights precheck for the **exact edition/source** we would use.
