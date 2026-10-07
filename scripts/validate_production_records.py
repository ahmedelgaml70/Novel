#!/usr/bin/env python3
"""Validate atomic production governance records.

Default mode checks structure/references.
--strict-final is a publication/lock gate and is expected to fail for the current V5.1 prototype.
"""
from __future__ import annotations
import argparse, json, sys
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
            if it["importance"] not in FINAL_REQUIRED:
                continue
            d=decision_map[it["decision_id"]]
            if it["status"]!="FINAL_APPROVED":
                errors.append(f"strict final: {it['id']} is {it['status']}, not FINAL_APPROVED")
            if not d.get("requirements_locked_before_search"):
                errors.append(f"strict final: {it['id']} requirements were not locked before search")
            if not d.get("selected_candidate_id"):
                errors.append(f"strict final: {it['id']} has no selected candidate")
            if it["importance"]=="HERO" and len(d.get("candidates",[]))<2:
                errors.append(f"strict final: HERO {it['id']} has insufficient documented comparison")
            selected=d.get("selected_candidate_id")
            if selected:
                cand=next((c for c in d.get("candidates",[]) if c.get("candidate_id")==selected),None)
                if cand:
                    scores=cand.get("scores",{})
                    for key in ("story_specificity","period_fit","style_fit","rights_confidence"):
                        if key in scores and scores[key]<8:
                            errors.append(f"strict final: {it['id']} selected candidate fails {key}: {scores[key]}")

    if errors:
        print("\n".join("ERROR: "+e for e in errors))
        print(f"FAILED with {len(errors)} error(s)")
        return 2

    print(f"OK: {len(items)} items, {len(sources)} sources, {len(decisions)} decisions, {len(shot_ids)} shots")
    print("STRICT FINAL GATE: PASS" if args.strict_final else "STRUCTURAL GATE: PASS (this does not imply final asset approval)")
    return 0

if __name__=="__main__":
    sys.exit(main())
