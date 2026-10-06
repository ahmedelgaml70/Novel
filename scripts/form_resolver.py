#!/usr/bin/env python3
"""Evidence-backed literary-form resolution for Novel Scout.

Materializes provisional Work and Edition/Source entities from normalized source
records, stores external evidence claims, and resolves literary form only when
independent high-quality evidence is sufficient and non-conflicting.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "config" / "library_miner.json"
DEFAULT_DB = ROOT / "data" / "novel_scout.sqlite3"
DEFAULT_REPORT = ROOT / "data" / "reports" / "form_resolution_latest.md"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def stable_hash(*parts: str) -> str:
    payload = "\x1f".join(parts).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def open_db(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(
        """
        CREATE TABLE IF NOT EXISTS works (
            work_id TEXT PRIMARY KEY,
            canonical_title TEXT NOT NULL,
            normalized_title TEXT NOT NULL,
            authors_json TEXT NOT NULL,
            normalized_authors TEXT NOT NULL,
            languages_json TEXT NOT NULL,
            identity_basis TEXT NOT NULL,
            form_status TEXT NOT NULL DEFAULT 'UNKNOWN',
            form_confidence TEXT NOT NULL DEFAULT 'none',
            form_reason TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS edition_sources (
            edition_id TEXT PRIMARY KEY,
            work_id TEXT NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
            source_system TEXT NOT NULL,
            source_record_id TEXT NOT NULL,
            title TEXT NOT NULL,
            languages_json TEXT NOT NULL,
            issued TEXT,
            source_kind TEXT NOT NULL DEFAULT 'catalog_source',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(source_system, source_record_id)
        );

        CREATE INDEX IF NOT EXISTS idx_edition_work
            ON edition_sources(work_id);

        CREATE TABLE IF NOT EXISTS evidence (
            evidence_id TEXT PRIMARY KEY,
            work_id TEXT NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
            claim_key TEXT NOT NULL,
            claim_value TEXT NOT NULL,
            provider TEXT NOT NULL,
            authority_level TEXT NOT NULL,
            independence_key TEXT NOT NULL,
            source_locator TEXT,
            claim_text TEXT,
            raw_json TEXT NOT NULL,
            collected_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_evidence_work_claim
            ON evidence(work_id, claim_key);
        """
    )
    return con


def _json_load(value: str, default):
    try:
        return json.loads(value) if value else default
    except json.JSONDecodeError:
        return default


def materialize(db: Path) -> dict:
    con = open_db(db)
    source_rows = con.execute(
        """
        SELECT source_system, source_record_id, title, normalized_title,
               authors_json, normalized_authors, languages_json, issued,
               identity_group, source_type
        FROM source_records
        WHERE lower(COALESCE(source_type, '')) = 'text'
        ORDER BY identity_group, source_system, source_record_id
        """
    ).fetchall()

    groups: dict[str, list[sqlite3.Row]] = defaultdict(list)
    for row in source_rows:
        groups[row["identity_group"]].append(row)

    now = utc_now()
    work_count = 0
    edition_count = 0
    for identity_group, rows in groups.items():
        representative = rows[0]
        work_id = stable_hash("work", identity_group)[:24]
        languages = sorted(
            {
                lang
                for row in rows
                for lang in _json_load(row["languages_json"], [])
                if lang
            }
        )
        con.execute(
            """
            INSERT INTO works(
                work_id, canonical_title, normalized_title, authors_json,
                normalized_authors, languages_json, identity_basis,
                created_at, updated_at
            ) VALUES(?,?,?,?,?,?,?,?,?)
            ON CONFLICT(work_id) DO UPDATE SET
                canonical_title=excluded.canonical_title,
                normalized_title=excluded.normalized_title,
                authors_json=excluded.authors_json,
                normalized_authors=excluded.normalized_authors,
                languages_json=excluded.languages_json,
                identity_basis=excluded.identity_basis,
                updated_at=excluded.updated_at
            """,
            (
                work_id,
                representative["title"],
                representative["normalized_title"],
                representative["authors_json"],
                representative["normalized_authors"],
                json.dumps(languages, ensure_ascii=False),
                f"source_identity_group:{identity_group}",
                now,
                now,
            ),
        )
        work_count += 1

        for row in rows:
            edition_id = stable_hash(
                "edition", row["source_system"], row["source_record_id"]
            )[:24]
            con.execute(
                """
                INSERT INTO edition_sources(
                    edition_id, work_id, source_system, source_record_id,
                    title, languages_json, issued, created_at, updated_at
                ) VALUES(?,?,?,?,?,?,?,?,?)
                ON CONFLICT(source_system, source_record_id) DO UPDATE SET
                    work_id=excluded.work_id,
                    title=excluded.title,
                    languages_json=excluded.languages_json,
                    issued=excluded.issued,
                    updated_at=excluded.updated_at
                """,
                (
                    edition_id,
                    work_id,
                    row["source_system"],
                    row["source_record_id"],
                    row["title"],
                    row["languages_json"],
                    row["issued"],
                    now,
                    now,
                ),
            )
            edition_count += 1

    con.commit()
    con.close()
    return {"works": work_count, "edition_sources": edition_count}


def work_for_source_record(
    con: sqlite3.Connection, source_system: str, source_record_id: str
) -> str:
    row = con.execute(
        """
        SELECT work_id FROM edition_sources
        WHERE source_system=? AND source_record_id=?
        """,
        (source_system, source_record_id),
    ).fetchone()
    if row is None:
        raise ValueError(
            f"No materialized work for {source_system}:{source_record_id}. "
            "Run materialize first."
        )
    return row["work_id"]


def add_evidence(con: sqlite3.Connection, item: dict) -> str:
    required = {
        "source_system",
        "source_record_id",
        "claim_key",
        "claim_value",
        "provider",
        "authority_level",
        "independence_key",
    }
    missing = sorted(required.difference(item))
    if missing:
        raise ValueError(f"Evidence item missing fields: {missing}")

    work_id = work_for_source_record(
        con, str(item["source_system"]), str(item["source_record_id"])
    )
    raw_json = json.dumps(item, ensure_ascii=False, sort_keys=True)
    evidence_id = stable_hash(
        "evidence",
        work_id,
        str(item["claim_key"]),
        str(item["claim_value"]),
        str(item["provider"]),
        str(item["authority_level"]),
        str(item["independence_key"]),
        str(item.get("source_locator", "")),
    )[:32]
    con.execute(
        """
        INSERT INTO evidence(
            evidence_id, work_id, claim_key, claim_value, provider,
            authority_level, independence_key, source_locator, claim_text,
            raw_json, collected_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(evidence_id) DO UPDATE SET
            claim_text=excluded.claim_text,
            raw_json=excluded.raw_json,
            collected_at=excluded.collected_at
        """,
        (
            evidence_id,
            work_id,
            str(item["claim_key"]),
            str(item["claim_value"]),
            str(item["provider"]),
            str(item["authority_level"]),
            str(item["independence_key"]),
            item.get("source_locator"),
            item.get("claim_text"),
            raw_json,
            str(item.get("collected_at") or utc_now()),
        ),
    )
    return evidence_id


def load_evidence_jsonl(path: Path, db: Path) -> dict:
    con = open_db(db)
    loaded = 0
    with path.open("r", encoding="utf-8") as f:
        for line_number, line in enumerate(f, start=1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON at {path}:{line_number}") from exc
            add_evidence(con, item)
            loaded += 1
    con.commit()
    con.close()
    return {"loaded": loaded}


def resolve_form_for_work(
    con: sqlite3.Connection, work_id: str, config: dict
) -> tuple[str, str, str]:
    policy = config["form_resolution"]
    min_sources = int(policy["min_independent_high_quality_sources"])
    good_levels = set(policy["high_quality_authority_levels"])
    claim_map = policy["claim_map"]

    rows = con.execute(
        """
        SELECT claim_value, provider, authority_level, independence_key,
               source_locator, claim_text
        FROM evidence
        WHERE work_id=? AND claim_key='literary_form'
        ORDER BY provider, independence_key
        """,
        (work_id,),
    ).fetchall()

    support: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        if row["authority_level"] not in good_levels:
            continue
        category = claim_map.get(str(row["claim_value"]).strip().lower())
        if category is None:
            continue
        support[category].add(row["independence_key"])

    active = {category: keys for category, keys in support.items() if keys}
    if not active:
        return "UNKNOWN", "none", "No high-quality literary-form evidence."

    if len(active) > 1:
        details = ", ".join(
            f"{category}={len(keys)} independent source(s)"
            for category, keys in sorted(active.items())
        )
        return (
            "DISPUTED",
            "conflict",
            f"Conflicting high-quality evidence: {details}.",
        )

    category, keys = next(iter(active.items()))
    if len(keys) < min_sources:
        return (
            "UNKNOWN",
            "medium",
            f"Only {len(keys)} independent high-quality source(s) support "
            f"{category}; policy requires {min_sources}.",
        )

    return (
        category,
        "high",
        f"{len(keys)} independent high-quality sources agree on {category}.",
    )


def resolve_all(db: Path, config: dict) -> dict:
    con = open_db(db)
    rows = con.execute("SELECT work_id FROM works ORDER BY work_id").fetchall()
    counts = Counter()
    now = utc_now()
    for row in rows:
        status, confidence, reason = resolve_form_for_work(
            con, row["work_id"], config
        )
        con.execute(
            """
            UPDATE works
            SET form_status=?, form_confidence=?, form_reason=?, updated_at=?
            WHERE work_id=?
            """,
            (status, confidence, reason, now, row["work_id"]),
        )
        counts[status] += 1
    con.commit()
    con.close()
    return {"works": len(rows), "counts": dict(counts)}


def report(db: Path, output: Path | None = None) -> str:
    con = open_db(db)
    counts = con.execute(
        """
        SELECT form_status, COUNT(*) AS n
        FROM works GROUP BY form_status ORDER BY n DESC, form_status
        """
    ).fetchall()
    unresolved = con.execute(
        """
        SELECT canonical_title, authors_json, form_status, form_reason
        FROM works
        WHERE form_status IN ('UNKNOWN','DISPUTED')
        ORDER BY canonical_title
        LIMIT 50
        """
    ).fetchall()
    con.close()

    lines = [
        "# Literary Form Resolution Report",
        "",
        f"Generated: {utc_now()}",
        "",
        "## Form states",
        "",
        "| State | Count |",
        "|---|---:|",
    ]
    for row in counts:
        lines.append(f"| {row['form_status']} | {row['n']} |")

    lines += ["", "## Unresolved / disputed", ""]
    if unresolved:
        for row in unresolved:
            lines.append(
                f"- **{row['canonical_title']}** — {row['form_status']} — "
                f"{row['form_reason']}"
            )
    else:
        lines.append("No unresolved or disputed works.")

    text_out = "\n".join(lines) + "\n"
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(text_out, encoding="utf-8")
    return text_out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Novel literary-form resolver")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("materialize", help="Build Work and Edition/Source entities")

    load = sub.add_parser("load-evidence", help="Load JSONL evidence claims")
    load.add_argument("--file", type=Path, required=True)

    sub.add_parser("resolve", help="Resolve literary form from stored evidence")

    rep = sub.add_parser("report", help="Render literary-form report")
    rep.add_argument("--output", type=Path, default=DEFAULT_REPORT)

    args = parser.parse_args(argv)
    config = load_config(args.config)

    if args.command == "materialize":
        print(json.dumps(materialize(args.db), indent=2))
        return 0
    if args.command == "load-evidence":
        print(json.dumps(load_evidence_jsonl(args.file, args.db), indent=2))
        return 0
    if args.command == "resolve":
        print(json.dumps(resolve_all(args.db, config), indent=2))
        return 0
    if args.command == "report":
        print(report(args.db, args.output))
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
