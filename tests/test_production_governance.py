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


class FinalApprovalEvidenceTests(unittest.TestCase):
    def test_labels_alone_cannot_approve_a_film(self):
        import json, tempfile
        with tempfile.TemporaryDirectory() as tmp:
            ep=Path(tmp)
            src=ROOT/'episodes/frankenstein-prototype'
            for name in ('scene_manifest.json','item_inventory.json','source_registry.json','asset_decisions.json','VERSION_LOG.md'):
                (ep/name).write_bytes((src/name).read_bytes())
            inv=json.loads((ep/'item_inventory.json').read_text())
            dec=json.loads((ep/'asset_decisions.json').read_text())
            for i in inv['items']:
                i['status']='FINAL_APPROVED'
            for d in dec['decisions']:
                d['requirements_locked_before_search']=True
                d['selected_candidate_id']='label-only'
                d['candidates']=[{'candidate_id':'label-only','origin':'BESPOKE_JS_RECONSTRUCTION','source_ids':[],'status':'FINAL_APPROVED','scores':{},'reason':'unverified label'}]
            (ep/'item_inventory.json').write_text(json.dumps(inv))
            (ep/'asset_decisions.json').write_text(json.dumps(dec))
            p=subprocess.run([sys.executable,str(ROOT/'scripts/validate_production_records.py'),'--episode',str(ep),'--strict-final'],cwd=ROOT,text=True,capture_output=True)
            self.assertNotEqual(p.returncode,0)
            self.assertIn('missing/invalid critical score',p.stdout)
            self.assertIn('no reviewed shot/audio evidence',p.stdout)
            self.assertIn('insufficient candidate/source comparison',p.stdout)

if __name__=="__main__":
    unittest.main()
