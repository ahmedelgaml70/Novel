#!/usr/bin/env python3
"""Benchmark candidate Work entity matchers without changing production matching."""

from __future__ import annotations
import argparse
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FIXTURE = ROOT / "tests" / "fixtures" / "entity_match_cases.json"
DEFAULT_REPORT = ROOT / "data" / "reports" / "entity_match_benchmark.md"


def current_normalize(value: str) -> str:
    """Mirror scripts/evidence_collectors.py production normalization."""
    value = (value or "").lower()
    value = re.sub(r"[^\w\s]", " ", value, flags=re.UNICODE)
    return " ".join(value.split())


def normalize(value: str) -> str:
    """Candidate normalization used only by experimental matchers B/C."""
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch)).lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    return " ".join(value.split())


def current_normalize_author(value: str) -> str:
    value = current_normalize(value)
    value = re.sub(r"\b\d{3,4}\b", " ", value)
    return " ".join(value.split())


def current_author_compatible(expected: str, actual: str) -> bool:
    e = set(current_normalize_author(expected).split())
    a = set(current_normalize_author(actual).split())
    if not e or not a:
        return False
    overlap = len(e & a)
    return overlap >= 2 and overlap / max(1, min(len(e), len(a))) >= 0.8


def normalize_author(value: str) -> str:
    value = normalize(value)
    value = re.sub(r"\b\d{3,4}\b", " ", value)
    return " ".join(value.split())


def author_tokens(value: str) -> set[str]:
    return set(normalize_author(value).split())


def author_compatible(expected: str, actual: str) -> bool:
    e = author_tokens(expected)
    a = author_tokens(actual)
    if not e or not a:
        return False
    overlap = len(e & a)
    return overlap >= 2 and overlap / max(1, min(len(e), len(a))) >= 0.8


def title_core(value: str) -> str:
    # Conservative subtitle handling: only colon/semicolon delimiters.
    head = re.split(r"\s*[:;]\s*", value or "", maxsplit=1)[0]
    return normalize(head)


def suspicious_container_or_partial(value: str) -> bool:
    n = normalize(value)
    markers = (
        "volume 1", "volume i", "vol 1", "vol i", "part 1", "part i",
        "and other stories", "other stories", "selected stories", "collected stories",
    )
    return any(marker in n for marker in markers)


def current_strict(case: dict) -> str:
    c = case["candidate"]
    e = case["external"]
    if current_normalize(c["title"]) != current_normalize(e["title"]):
        return "NO_MATCH"
    if any(current_author_compatible(c["author"], a) for a in e.get("authors", [])):
        return "STRONG"
    return "NO_MATCH"


def subtitle_tolerant(case: dict) -> str:
    c = case["candidate"]
    e = case["external"]
    if suspicious_container_or_partial(e["title"]):
        return "NO_MATCH"
    author_ok = any(author_compatible(c["author"], a) for a in e.get("authors", []))
    if not author_ok:
        return "NO_MATCH"
    ct = normalize(c["title"])
    et = normalize(e["title"])
    cc = title_core(c["title"])
    ec = title_core(e["title"])
    if ct == et or cc == ec or cc == et or ct == ec:
        return "STRONG"
    return "NO_MATCH"


def identifier_hybrid(case: dict) -> str:
    c = case["candidate"]
    e = case["external"]
    author_ok = any(author_compatible(c["author"], a) for a in e.get("authors", []))

    if case.get("shared_authoritative_id"):
        return "STRONG" if author_ok else "REVIEW"

    if suspicious_container_or_partial(e["title"]):
        return "REVIEW" if author_ok else "NO_MATCH"

    ct = normalize(c["title"])
    et = normalize(e["title"])
    if ct == et and author_ok:
        return "STRONG"

    cc = title_core(c["title"])
    ec = title_core(e["title"])
    if author_ok and (cc == ec or cc == et or ct == ec):
        return "REVIEW"

    overlap = set(ct.split()) & set(et.split())
    if author_ok and len(overlap) >= 2:
        return "REVIEW"

    return "NO_MATCH"


MATCHERS = {
    "A_current_strict": current_strict,
    "B_subtitle_tolerant": subtitle_tolerant,
    "C_identifier_hybrid": identifier_hybrid,
}


def evaluate(cases: list[dict], matcher) -> dict:
    counts = Counter()
    details = []
    for case in cases:
        result = matcher(case)
        same = bool(case["same_work"])
        if same and result == "STRONG":
            bucket = "true_strong"
        elif same and result == "REVIEW":
            bucket = "true_review"
        elif same:
            bucket = "true_miss"
        elif result == "STRONG":
            bucket = "false_strong"
        elif result == "REVIEW":
            bucket = "false_review"
        else:
            bucket = "false_nomatch"
        counts[bucket] += 1
        details.append({"case_id": case["case_id"], "same_work": same, "result": result, "bucket": bucket})
    return {"counts": dict(counts), "details": details}


def render(results: dict) -> str:
    lines = [
        "# Entity Matching Benchmark",
        "",
        "Critical metric: **false_strong** (wrong Work accepted as a strong match).",
        "",
        "| Matcher | True strong | True review | True miss | False strong | False review | Correct no-match |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for name, result in results.items():
        c = Counter(result["counts"])
        lines.append(
            f"| {name} | {c['true_strong']} | {c['true_review']} | {c['true_miss']} | "
            f"{c['false_strong']} | {c['false_review']} | {c['false_nomatch']} |"
        )

    lines += [
        "",
        "## Interpretation rule",
        "",
        "- Any matcher with a non-zero false-strong count fails the safety gate.",
        "- Synthetic success is necessary but not sufficient for production replacement.",
        "- A production matcher change requires real provider-record benchmarking as well.",
        "",
        "## Case-level results",
        "",
    ]
    names = list(results)
    by_case = {}
    for name in names:
        for row in results[name]["details"]:
            by_case.setdefault(row["case_id"], {})[name] = row["result"]
            by_case[row["case_id"]]["same_work"] = row["same_work"]

    lines += [
        "| Case | Same Work | " + " | ".join(names) + " |",
        "|---|:---:|" + "|".join(["---"] * len(names)) + "|",
    ]
    for case_id, row in by_case.items():
        vals = " | ".join(row.get(name, "") for name in names)
        lines.append(f"| {case_id} | {'yes' if row['same_work'] else 'no'} | {vals} |")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE)
    parser.add_argument("--output", type=Path, default=DEFAULT_REPORT)
    args = parser.parse_args()

    payload = json.loads(args.fixture.read_text(encoding="utf-8"))
    cases = payload["cases"]
    results = {name: evaluate(cases, fn) for name, fn in MATCHERS.items()}
    text = render(results)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text, encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
