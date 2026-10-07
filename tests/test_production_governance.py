import subprocess, sys, unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"scripts/validate_production_records.py"
EP="episodes/frankenstein-prototype"

class ProductionGovernanceTests(unittest.TestCase):
    def run_validator(self,*extra):
        return subprocess.run([sys.executable,str(SCRIPT),"--episode",EP,*extra],cwd=ROOT,text=True,capture_output=True)

    def test_frankenstein_records_are_structurally_valid(self):
        r=self.run_validator()
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        self.assertIn("62 items",r.stdout)
        self.assertIn("13 sources",r.stdout)
        self.assertIn("13 source obligations",r.stdout)

    def test_current_prototype_is_not_falsely_final(self):
        r=self.run_validator("--strict-final","--max-detail","5")
        self.assertNotEqual(r.returncode,0)
        self.assertIn("BLOCKER SUMMARY",r.stdout)
        self.assertIn("source_fidelity",r.stdout)

if __name__=="__main__": unittest.main()
