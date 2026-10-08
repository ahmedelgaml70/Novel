import subprocess, sys, unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"scripts/validate_production_records.py"

class ProductionGovernanceTests(unittest.TestCase):
    def run_validator(self,*args):
        return subprocess.run(
            [sys.executable,str(SCRIPT),*args],
            cwd=ROOT,text=True,capture_output=True
        )

    def test_frankenstein_records_are_structurally_valid(self):
        p=self.run_validator()
        self.assertEqual(p.returncode,0,p.stdout+"\n"+p.stderr)
        self.assertIn("67 items",p.stdout)
        self.assertIn("59 active",p.stdout)
        self.assertIn("8 inactive-history",p.stdout)
        self.assertIn("14 sources",p.stdout)
        self.assertIn("14 source obligations",p.stdout)
        self.assertIn("22 reusable lessons",p.stdout)
        self.assertIn("STRUCTURAL GATE: PASS",p.stdout)

    def test_source_contract_is_revisable_and_not_preselected(self):
        import json
        contract=json.loads((ROOT/"episodes/frankenstein-prototype/source_contract.json").read_text())
        self.assertEqual(contract["mode"],"BEST_FIT_REVISABLE")
        self.assertEqual(contract["status"],"OPEN")
        self.assertIsNone(contract["selected_source_id"])
        self.assertGreaterEqual(len(contract["candidates"]),2)

    def test_temporal_context_separates_time_layers(self):
        import json
        tc=json.loads((ROOT/"episodes/frankenstein-prototype/temporal_context.json").read_text())
        self.assertIn("diegetic_story_time",tc["layers"])
        self.assertIn("publication_and_edition_time",tc["layers"])
        self.assertIn("visual_reference_time",tc["layers"])
        self.assertEqual(tc["status"],"OPEN_REVISABLE")

    def test_current_prototype_is_not_falsely_final(self):
        p=self.run_validator("--strict-final","--max-detail","5")
        self.assertNotEqual(p.returncode,0)
        self.assertIn("BLOCKER SUMMARY",p.stdout)
        self.assertIn("source_contract",p.stdout)
        self.assertIn("quality=",p.stdout)

if __name__=="__main__":
    unittest.main()
