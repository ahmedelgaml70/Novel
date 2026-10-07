import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from scripts.validate_project_memory import validate, check_project, ROOT, DOMAINS


class QualityGateTests(unittest.TestCase):
    def setUp(self):
        def read(p): return json.loads((ROOT / p).read_text())
        ep = 'episodes/frankenstein-prototype/'
        self.records = [read(ep+'quality_review.json'), read(ep+'scene_manifest.json'),
                        read(ep+'item_inventory.json'), read('docs/memory/lessons.json'),
                        read('docs/memory/experiments.json')]

    def test_current_records_are_valid_but_quality_is_not_approved(self):
        self.assertEqual(check_project(), [])
        errors = check_project(strict=True)
        self.assertTrue(any('Q003' in e for e in errors))
        self.assertTrue(any('style is unapproved' in e for e in errors))

    def test_resolution_label_without_reviews_is_rejected_even_in_normal_mode(self):
        records = copy.deepcopy(self.records)
        records[0]['defects'][0]['status'] = 'RESOLVED'
        errors = validate(ROOT, *records)
        self.assertTrue(any('every affected shot' in e for e in errors))

    def test_shot_cannot_approve_over_open_defects(self):
        records = copy.deepcopy(self.records)
        records[0]['shots'][0]['status'] = 'APPROVED'
        errors = validate(ROOT, *records)
        self.assertTrue(any('unresolved defects' in e for e in errors))

    def test_diagnostics_and_stale_hashes_cannot_be_human_approval(self):
        from scripts.validate_project_memory import evidence_errors
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); (root/'frame.png').write_bytes(b'frame')
            ev = dict(path='frame.png', sha256='bad', shot_id='shot', reviewed_at='2026-10-07',
                      reviewer='auto renderer', reviewer_type='AUTOMATED', verdict='APPROVED')
            errors = evidence_errors(root, [ev], {'shot'})
            self.assertIn('stale evidence hash', errors)
            self.assertTrue(any('human approval' in e for e in errors))

    def test_complete_review_fixture_can_pass_strict_gate(self):
        # Synthetic fixture tests schema behavior, never approves project art.
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); (root/'review.txt').write_text('Synthetic test fixture')
            digest = hashlib.sha256((root/'review.txt').read_bytes()).hexdigest()
            ev = dict(path='review.txt', sha256=digest, shot_id='s', reviewed_at='2026-10-07',
                      reviewer='Fixture reviewer', reviewer_type='HUMAN', verdict='APPROVED')
            review = dict(baseline_verdict='USER_REJECTED', defects=[dict(id='D', status='RESOLVED',
                          shot_ids=['s'], item_ids=['i'], finding='f', repair='r', acceptance='a',
                          evidence_origin='test', review_evidence=[ev])],
                          shots=[dict(shot_id='s', status='APPROVED', motion_policy='ACTION_REVIEWED',
                          required_reviews=sorted(DOMAINS), review_evidence=[dict(ev, domain=d) for d in DOMAINS])],
                          style=dict(status='APPROVED', direction='fixture', evidence=[ev]))
            lessons = dict(lessons=[dict(id='L', trigger='t', action='a', scope='test',
                           classification='USER_REQUIREMENT', evidence=['review.txt#D'])])
            experiments = dict(current_experiment_id='E', experiments=[dict(id='E', defect_ids=['D'], hypothesis='h',
                               alternatives=['a'], change='c', result='PASS', checks=['test'], limitations='l', next='n',
                               implementation_evidence=[dict(path='review.txt', sha256=digest)])])
            self.assertEqual(validate(root, review, {'shots':[{'id':'s'}]},
                                     {'items':[{'id':'i'}]}, lessons, experiments, True), [])

    def test_changed_implementation_requires_updated_experiment_memory(self):
        records = copy.deepcopy(self.records)
        records[-1]['experiments'][-1]['implementation_evidence'][0]['sha256'] = 'stale'
        errors = validate(ROOT, *records)
        self.assertTrue(any('without updating current experiment memory' in e for e in errors))
