#!/usr/bin/env python3
"""Real bibliographic evidence collectors for Novel Scout.

Collectors are cache-first, conservative about entity matching, and emit only
explicit literary-form evidence. Generic "fiction" metadata is not upgraded to
"novel". External evidence is attached to a Work only after a strong identity
match.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "config" / "library_miner.json"
DEFAULT_DB = ROOT / "data" / "novel_scout.sqlite3"
DEFAULT_CACHE = ROOT / "data" / "cache" / "evidence"

PARSER_VERSION = "evidence-collectors-v0.1"


def utc_now() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def normalize_text(value: str) -> str:
    value = (value or "").lower()
    value = re.sub(r"[^\w\s]", " ", value, flags=re.UNICODE)
    return " ".join(value.split())


def normalize_author(value: str) -> str:
    value = normalize_text(value)
    # Keep the full normalized string, but remove common date fragments.
    value = re.sub(r"\b\d{3,4}\b", " ", value)
    return " ".join(value.split())


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
        CREATE TABLE IF NOT EXISTS external_cache (
            provider TEXT NOT NULL,
            cache_key TEXT NOT NULL,
            request_url TEXT NOT NULL,
            http_status INTEGER,
            raw_sha256 TEXT,
            raw_body BLOB,
            fetched_at TEXT NOT NULL,
            parser_version TEXT NOT NULL,
            PRIMARY KEY(provider, cache_key)
        );

        CREATE TABLE IF NOT EXISTS collector_runs (
            run_id TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            requested_works INTEGER NOT NULL DEFAULT 0,
            matched_works INTEGER NOT NULL DEFAULT 0,
            evidence_items INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL
        );
        """
    )
    return con


FORM_PATTERNS = [
    (re.compile(r"\bnovellas?\b", re.I), "novella"),
    (re.compile(r"\bnovels?\b", re.I), "novel"),
    (re.compile(r"\bshort stories\b", re.I), "short_story_collection"),
    (re.compile(r"\bstory collections?\b", re.I), "story_collection"),
    (re.compile(r"\bplays?\b", re.I), "play"),
    (re.compile(r"\bdrama\b", re.I), "drama"),
    (re.compile(r"\bpoetry\b", re.I), "poetry"),
    (re.compile(r"\bpoems?\b", re.I), "poetry"),
    (re.compile(r"\bessays?\b", re.I), "essay_collection"),
]


def explicit_form_claim(term: str) -> str | None:
    """Map explicit form vocabulary to resolver values.

    Intentionally does not map generic "fiction", "gothic fiction",
    "science fiction", etc. Those are genre/topic signals, not proof of novel form.
    """
    term = (term or "").strip()
    for pattern, value in FORM_PATTERNS:
        if pattern.search(term):
            return value
    return None


def work_rows(con: sqlite3.Connection, limit: int | None = None) -> list[sqlite3.Row]:
    sql = """
        SELECT work_id, canonical_title, normalized_title, authors_json,
               normalized_authors, languages_json, form_status
        FROM works
        WHERE form_status IN ('UNKNOWN','DISPUTED')
        ORDER BY canonical_title
    """
    if limit is not None:
        sql += " LIMIT ?"
        return con.execute(sql, (limit,)).fetchall()
    return con.execute(sql).fetchall()


def primary_author(work: sqlite3.Row) -> str:
    try:
        authors = json.loads(work["authors_json"] or "[]")
    except json.JSONDecodeError:
        authors = []
    return authors[0] if authors else ""


def strong_match(work: sqlite3.Row, title: str, authors: list[str]) -> tuple[bool, list[str]]:
    """Conservative v0.1 entity matcher: exact normalized title + compatible author."""
    expected_title = work["normalized_title"]
    got_title = normalize_text(title)
    basis = []
    if got_title != expected_title:
        return False, basis
    basis.append("exact_normalized_title")

    expected_author = normalize_author(primary_author(work))
    if not expected_author:
        return False, basis

    author_norms = [normalize_author(a) for a in authors if a]
    if not any(
        a == expected_author
        or (a and expected_author and (a in expected_author or expected_author in a))
        for a in author_norms
    ):
        return False, basis
    basis.append("compatible_author")
    return True, basis


def cache_key(provider: str, work: sqlite3.Row) -> str:
    return stable_hash(
        PARSER_VERSION,
        provider,
        work["normalized_title"],
        work["normalized_authors"],
    )


def http_get_cached(
    con: sqlite3.Connection,
    provider: str,
    key: str,
    url: str,
    user_agent: str,
    refresh: bool = False,
) -> bytes:
    if not refresh:
        row = con.execute(
            "SELECT raw_body FROM external_cache WHERE provider=? AND cache_key=?",
            (provider, key),
        ).fetchone()
        if row is not None and row["raw_body"] is not None:
            return bytes(row["raw_body"])

    req = urllib.request.Request(url, headers={"User-Agent": user_agent})
    status = None
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            status = int(getattr(resp, "status", 200))
            body = resp.read()
    except Exception:
        con.execute(
            """
            INSERT INTO external_cache(
                provider, cache_key, request_url, http_status, raw_sha256,
                raw_body, fetched_at, parser_version
            ) VALUES(?,?,?,?,?,?,?,?)
            ON CONFLICT(provider, cache_key) DO UPDATE SET
                request_url=excluded.request_url,
                http_status=excluded.http_status,
                fetched_at=excluded.fetched_at,
                parser_version=excluded.parser_version
            """,
            (provider, key, url, status, None, None, utc_now(), PARSER_VERSION),
        )
        con.commit()
        raise

    digest = hashlib.sha256(body).hexdigest()
    con.execute(
        """
        INSERT INTO external_cache(
            provider, cache_key, request_url, http_status, raw_sha256,
            raw_body, fetched_at, parser_version
        ) VALUES(?,?,?,?,?,?,?,?)
        ON CONFLICT(provider, cache_key) DO UPDATE SET
            request_url=excluded.request_url,
            http_status=excluded.http_status,
            raw_sha256=excluded.raw_sha256,
            raw_body=excluded.raw_body,
            fetched_at=excluded.fetched_at,
            parser_version=excluded.parser_version
        """,
        (provider, key, url, status, digest, body, utc_now(), PARSER_VERSION),
    )
    con.commit()
    return body


def insert_evidence(
    con: sqlite3.Connection,
    work_id: str,
    claim_value: str,
    provider: str,
    authority_level: str,
    source_locator: str,
    claim_text: str,
    raw: dict,
) -> str:
    # Independence is provider/ecosystem-level, not record-level. Multiple
    # editions from Open Library cannot satisfy the two-source policy alone.
    independence_key = f"provider:{provider}"
    evidence_id = stable_hash(
        "evidence",
        work_id,
        "literary_form",
        claim_value,
        provider,
        independence_key,
        source_locator,
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
            "literary_form",
            claim_value,
            provider,
            authority_level,
            independence_key,
            source_locator,
            claim_text,
            json.dumps(raw, ensure_ascii=False, sort_keys=True),
            utc_now(),
        ),
    )
    return evidence_id


def build_openlibrary_url(work: sqlite3.Row, config: dict) -> str:
    base = config["evidence_collectors"]["openlibrary"]["search_url"]
    params = {
        "title": work["canonical_title"],
        "author": primary_author(work),
        "limit": "5",
        "fields": "key,title,author_name,first_publish_year,subject,lccn,isbn,edition_key",
    }
    return base + "?" + urllib.parse.urlencode(params)


def parse_openlibrary(body: bytes) -> list[dict]:
    payload = json.loads(body.decode("utf-8"))
    return payload.get("docs", []) if isinstance(payload, dict) else []


def collect_openlibrary_for_work(
    con: sqlite3.Connection,
    work: sqlite3.Row,
    config: dict,
    refresh: bool = False,
    body_override: bytes | None = None,
) -> dict:
    provider = "openlibrary"
    url = build_openlibrary_url(work, config)
    key = cache_key(provider, work)
    if body_override is None:
        body = http_get_cached(
            con,
            provider,
            key,
            url,
            config["evidence_collectors"]["user_agent"],
            refresh=refresh,
        )
    else:
        body = body_override

    matched = 0
    inserted = 0
    for doc in parse_openlibrary(body):
        title = doc.get("title") or ""
        authors = doc.get("author_name") or []
        ok, basis = strong_match(work, title, authors)
        if not ok:
            continue
        matched += 1
        subjects = doc.get("subject") or []
        claims = []
        for subject in subjects:
            claim = explicit_form_claim(subject)
            if claim and claim not in claims:
                claims.append(claim)
        for claim in claims:
            locator = f"https://openlibrary.org{doc.get('key','')}" if doc.get("key") else url
            insert_evidence(
                con,
                work["work_id"],
                claim,
                provider,
                "bibliographic",
                locator,
                next((s for s in subjects if explicit_form_claim(s) == claim), claim),
                {"match_basis": basis, "record": doc},
            )
            inserted += 1
    con.commit()
    return {"matched_records": matched, "evidence_items": inserted}


def build_loc_url(work: sqlite3.Row, config: dict) -> str:
    base = config["evidence_collectors"]["loc"]["sru_url"]
    title = work["canonical_title"].replace('"', "")
    author = primary_author(work).replace('"', "")
    query = f'dc.title="{title}" and dc.creator="{author}"'
    params = {
        "version": "1.1",
        "operation": "searchRetrieve",
        "query": query,
        "maximumRecords": "10",
        "recordSchema": "marcxml",
    }
    return base + "?" + urllib.parse.urlencode(params)


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _marc_subfields(record: ET.Element, tag_number: str, codes: set[str]) -> list[str]:
    values = []
    for field in record.iter():
        if _local_name(field.tag) != "datafield":
            continue
        if field.attrib.get("tag") != tag_number:
            continue
        for sub in field:
            if _local_name(sub.tag) == "subfield" and sub.attrib.get("code") in codes:
                if sub.text:
                    values.append(sub.text.strip())
    return values


def parse_loc_records(body: bytes) -> list[dict]:
    root = ET.fromstring(body)
    records = []
    for elem in root.iter():
        if _local_name(elem.tag) != "recordData":
            continue
        marc = next((x for x in elem.iter() if _local_name(x.tag) == "record"), None)
        if marc is None:
            continue
        title_parts = _marc_subfields(marc, "245", {"a", "b"})
        authors = _marc_subfields(marc, "100", {"a"}) + _marc_subfields(marc, "700", {"a"})
        forms = _marc_subfields(marc, "655", {"a", "v"})
        lccn = _marc_subfields(marc, "010", {"a"})
        isbn = _marc_subfields(marc, "020", {"a"})
        records.append(
            {
                "title": " ".join(title_parts).strip(" /:;"),
                "authors": authors,
                "forms": forms,
                "lccn": lccn,
                "isbn": isbn,
            }
        )
    return records


def collect_loc_for_work(
    con: sqlite3.Connection,
    work: sqlite3.Row,
    config: dict,
    refresh: bool = False,
    body_override: bytes | None = None,
) -> dict:
    provider = "library_of_congress"
    url = build_loc_url(work, config)
    key = cache_key(provider, work)
    if body_override is None:
        body = http_get_cached(
            con,
            provider,
            key,
            url,
            config["evidence_collectors"]["user_agent"],
            refresh=refresh,
        )
    else:
        body = body_override

    matched = 0
    inserted = 0
    for record in parse_loc_records(body):
        ok, basis = strong_match(work, record["title"], record["authors"])
        if not ok:
            continue
        matched += 1
        claims = []
        for term in record["forms"]:
            claim = explicit_form_claim(term)
            if claim and claim not in claims:
                claims.append(claim)
        for claim in claims:
            lccn = record["lccn"][0].strip() if record["lccn"] else ""
            locator = f"https://lccn.loc.gov/{urllib.parse.quote(lccn)}" if lccn else url
            insert_evidence(
                con,
                work["work_id"],
                claim,
                provider,
                "authoritative",
                locator,
                next((t for t in record["forms"] if explicit_form_claim(t) == claim), claim),
                {"match_basis": basis, "record": record},
            )
            inserted += 1
    con.commit()
    return {"matched_records": matched, "evidence_items": inserted}


def collect(
    db: Path,
    config: dict,
    provider: str,
    limit: int | None = None,
    refresh: bool = False,
) -> dict:
    con = open_db(db)
    works = work_rows(con, limit=limit)
    run_id = stable_hash(provider, utc_now(), str(len(works)))[:24]
    con.execute(
        "INSERT INTO collector_runs(run_id,provider,started_at,requested_works,status) VALUES(?,?,?,?,?)",
        (run_id, provider, utc_now(), len(works), "RUNNING"),
    )
    matched_works = 0
    evidence_items = 0
    errors = []

    for i, work in enumerate(works):
        try:
            results = []
            if provider in ("openlibrary", "all"):
                results.append(collect_openlibrary_for_work(con, work, config, refresh=refresh))
                time.sleep(float(config["evidence_collectors"]["openlibrary"].get("delay_seconds", 0)))
            if provider in ("loc", "all"):
                results.append(collect_loc_for_work(con, work, config, refresh=refresh))
                time.sleep(float(config["evidence_collectors"]["loc"].get("delay_seconds", 0)))
            if any(r["matched_records"] for r in results):
                matched_works += 1
            evidence_items += sum(r["evidence_items"] for r in results)
        except Exception as exc:
            errors.append({"work_id": work["work_id"], "title": work["canonical_title"], "error": str(exc)})

    con.execute(
        """
        UPDATE collector_runs SET completed_at=?, matched_works=?,
            evidence_items=?, status=? WHERE run_id=?
        """,
        (utc_now(), matched_works, evidence_items, "COMPLETED_WITH_ERRORS" if errors else "COMPLETED", run_id),
    )
    con.commit()
    con.close()
    return {
        "run_id": run_id,
        "requested_works": len(works),
        "matched_works": matched_works,
        "evidence_items": evidence_items,
        "errors": errors,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Novel bibliographic evidence collectors")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    sub = parser.add_subparsers(dest="command", required=True)

    c = sub.add_parser("collect", help="Collect real bibliographic form evidence")
    c.add_argument("--provider", choices=["openlibrary", "loc", "all"], default="all")
    c.add_argument("--limit", type=int)
    c.add_argument("--refresh", action="store_true")

    args = parser.parse_args(argv)
    config = load_config(args.config)
    if args.command == "collect":
        print(json.dumps(collect(args.db, config, args.provider, args.limit, args.refresh), indent=2))
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
