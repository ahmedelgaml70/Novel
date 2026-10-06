import importlib.util
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("scout_library", ROOT / "scripts" / "scout_library.py")
scout = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(scout)


class LibraryMinerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / "scout.sqlite3"
        self.config = scout.load_config(ROOT / "config" / "library_miner.json")
        self.fixture = ROOT / "tests" / "fixtures" / "gutenberg_sample.csv"

    def tearDown(self):
        self.tmp.cleanup()

    def test_fixture_ingest_is_repeatable(self):
        first = scout.ingest(self.fixture, self.db, self.config)
        second = scout.ingest(self.fixture, self.db, self.config)
        self.assertEqual(first["rows"], 7)
        self.assertEqual(second["rows"], 7)

        con = sqlite3.connect(self.db)
        count = con.execute("SELECT COUNT(*) FROM source_records").fetchone()[0]
        raw_count = con.execute("SELECT COUNT(*) FROM raw_records").fetchone()[0]
        con.close()
        self.assertEqual(count, 7)
        self.assertEqual(raw_count, 7)

    def test_conservative_triage(self):
        scout.ingest(self.fixture, self.db, self.config)
        con = sqlite3.connect(self.db)
        states = dict(con.execute("SELECT source_record_id, triage_state FROM source_records"))
        con.close()

        self.assertEqual(states["1342"], "TYPE_REVIEW")
        self.assertEqual(states["84"], "TYPE_REVIEW")
        self.assertEqual(states["1524"], "REJECT_OBVIOUS_NON_NOVEL")
        self.assertEqual(states["99901"], "REJECT_NON_TEXT")
        self.assertEqual(states["99902"], "REJECT_OBVIOUS_NON_NOVEL")

        # Sherlock Holmes is a short-story collection. Catalog metadata contains
        # fiction signals, so v0.1 refuses to force a novel classification.
        self.assertEqual(states["1661"], "TYPE_REVIEW")

    def test_exact_title_author_language_groups_without_destructive_merge(self):
        scout.ingest(self.fixture, self.db, self.config)
        con = sqlite3.connect(self.db)
        rows = con.execute(
            "SELECT source_record_id, identity_group FROM source_records "
            "WHERE source_record_id IN ('1342','99903') ORDER BY source_record_id"
        ).fetchall()
        total = con.execute(
            "SELECT COUNT(*) FROM source_records WHERE source_record_id IN ('1342','99903')"
        ).fetchone()[0]
        con.close()

        self.assertEqual(total, 2)
        self.assertEqual(rows[0][1], rows[1][1])


if __name__ == "__main__":
    unittest.main()
