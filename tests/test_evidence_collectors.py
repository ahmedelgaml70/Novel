import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module

collector = load_module("evidence_collectors", ROOT / "scripts" / "evidence_collectors.py")
resolver = load_module("form_resolver_for_collectors", ROOT / "scripts" / "form_resolver.py")


class EvidenceCollectorTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / "scout.sqlite3"
        self.config = collector.load_config(ROOT / "config" / "library_miner.json")
        con = sqlite3.connect(self.db)
        con.execute(
            """
            CREATE TABLE source_records (
                source_system TEXT NOT NULL,
                source_record_id TEXT NOT NULL,
                title TEXT NOT NULL,
                normalized_title TEXT NOT NULL,
                authors_json TEXT NOT NULL,
                normalized_authors TEXT NOT NULL,
                languages_json TEXT NOT NULL,
                issued TEXT,
                identity_group TEXT NOT NULL,
                source_type TEXT
            )
            """
        )
        con.execute(
            "INSERT INTO source_records VALUES(?,?,?,?,?,?,?,?,?,?)",
            ("gutenberg","84","Frankenstein; Or, The Modern Prometheus",
             "frankenstein or the modern prometheus",
             '["Shelley, Mary Wollstonecraft, 1797-1851"]',
             "shelley mary wollstonecraft 1797 1851",
             '["en"]',"1993-10-01","g-frank","Text")
        )
        con.commit()
        con.close()
        resolver.materialize(self.db)
        self.work = collector.open_db(self.db).execute("SELECT * FROM works").fetchone()

    def tearDown(self):
        self.tmp.cleanup()

    def test_explicit_form_mapping_does_not_promote_generic_fiction(self):
        self.assertEqual(collector.explicit_form_claim("Novels"), "novel")
        self.assertEqual(collector.explicit_form_claim("Novellas"), "novella")
        self.assertEqual(collector.explicit_form_claim("Short stories"), "short_story_collection")
        self.assertIsNone(collector.explicit_form_claim("Gothic fiction"))
        self.assertIsNone(collector.explicit_form_claim("Science fiction"))

    def test_strong_match_requires_title_and_author(self):
        ok, basis = collector.strong_match(
            self.work,
            "Frankenstein; Or, The Modern Prometheus",
            ["Shelley, Mary Wollstonecraft, 1797-1851"],
        )
        self.assertTrue(ok)
        self.assertEqual(set(basis), {"exact_normalized_title", "compatible_author"})
        bad, _ = collector.strong_match(self.work, "Frankenstein", ["Somebody Else"])
        self.assertFalse(bad)

    def test_openlibrary_fixture_extracts_explicit_novel_evidence(self):
        body = (ROOT / "tests" / "fixtures" / "openlibrary_frankenstein.json").read_bytes()
        con = collector.open_db(self.db)
        result = collector.collect_openlibrary_for_work(
            con, self.work, self.config, body_override=body
        )
        row = con.execute(
            "SELECT claim_value, provider, independence_key FROM evidence"
        ).fetchone()
        con.close()
        self.assertEqual(result["evidence_items"], 1)
        self.assertEqual(tuple(row), ("novel", "openlibrary", "provider:openlibrary"))

    def test_loc_fixture_extracts_655_novel_evidence(self):
        body = (ROOT / "tests" / "fixtures" / "loc_frankenstein.xml").read_bytes()
        con = collector.open_db(self.db)
        result = collector.collect_loc_for_work(
            con, self.work, self.config, body_override=body
        )
        row = con.execute(
            "SELECT claim_value, provider, independence_key FROM evidence"
        ).fetchone()
        con.close()
        self.assertEqual(result["evidence_items"], 1)
        self.assertEqual(tuple(row), ("novel", "library_of_congress", "provider:library_of_congress"))

    def test_two_provider_evidence_resolves_novel(self):
        ol = (ROOT / "tests" / "fixtures" / "openlibrary_frankenstein.json").read_bytes()
        loc = (ROOT / "tests" / "fixtures" / "loc_frankenstein.xml").read_bytes()
        con = collector.open_db(self.db)
        collector.collect_openlibrary_for_work(con, self.work, self.config, body_override=ol)
        collector.collect_loc_for_work(con, self.work, self.config, body_override=loc)
        con.close()
        resolver.resolve_all(self.db, self.config)

        con = resolver.open_db(self.db)
        state = con.execute("SELECT form_status, form_confidence FROM works").fetchone()
        con.close()
        self.assertEqual(tuple(state), ("NOVEL", "high"))


if __name__ == "__main__":
    unittest.main()
