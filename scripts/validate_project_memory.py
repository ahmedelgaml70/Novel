#!/usr/bin/env python3
"""Validate project learning records and the independent shot quality gate.

Evidence integrity checks cannot judge whether a human review was competent.
"""
import argparse
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOMAINS = {'readability', 'anatomy', 'motion', 'physics', 'continuity', 'style', 'audio'}


def evidence_errors(root, evidence, shot_ids, require_domain=False):
    errors = []
    for ev in evidence:
        relative = Path(ev.get('path', ''))
        target = (root / relative).resolve()
        if relative.is_absolute() or root.resolve() not in target.parents or not target.is_file():
            errors.append('missing or unsafe evidence file')
        elif hashlib.sha256(target.read_bytes()).hexdigest() != ev.get('sha256'):
            errors.append('stale evidence hash')
        try:
            datetime.date.fromisoformat(ev.get('reviewed_at', '')[:10])
        except (ValueError, TypeError):
            errors.append('missing/invalid review date')
        if ev.get('verdict') != 'APPROVED' or not str(ev.get('reviewer', '')).strip() or ev.get('reviewer_type') != 'HUMAN':
            errors.append('human approval is required; diagnostics cannot approve quality')
        if ev.get('shot_id') not in shot_ids:
            errors.append('evidence is not bound to an affected shot')
        if require_domain and ev.get('domain') not in DOMAINS:
            errors.append('unknown/missing review domain')
    return errors


def validate(root, review, manifest, inventory, lessons, experiments, strict=False):
    errors = []
    shot_ids = {s['id'] for s in manifest['shots']}
    item_ids = {i['id'] for i in inventory['items']}
    defects = review.get('defects', [])
    defect_ids = [d['id'] for d in defects]
    if len(set(defect_ids)) != len(defect_ids) or not defects:
        errors.append('missing or duplicate defects')
    if review.get('baseline_verdict') != 'USER_REJECTED':
        errors.append('preserve the V5.3 user rejection in history')
    for d in defects:
        if d.get('status') not in {'OPEN', 'REPAIR_IMPLEMENTED', 'RESOLVED'}:
            errors.append(f"{d['id']}: invalid defect status")
        if not d.get('shot_ids') or not set(d['shot_ids']) <= shot_ids:
            errors.append(f"{d['id']}: unknown/missing shot")
        if not d.get('item_ids') or not set(d['item_ids']) <= item_ids:
            errors.append(f"{d['id']}: unknown/missing item")
        for key in ['finding', 'repair', 'acceptance', 'evidence_origin']:
            if not d.get(key): errors.append(f"{d['id']}: missing {key}")
        if d.get('status') == 'RESOLVED':
            ev = d.get('review_evidence', [])
            errors += [f"{d['id']}: {e}" for e in evidence_errors(root, ev, set(d['shot_ids']))]
            if {e.get('shot_id') for e in ev} != set(d['shot_ids']):
                errors.append(f"{d['id']}: resolution needs review for every affected shot")
        elif strict:
            errors.append(f"quality gate: {d['id']} {d['status']}: {d['title']}")
    shots = review.get('shots', [])
    if len(shots) != len(shot_ids) or {s.get('shot_id') for s in shots} != shot_ids:
        errors.append('quality reviews must cover each shot exactly once')
    for sh in shots:
        if set(sh.get('required_reviews', [])) != DOMAINS:
            errors.append(f"{sh['shot_id']}: missing required review domains")
        if sh.get('status') == 'APPROVED':
            if any(d['status'] != 'RESOLVED' and sh['shot_id'] in d['shot_ids'] for d in defects):
                errors.append(f"{sh['shot_id']}: cannot approve a shot with unresolved defects")
            ev = sh.get('review_evidence', [])
            errors += [f"{sh['shot_id']}: {e}" for e in evidence_errors(root, ev, {sh['shot_id']}, True)]
            if {e.get('domain') for e in ev} != DOMAINS:
                errors.append(f"{sh['shot_id']}: incomplete review domains")
            if sh.get('motion_policy') not in {'ACTION_REVIEWED', 'JUSTIFIED_STILLNESS'}:
                errors.append(f"{sh['shot_id']}: action/stillness must be reviewed")
            if sh.get('motion_policy') == 'JUSTIFIED_STILLNESS' and not sh.get('stillness_reason'):
                errors.append(f"{sh['shot_id']}: stillness needs a narrative reason")
        elif strict:
            errors.append(f"quality gate: shot {sh['shot_id']} is not APPROVED")
    style = review.get('style', {})
    if style.get('status') == 'APPROVED':
        ev = style.get('evidence', [])
        errors += evidence_errors(root, ev, shot_ids)
        if not ev or style.get('direction') in {None, '', 'UNDECIDED'}:
            errors.append('style needs an actual direction and reviewed evidence')
    elif strict:
        errors.append('quality gate: style is unapproved; redesign required')
    entries = lessons.get('lessons', [])
    ids = [l['id'] for l in entries]
    if len(ids) != len(set(ids)) or not entries: errors.append('missing or duplicate lessons')
    referenced = set()
    for lesson in entries:
        for field in ['trigger', 'action', 'scope', 'classification', 'evidence']:
            if not lesson.get(field): errors.append(f"{lesson['id']}: missing {field}")
        for ref in lesson.get('evidence', []):
            filename, _, fragment = ref.partition('#')
            relative = Path(filename); target = (root / relative).resolve()
            if relative.is_absolute() or root.resolve() not in target.parents or not target.is_file() or fragment not in defect_ids:
                errors.append(f"{lesson['id']}: invalid lesson evidence")
            referenced.add(fragment)
    if not set(defect_ids) <= referenced: errors.append('each defect needs a persistent lesson')
    exps = experiments.get('experiments', [])
    if not exps or len({e['id'] for e in exps}) != len(exps): errors.append('missing or duplicate experiments')
    for exp in exps:
        for field in ['hypothesis', 'alternatives', 'change', 'result', 'limitations', 'next']:
            if not exp.get(field): errors.append(f"{exp['id']}: missing {field}")
        if not set(exp.get('defect_ids', [])) <= set(defect_ids): errors.append('experiment refers to unknown defect')
        if exp.get('result') != 'PENDING_VERIFICATION' and not exp.get('checks'):
            errors.append(f"{exp['id']}: outcome needs actual checks")
    current = next((e for e in exps if e['id'] == experiments.get('current_experiment_id')), None)
    if not current or not current.get('implementation_evidence'):
        errors.append('current experiment needs implementation evidence')
    else:
        for ev in current['implementation_evidence']:
            relative = Path(ev.get('path', '')); target = (root / relative).resolve()
            if relative.is_absolute() or root.resolve() not in target.parents or not target.is_file():
                errors.append('missing/unsafe current experiment implementation')
            elif hashlib.sha256(target.read_bytes()).hexdigest() != ev.get('sha256'):
                errors.append('implementation changed without updating current experiment memory')
    return errors


def check_project(root=ROOT, episode='episodes/frankenstein-prototype', strict=False):
    def read(p): return json.loads((root / p).read_text())
    try:
        return validate(root, read(f'{episode}/quality_review.json'), read(f'{episode}/scene_manifest.json'),
                        read(f'{episode}/item_inventory.json'), read('docs/memory/lessons.json'),
                        read('docs/memory/experiments.json'), strict)
    except (OSError, ValueError, KeyError, TypeError) as e:
        return [f'Invalid/missing quality or memory records: {e}']


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--strict-final', action='store_true')
    args = ap.parse_args()
    failures = check_project(strict=args.strict_final)
    print('\n'.join('ERROR: ' + e for e in failures) if failures else 'PROJECT MEMORY STRUCTURE PASSED; this does not approve visual quality')
    raise SystemExit(2 if failures else 0)
