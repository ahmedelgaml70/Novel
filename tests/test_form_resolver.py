import importlib.util
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "form_resolver", ROOT / "scripts" / "form_resolver.py"
)
resolver = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(resolver)


class FormResolverTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / "scout.sqlite3"
        self.config = resolver.load_config(ROOT / "config" / "library_miner.json")
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
        rows = [
            ("gutenberg", "1", "Novel A", "novel a", '["Author A"]', "author a", '["en"]', "2000", "g-a", "Text"),
            ("gutenberg", "2", "Novel A", "novel a", '["Author A"]', "author a", '["en"]', "2001", "g-a", "Text"),
            ("gutenberg", "3", "Book B", "book b", '["Author B"]', "author b", '["en"]', "2000", "g-b", "Text"),
            ("gutenberg", "4", "Book C", "book c", '["Author C"]', "author c", '["en"]', "2000", "g-c", "Text"),
            ("gutenberg", "5", "Book D", "book d", '["Author D"]', "author d", '["en"]', "2000", "g-d", "Text"),
            ("gutenberg", "6", "Audio E", "audio e", '["Author E"]', "author e", '["en"]', "2000", "g-e", "Sound"),
        ]
        con.executemany(
            "INSERT INTO source_records VALUES(?,?,?,?,?,?,?,?,?,?)", rows
        )
        con.commit()
        con.close()
        resolver.materialize(self.db)

    def tearDown(self):
        self.tmp.cleanup()

    def add(self, source_id, value, provider, key, level="bibliographic"):
        con = resolver.open_db(self.db)
        resolver.add_evidence(
            con,
            {
                "source_system": "gutenberg",
                "source_record_id": source_id,
                "claim_key": "literary_form",
                "claim_value": value,
                "provider": provider,
                "authority_level": level,
                "independence_key": key,
                "source_locator": f"fixture://{key}",
            },
        )
        con.commit()
        con.close()

    def state_for_source(self, source_id):
        con = resolver.open_db(self.db)
        row = con.execute(
            """
            SELECT w.form_status, w.form_confidence, w.form_reason
            FROM edition_sources e JOIN works w ON w.work_id=e.work_id
            WHERE e.source_system='gutenberg' AND e.source_record_id=?
            """,
            (source_id,),
        ).fetchone()
        con.close()
        return tuple(row)

    def test_materialize_keeps_work_and_editions_separate(self):
        con = resolver.open_db(self.db)
        works = con.execute("SELECT COUNT(*) FROM works").fetchone()[0]
        editions = con.execute("SELECT COUNT(*) FROM edition_sources").fetchone()[0]
        a_work_ids = {
            r[0]
            for r in con.execute(
                "SELECT work_id FROM edition_sources WHERE source_record_id IN ('1','2')"
            )
        }
        con.close()
        self.assertEqual(works, 4)
        self.assertEqual(editions, 5)
        self.assertEqual(len(a_work_ids), 1)

    def test_two_independent_good_sources_are_required(self):
        self.add("1", "novel", "Fixture A", "fixture-a")
        resolver.resolve_all(self.db, self.config)
        self.assertEqual(self.state_for_source("1")[0], "UNKNOWN")

        self.add("1", "novel", "Fixture B", "fixture-b")
        resolver.resolve_all(self.db, self.config)
        state = self.state_for_source("1")
        self.assertEqual(state[0], "NOVEL")
        self.assertEqual(state[1], "high")

    def test_duplicate_claim_from_same_independence_key_does_not_double_count(self):
        self.add("3", "novel", "Fixture A", "same-key")
        self.add("3", "novel", "Fixture B", "same-key")
        resolver.resolve_all(self.db, self.config)
        self.assertEqual(self.state_for_source("3")[0], "UNKNOWN")

    def test_conflicting_good_evidence_becomes_disputed(self):
        self.add("4", "novel", "Fixture A", "fixture-a")
        self.add("4", "novella", "Fixture B", "fixture-b")
        resolver.resolve_all(self.db, self.config)
        self.assertEqual(self.state_for_source("4")[0], "DISPUTED")

    def test_two_novella_sources_resolve_to_novella_not_novel(self):
        self.add("5", "novella", "Fixture A", "fixture-a")
        self.add("5", "novella", "Fixture B", "fixture-b")
        resolver.resolve_all(self.db, self.config)
        self.assertEqual(self.state_for_source("5")[0], "NOVELLA")


if __name__ == "__main__":
    unittest.main()
