#!/usr/bin/env python3
"""Evaluate entity matchers against real-provider metadata relationships."""

from __future__ import annotations

import argparse
import importlib.util
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FIXTURE = ROOT / "tests" / "fixtures" / "entity_match_real_provider.json"
DEFAULT_REPORT = ROOT / "data" / "reports" / "entity_match_real_provider.md"

SPEC = importlib.util.spec_from_file_location(
    "synthetic_match_benchmark", ROOT / "scripts" / "benchmark_entity_match.py"
)
bench = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(bench)

SAFE_STRONG_RELATIONSHIPS = {"DIRECT_EDITION"}


def evaluate(cases: list[dict], matcher) -> dict:
    counts = Counter()
    details = []
    for case in cases:
        result = matcher(
            {
                "candidate": case["candidate"],
                "external": case["external"],
                "same_work": case["relationship"] in SAFE_STRONG_RELATIONSHIPS,
            }
        )
        safe = case["relationship"] in SAFE_STRONG_RELATIONSHIPS

        if safe and result == "STRONG":
            bucket = "direct_strong"
        elif safe and result == "REVIEW":
            bucket = "direct_review"
        elif safe:
            bucket = "direct_miss"
        elif result == "STRONG":
            bucket = "unsafe_strong"
        elif result == "REVIEW":
            bucket = "unsafe_review"
        else:
            bucket = "unsafe_nomatch"

        counts[bucket] += 1
        details.append(
            {
                "case_id": case["case_id"],
                "provider": case["provider"],
                "relationship": case["relationship"],
                "result": result,
                "bucket": bucket,
                "source_url": case["source_url"],
            }
        )
    return {"counts": dict(counts), "details": details}


def render(results: dict) -> str:
    lines = [
        "# Real-Provider Entity Matching Benchmark",
        "",
        "Only DIRECT_EDITION is considered safe for automatic STRONG attachment.",
        "Augmented editions, composites, adaptations, and secondary works should "
        "be REVIEW or NO_MATCH, never STRONG.",
        "",
        "| Matcher | Direct strong | Direct review | Direct miss | Unsafe strong | Unsafe review | Unsafe no-match |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]

    for name, result in results.items():
        c = Counter(result["counts"])
        lines.append(
            f"| {name} | {c['direct_strong']} | {c['direct_review']} | "
            f"{c['direct_miss']} | {c['unsafe_strong']} | "
            f"{c['unsafe_review']} | {c['unsafe_nomatch']} |"
        )

    lines += [
        "",
        "## Safety interpretation",
        "",
        "- Any non-zero **unsafe_strong** fails the production safety gate.",
        "- REVIEW is deliberately preferable to a false strong match.",
        "- This benchmark uses real provider metadata but is still a small curated set.",
        "",
        "## Case-level results",
        "",
    ]

    names = list(results)
    by_case = {}
    for name in names:
        for row in results[name]["details"]:
            item = by_case.setdefault(
                row["case_id"],
                {
                    "provider": row["provider"],
                    "relationship": row["relationship"],
                    "source_url": row["source_url"],
                },
            )
            item[name] = row["result"]

    lines.append("| Case | Provider | Relationship | " + " | ".join(names) + " |")
    lines.append("|---|---|---|" + "|".join(["---"] * len(names)) + "|")
    for case_id, row in by_case.items():
        vals = " | ".join(row.get(name, "") for name in names)
        lines.append(
            f"| {case_id} | {row['provider']} | {row['relationship']} | {vals} |"
        )

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE)
    parser.add_argument("--output", type=Path, default=DEFAULT_REPORT)
    args = parser.parse_args()

    payload = json.loads(args.fixture.read_text(encoding="utf-8"))
    cases = payload["cases"]

    results = {
        "A_current_strict": evaluate(cases, bench.current_strict),
        "B_subtitle_tolerant": evaluate(cases, bench.subtitle_tolerant),
        "C_identifier_hybrid": evaluate(cases, bench.identifier_hybrid),
    }

    text = render(results)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text, encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
