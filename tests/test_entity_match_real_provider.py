import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SPEC = importlib.util.spec_from_file_location(
    "real_bench", ROOT / "scripts" / "benchmark_entity_match_real.py"
)
real = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(real)


class RealProviderEntityMatchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        payload = json.loads(
            (ROOT / "tests" / "fixtures" / "entity_match_real_provider.json")
            .read_text(encoding="utf-8")
        )
        cls.cases = payload["cases"]

    def test_aggressive_subtitle_matcher_fails_real_safety_gate(self):
        result = real.evaluate(self.cases, real.bench.subtitle_tolerant)
        self.assertGreater(result["counts"].get("unsafe_strong", 0), 0)

    def test_hybrid_has_zero_unsafe_strong(self):
        result = real.evaluate(self.cases, real.bench.identifier_hybrid)
        self.assertEqual(result["counts"].get("unsafe_strong", 0), 0)

    def test_hybrid_preserves_risky_relationships_as_review(self):
        result = real.evaluate(self.cases, real.bench.identifier_hybrid)
        self.assertGreater(result["counts"].get("unsafe_review", 0), 0)

    def test_all_direct_editions_are_strong_in_current_fixture(self):
        result = real.evaluate(self.cases, real.bench.identifier_hybrid)
        direct_total = sum(
            1
            for case in self.cases
            if case["relationship"] in real.SAFE_STRONG_RELATIONSHIPS
        )
        self.assertEqual(result["counts"].get("direct_strong", 0), direct_total)


if __name__ == "__main__":
    unittest.main()
