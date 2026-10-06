# Run Library Miner v0.1

Library Miner v0.1 is the first executable slice of Novel Scout.

It currently does four things:

1. ingest Project Gutenberg's sanctioned bulk CSV catalog;
2. preserve raw source records and normalized records in SQLite;
3. perform conservative deterministic triage;
4. produce a Markdown report.

It deliberately does **not** yet claim final novel identity, rights approval, full-text integrity, or creative ranking.

## Requirements

- Python 3.10+
- Internet access only when downloading the live Gutenberg catalog

No Python packages are required for v0.1.

## Validate the machine first

```bash
make test
```

Then run the included fixture through the complete current slice:

```bash
make scout-sample
```

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

This conservatism is intentional. The next slice resolves literary form using independent evidence rather than making the catalog do a job it cannot reliably do.

## SQLite ownership

The database is operational state, not source code. It is stored under `data/` and is not committed.

Git stores code, rules/config, tests, fixtures, schemas, decisions, and documentation.

## Next planned slice

Step 1B.2 adds evidence-backed **novel-form resolution** and explicit Work-vs-Edition records, then source availability and rights precheck.
