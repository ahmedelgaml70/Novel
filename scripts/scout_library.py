#!/usr/bin/env python3
"""Novel Library Miner v0.1.

Ingests Project Gutenberg's sanctioned bulk catalog CSV, preserves raw provenance,
normalizes records, performs conservative deterministic triage, stores state in
SQLite, and emits a report. It intentionally does NOT make final novel-identity
or rights decisions from catalog metadata alone.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sqlite3
import sys
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "config" / "library_miner.json"
DEFAULT_DB = ROOT / "data" / "novel_scout.sqlite3"
DEFAULT_CACHE = ROOT / "data" / "cache" / "pg_catalog.csv"
DEFAULT_REPORT = ROOT / "data" / "reports" / "library_miner_latest.md"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def normalize_text(value: str) -> str:
    return " ".join((value or "").strip().lower().split())


def split_semicolon(value: str) -> list[str]:
    return [x.strip() for x in (value or "").split(";") if x.strip()]


def stable_hash(*parts: str) -> str:
    payload = "\x1f".join(parts).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def open_db(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(
        """
        CREATE TABLE IF NOT EXISTS runs (
            run_id TEXT PRIMARY KEY,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            source_system TEXT NOT NULL,
            catalog_locator TEXT NOT NULL,
            catalog_sha256 TEXT,
            row_count INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS raw_records (
            source_system TEXT NOT NULL,
            source_record_id TEXT NOT NULL,
            raw_sha256 TEXT NOT NULL,
            raw_json TEXT NOT NULL,
            first_seen_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL,
            PRIMARY KEY (source_system, source_record_id, raw_sha256)
        );

        CREATE TABLE IF NOT EXISTS source_records (
            source_system TEXT NOT NULL,
            source_record_id TEXT NOT NULL,
            title TEXT NOT NULL,
            normalized_title TEXT NOT NULL,
            authors_json TEXT NOT NULL,
            normalized_authors TEXT NOT NULL,
            languages_json TEXT NOT NULL,
            subjects_json TEXT NOT NULL,
            locc_json TEXT NOT NULL,
            bookshelves_json TEXT NOT NULL,
            source_type TEXT,
            issued TEXT,
            identity_group TEXT NOT NULL,
            identity_confidence TEXT NOT NULL,
            triage_state TEXT NOT NULL,
            triage_reason TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (source_system, source_record_id)
        );

        CREATE INDEX IF NOT EXISTS idx_source_identity_group
            ON source_records(identity_group);
        CREATE INDEX IF NOT EXISTS idx_source_triage
            ON source_records(triage_state);
        CREATE INDEX IF NOT EXISTS idx_source_title
            ON source_records(normalized_title);
        """
    )
    return con


def download(url: str, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Novel-Library-Miner/0.1 (bulk catalog client)"},
    )
    with urllib.request.urlopen(req, timeout=120) as r, tmp.open("wb") as f:
        while True:
            chunk = r.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
    tmp.replace(dest)
    return dest


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def triage(row: dict, config: dict) -> tuple[str, str]:
    source_type = normalize_text(row.get("Type", ""))
    if source_type and source_type != "text":
        return "REJECT_NON_TEXT", f"Source Type is {row.get('Type', '')!r}, not Text."

    haystack = " ; ".join(
        [
            row.get("Subjects", ""),
            row.get("Bookshelves", ""),
        ]
    ).lower()

    negative_terms = config["classification"]["obvious_non_novel_terms"]
    fiction_terms = config["classification"]["fiction_signals"]

    negatives = [term for term in negative_terms if term in haystack]
    positives = [term for term in fiction_terms if term in haystack]

    # Conservative rule: reject only when an explicit non-novel signal exists and
    # there is no competing fiction signal. Otherwise route to review.
    if negatives and not positives:
        return (
            "REJECT_OBVIOUS_NON_NOVEL",
            "Explicit non-novel metadata: " + ", ".join(sorted(set(negatives))),
        )

    if positives:
        return (
            "TYPE_REVIEW",
            "Fiction/novel signal found, but catalog metadata alone does not "
            "prove novel form: " + ", ".join(sorted(set(positives))),
        )

    return (
        "METADATA_REVIEW",
        "No sufficiently strong deterministic literary-form signal.",
    )


def normalize_row(row: dict, config: dict) -> dict:
    title = (row.get("Title") or "").strip()
    authors = split_semicolon(row.get("Authors", ""))
    languages = split_semicolon(row.get("Language", ""))
    subjects = split_semicolon(row.get("Subjects", ""))
    locc = split_semicolon(row.get("LoCC", ""))
    bookshelves = split_semicolon(row.get("Bookshelves", ""))

    normalized_title = normalize_text(title)
    normalized_authors_list = [normalize_text(a) for a in authors]
    normalized_authors = "|".join(sorted(normalized_authors_list))
    language_key = "|".join(sorted(normalize_text(x) for x in languages))

    # This is only a grouping hint, never a destructive merge.
    identity_group = stable_hash(
        normalized_title, normalized_authors, language_key
    )[:24]
    state, reason = triage(row, config)

    return {
        "source_record_id": str(row.get("Text#", "")).strip(),
        "title": title,
        "normalized_title": normalized_title,
        "authors": authors,
        "normalized_authors": normalized_authors,
        "languages": languages,
        "subjects": subjects,
        "locc": locc,
        "bookshelves": bookshelves,
        "source_type": (row.get("Type") or "").strip(),
        "issued": (row.get("Issued") or "").strip(),
        "identity_group": identity_group,
        "identity_confidence": "medium",
        "triage_state": state,
        "triage_reason": reason,
    }


def read_catalog(path: Path, limit: int | None = None) -> Iterable[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        required = {
            "Text#",
            "Type",
            "Issued",
            "Title",
            "Language",
            "Authors",
            "Subjects",
            "LoCC",
            "Bookshelves",
        }
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(
                f"Catalog missing expected columns: {sorted(missing)}"
            )
        for i, row in enumerate(reader):
            if limit is not None and i >= limit:
                break
            yield row


def ingest(
    catalog: Path,
    db: Path,
    config: dict,
    source_system: str = "gutenberg",
    limit: int | None = None,
) -> dict:
    con = open_db(db)
    started = utc_now()
    catalog_hash = file_sha256(catalog)
    run_id = stable_hash(
        source_system, str(catalog.resolve()), catalog_hash, started
    )[:24]
    con.execute(
        """
        INSERT INTO runs(
            run_id, started_at, source_system, catalog_locator,
            catalog_sha256, status
        ) VALUES(?,?,?,?,?,?)
        """,
        (
            run_id,
            started,
            source_system,
            str(catalog),
            catalog_hash,
            "RUNNING",
        ),
    )

    counts = Counter()
    rows = 0
    try:
        for row in read_catalog(catalog, limit=limit):
            rows += 1
            source_record_id = str(row.get("Text#", "")).strip()
            if not source_record_id:
                counts["MISSING_SOURCE_ID"] += 1
                continue

            raw_json = json.dumps(row, ensure_ascii=False, sort_keys=True)
            raw_hash = hashlib.sha256(raw_json.encode("utf-8")).hexdigest()
            now = utc_now()
            con.execute(
                """
                INSERT INTO raw_records(
                    source_system, source_record_id, raw_sha256, raw_json,
                    first_seen_at, last_seen_at
                ) VALUES(?,?,?,?,?,?)
                ON CONFLICT(source_system, source_record_id, raw_sha256)
                DO UPDATE SET last_seen_at=excluded.last_seen_at
                """,
                (
                    source_system,
                    source_record_id,
                    raw_hash,
                    raw_json,
                    now,
                    now,
                ),
            )

            n = normalize_row(row, config)
            con.execute(
                """
                INSERT INTO source_records(
                    source_system, source_record_id, title, normalized_title,
                    authors_json, normalized_authors, languages_json,
                    subjects_json, locc_json, bookshelves_json, source_type,
                    issued, identity_group, identity_confidence, triage_state,
                    triage_reason, updated_at
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(source_system, source_record_id) DO UPDATE SET
                    title=excluded.title,
                    normalized_title=excluded.normalized_title,
                    authors_json=excluded.authors_json,
                    normalized_authors=excluded.normalized_authors,
                    languages_json=excluded.languages_json,
                    subjects_json=excluded.subjects_json,
                    locc_json=excluded.locc_json,
                    bookshelves_json=excluded.bookshelves_json,
                    source_type=excluded.source_type,
                    issued=excluded.issued,
                    identity_group=excluded.identity_group,
                    identity_confidence=excluded.identity_confidence,
                    triage_state=excluded.triage_state,
                    triage_reason=excluded.triage_reason,
                    updated_at=excluded.updated_at
                """,
                (
                    source_system,
                    n["source_record_id"],
                    n["title"],
                    n["normalized_title"],
                    json.dumps(n["authors"], ensure_ascii=False),
                    n["normalized_authors"],
                    json.dumps(n["languages"], ensure_ascii=False),
                    json.dumps(n["subjects"], ensure_ascii=False),
                    json.dumps(n["locc"], ensure_ascii=False),
                    json.dumps(n["bookshelves"], ensure_ascii=False),
                    n["source_type"],
                    n["issued"],
                    n["identity_group"],
                    n["identity_confidence"],
                    n["triage_state"],
                    n["triage_reason"],
                    now,
                ),
            )
            counts[n["triage_state"]] += 1

        con.execute(
            """
            UPDATE runs
            SET completed_at=?, row_count=?, status=?
            WHERE run_id=?
            """,
            (utc_now(), rows, "COMPLETED", run_id),
        )
        con.commit()
    except Exception:
        con.execute(
            """
            UPDATE runs
            SET completed_at=?, row_count=?, status=?
            WHERE run_id=?
            """,
            (utc_now(), rows, "FAILED", run_id),
        )
        con.commit()
        raise
    finally:
        con.close()

    return {
        "run_id": run_id,
        "rows": rows,
        "counts": dict(counts),
        "catalog_sha256": catalog_hash,
    }


def report(db: Path, output: Path | None = None) -> str:
    con = open_db(db)
    rows = con.execute(
        """
        SELECT triage_state, COUNT(*) AS n
        FROM source_records
        GROUP BY triage_state
        ORDER BY n DESC
        """
    ).fetchall()
    groups = con.execute(
        """
        SELECT identity_group, COUNT(*) AS n,
               MIN(title) AS title, MIN(authors_json) AS authors
        FROM source_records
        GROUP BY identity_group
        HAVING COUNT(*) > 1
        ORDER BY n DESC, title
        LIMIT 20
        """
    ).fetchall()
    examples = con.execute(
        """
        SELECT source_record_id, title, authors_json,
               triage_state, triage_reason
        FROM source_records
        WHERE triage_state='TYPE_REVIEW'
        ORDER BY title
        LIMIT 20
        """
    ).fetchall()
    con.close()

    lines = [
        "# Library Miner Report",
        "",
        f"Generated: {utc_now()}",
        "",
        "## Triage counts",
        "",
        "| State | Count |",
        "|---|---:|",
    ]
    for row in rows:
        lines.append(f"| {row['triage_state']} | {row['n']} |")

    lines += ["", "## Potential duplicate/edition groups", ""]
    if groups:
        for group in groups:
            lines.append(
                f"- **{group['title']}** — {group['n']} source records "
                f"— authors {group['authors']}"
            )
    else:
        lines.append("No repeated medium-confidence identity groups found.")

    lines += [
        "",
        "## Example fiction candidates requiring novel-form review",
        "",
    ]
    if examples:
        for example in examples:
            lines.append(
                f"- #{example['source_record_id']} **{example['title']}** — "
                f"{example['authors_json']} — {example['triage_reason']}"
            )
    else:
        lines.append("No TYPE_REVIEW candidates found.")

    text_out = "\n".join(lines) + "\n"
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(text_out, encoding="utf-8")
    return text_out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Novel Library Miner")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    sub = parser.add_subparsers(dest="command", required=True)

    sync = sub.add_parser(
        "sync", help="Download/read a catalog and ingest it"
    )
    sync.add_argument(
        "--catalog",
        help="Local CSV path or URL; defaults to configured Gutenberg bulk CSV",
    )
    sync.add_argument("--cache", type=Path, default=DEFAULT_CACHE)
    sync.add_argument("--limit", type=int)

    rep = sub.add_parser("report", help="Render a Markdown triage report")
    rep.add_argument("--output", type=Path, default=DEFAULT_REPORT)

    args = parser.parse_args(argv)
    config = load_config(args.config)

    if args.command == "sync":
        locator = (
            args.catalog
            or config["sources"]["gutenberg"]["catalog_url"]
        )
        if locator.startswith("http://") or locator.startswith("https://"):
            print(f"Downloading sanctioned bulk catalog: {locator}")
            catalog = download(locator, args.cache)
        else:
            catalog = Path(locator)
            if not catalog.exists():
                raise FileNotFoundError(catalog)
        result = ingest(
            catalog,
            args.db,
            config,
            limit=args.limit,
        )
        print(json.dumps(result, indent=2))
        return 0

    if args.command == "report":
        print(report(args.db, args.output))
        return 0

    return 2


if __name__ == "__main__":
    sys.exit(main())
