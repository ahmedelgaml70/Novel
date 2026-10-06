import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("bench", ROOT / "scripts" / "benchmark_entity_match.py")
bench = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(bench)


class EntityMatchBenchmarkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        payload = json.loads((ROOT / "tests" / "fixtures" / "entity_match_cases.json").read_text())
        cls.cases = payload["cases"]

    def test_no_synthetic_matcher_accepts_wrong_work_strongly(self):
        for name, fn in bench.MATCHERS.items():
            result = bench.evaluate(self.cases, fn)
            self.assertEqual(result["counts"].get("false_strong", 0), 0, name)

    def test_subtitle_tolerant_improves_true_strong_over_current(self):
        current = bench.evaluate(self.cases, bench.current_strict)["counts"]
        candidate = bench.evaluate(self.cases, bench.subtitle_tolerant)["counts"]
        self.assertGreater(candidate.get("true_strong", 0), current.get("true_strong", 0))

    def test_hybrid_routes_shared_id_author_conflict_to_review(self):
        case = next(c for c in self.cases if c["case_id"] == "shared_id_author_conflict")
        self.assertEqual(bench.identifier_hybrid(case), "REVIEW")

    def test_partial_volume_never_becomes_strong(self):
        case = next(c for c in self.cases if c["case_id"] == "partial_volume")
        for fn in bench.MATCHERS.values():
            self.assertNotEqual(fn(case), "STRONG")


if __name__ == "__main__":
    unittest.main()
