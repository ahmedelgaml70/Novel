import subprocess, sys, unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class ProductionGovernanceTests(unittest.TestCase):
    def test_frankenstein_records_are_structurally_valid(self):
        p=subprocess.run([sys.executable,str(ROOT/"scripts/validate_production_records.py")],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(p.returncode,0,p.stdout+"\n"+p.stderr)
        self.assertIn("STRUCTURAL GATE: PASS",p.stdout)

    def test_current_prototype_is_not_falsely_final(self):
        p=subprocess.run([sys.executable,str(ROOT/"scripts/validate_production_records.py"),"--strict-final"],cwd=ROOT,text=True,capture_output=True)
        self.assertNotEqual(p.returncode,0)
        self.assertIn("strict final:",p.stdout)

if __name__=="__main__":
    unittest.main()
