#!/usr/bin/env python3
"""Validate atomic production governance records.

Default mode checks structure/references.
--strict-final is a publication/lock gate and is expected to fail for the current V5.3 prototype.
"""
from __future__ import annotations
import argparse, hashlib, json, math, sys
from pathlib import Path

REQUIREMENT_FIELDS=("story","period","visual","motion","continuity","technical","rights")
FINAL_REQUIRED={"HERO","PRIMARY"}

def load(p):
    with p.open("r",encoding="utf-8") as f:
        return json.load(f)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--episode",default="episodes/frankenstein-prototype")
    ap.add_argument("--strict-final",action="store_true")
    args=ap.parse_args()
    root=Path(__file__).resolve().parents[1]
    ep=root/args.episode
    errors=[]

    required=("scene_manifest.json","item_inventory.json","source_registry.json","asset_decisions.json","VERSION_LOG.md")
    for name in required:
        if not (ep/name).exists():
            errors.append(f"missing {ep/name}")
    if errors:
        print("\n".join("ERROR: "+e for e in errors)); return 2

    manifest=load(ep/"scene_manifest.json")
    inv=load(ep/"item_inventory.json")
    sr=load(ep/"source_registry.json")
    dec=load(ep/"asset_decisions.json")

    shots=manifest["shots"]
    shot_ids={s["id"] for s in shots}
    items=inv["items"]; sources=sr["sources"]; decisions=dec["decisions"]
    if inv.get("method_version")!=dec.get("method_version"):
        errors.append("inventory and decision method versions differ")
    if inv.get("counts",{}).get("items",len(items))!=len(items):
        errors.append("inventory count metadata differs from records")
    if dec.get("counts",{}).get("decisions",len(decisions))!=len(decisions):
        errors.append("decision count metadata differs from records")
    item_map={}; source_map={}; decision_map={}

    runtime=sum(float(s["duration"]) for s in shots)
    target=float(manifest["film"]["runtime_seconds"])
    if abs(runtime-target)>1e-6:
        errors.append(f"manifest runtime mismatch {runtime} vs {target}")

    for it in items:
        iid=it.get("id")
        if iid in item_map: errors.append(f"duplicate item id {iid}")
        item_map[iid]=it
        if not it.get("purpose"): errors.append(f"item {iid} has no purpose")
        if it.get("importance") not in {"HERO","PRIMARY","SUPPORT","ATMOSPHERIC"}:
            errors.append(f"item {iid} has invalid importance")
        for sh in it.get("shot_ids",[]):
            if sh not in shot_ids: errors.append(f"item {iid} references unknown shot {sh}")
        req=it.get("requirements",{})
        for field in REQUIREMENT_FIELDS:
            if field not in req or not isinstance(req[field],list) or not req[field]:
                errors.append(f"item {iid} missing/non-detailed requirements.{field}")

    for s in sources:
        sid=s.get("id")
        if sid in source_map: errors.append(f"duplicate source id {sid}")
        source_map[sid]=s
        if not str(s.get("url","")).startswith(("http://","https://")):
            errors.append(f"source {sid} invalid url")
        rights=s.get("rights",{})
        if not rights.get("status") or not rights.get("commercial_asset_use"):
            errors.append(f"source {sid} missing rights status/use")
        for iid in s.get("supports_item_ids",[]):
            if iid not in item_map: errors.append(f"source {sid} references unknown item {iid}")

    for it in items:
        for sid in it.get("source_ids",[]):
            if sid not in source_map: errors.append(f"item {it['id']} references unknown source {sid}")

    for d in decisions:
        did=d.get("id")
        if did in decision_map: errors.append(f"duplicate decision id {did}")
        decision_map[did]=d
        iid=d.get("item_id")
        if iid not in item_map: errors.append(f"decision {did} unknown item {iid}")
        candidate_ids=set()
        for c in d.get("candidates",[]):
            cid=c.get("candidate_id")
            if cid in candidate_ids: errors.append(f"decision {did} duplicate candidate {cid}")
            candidate_ids.add(cid)
            for sid in c.get("source_ids",[]):
                if sid not in source_map: errors.append(f"candidate {cid} unknown source {sid}")
        sel=d.get("selected_candidate_id")
        if sel is not None and sel not in candidate_ids:
            errors.append(f"decision {did} selected candidate {sel} is not listed")

    for it in items:
        did=it.get("decision_id")
        if did not in decision_map:
            errors.append(f"item {it['id']} missing decision {did}")
        elif decision_map[did].get("item_id")!=it["id"]:
            errors.append(f"item {it['id']} points to wrong decision")

    covered={s:0 for s in shot_ids}
    for it in items:
        for sh in it["shot_ids"]: covered[sh]+=1
    for sh,n in covered.items():
        if n==0: errors.append(f"shot {sh} has zero Items")

    if args.strict_final:
        for it in items:
            if it.get("active",True) is False:
                continue
            d=decision_map.get(it.get("decision_id"))
            if not d:
                continue
            iid=it["id"]
            if it["status"]!="FINAL_APPROVED":
                errors.append(f"strict final: {iid} is {it['status']}, not FINAL_APPROVED")
            if not d.get("requirements_locked_before_search"):
                errors.append(f"strict final: {iid} requirements were not locked before search")
            selected=d.get("selected_candidate_id")
            cand=next((c for c in d.get("candidates",[]) if c.get("candidate_id")==selected),None) if selected else None
            if not cand:
                errors.append(f"strict final: {iid} has no selected candidate")
                continue
            if it["importance"] in FINAL_REQUIRED:
                candidates=d.get("candidates",[])
                origins={sid for c in candidates for sid in c.get("source_ids",[])}
                bespoke=cand.get("origin","").startswith(("BESPOKE","PROCEDURAL"))
                compared=len(candidates)>=3 and (len(origins)>=2 or bespoke)
                if not compared:
                    errors.append(f"strict final: {iid} insufficient candidate/source comparison")
            scores=cand.get("scores",{})
            for key in ("story_specificity","period_fit","style_fit","rights_confidence","shot_fit"):
                val=scores.get(key)
                if isinstance(val,bool) or not isinstance(val,(int,float)) or not math.isfinite(val) or not 8<=val<=10:
                    errors.append(f"strict final: {iid} missing/invalid critical score {key}: {val}")
            if cand.get("status")!="FINAL_APPROVED":
                errors.append(f"strict final: {iid} candidate is not FINAL_APPROVED")
            if not cand.get("source_ids") and not cand.get("origin","").startswith(("BESPOKE","PROCEDURAL")):
                errors.append(f"strict final: {iid} external asset has no source provenance")
            evidence=d.get("review_evidence",[])
            if not evidence:
                errors.append(f"strict final: {iid} has no reviewed shot/audio evidence")
            for ev in evidence:
                relative=Path(ev.get("path","")); target=(root/relative).resolve()
                safe=not relative.is_absolute() and root.resolve() in target.parents
                if not safe or not target.is_file():
                    errors.append(f"strict final: {iid} missing/unsafe evidence file")
                    continue
                if ev.get("sha256")!=hashlib.sha256(target.read_bytes()).hexdigest():
                    errors.append(f"strict final: {iid} review evidence hash differs")
                if ev.get("verdict")!="APPROVED" or not ev.get("reviewed_at") or ev.get("shot_id") not in shot_ids:
                    errors.append(f"strict final: {iid} review is not dated, approved and bound to a real shot")
            if len(it.get("shot_ids",[]))>1 and not d.get("continuity_evidence"):
                errors.append(f"strict final: {iid} has no recurring-shot continuity review")

    if errors:
        print("\n".join("ERROR: "+e for e in errors))
        print(f"FAILED with {len(errors)} error(s)")
        return 2

    print(f"OK: {len(items)} items, {len(sources)} sources, {len(decisions)} decisions, {len(shot_ids)} shots")
    print("STRICT FINAL GATE: PASS" if args.strict_final else "STRUCTURAL GATE: PASS (this does not imply final asset approval)")
    return 0

if __name__=="__main__":
    sys.exit(main())
