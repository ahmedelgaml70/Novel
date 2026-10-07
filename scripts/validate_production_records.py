#!/usr/bin/env python3
"""Validate atomic production governance records.

Default mode checks structural integrity, source traceability, candidate links,
and literary-source obligations.

--strict-final is the publication/shot-lock gate. It is expected to fail for
the current V5.1 prototype until every required Item and source obligation is
resolved.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

REQUIREMENT_FIELDS=("story","period","visual","motion","continuity","technical","rights")
FINAL_REQUIRED={"HERO","PRIMARY"}
UNRESOLVED_OBLIGATION_STATES={
    "MISSING_FROM_CURRENT_RENDER",
    "MISSING_OR_WEAK",
    "NEEDS_REVALIDATION",
    "NOT_DIRECTLY_REPRESENTED",
    "MOSTLY_NOT_EXPLICIT",
}

def load(p):
    with p.open("r",encoding="utf-8") as f:
        return json.load(f)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--episode",default="episodes/frankenstein-prototype")
    ap.add_argument("--strict-final",action="store_true")
    ap.add_argument("--max-detail",type=int,default=30)
    args=ap.parse_args()

    root=Path(__file__).resolve().parents[1]
    ep=root/args.episode
    errors=[]

    def err(kind,msg):
        errors.append((kind,msg))

    required=(
        "scene_manifest.json",
        "item_inventory.json",
        "source_registry.json",
        "source_obligations.json",
        "asset_decisions.json",
        "VERSION_LOG.md",
    )
    for name in required:
        if not (ep/name).exists():
            err("structural",f"missing {ep/name}")
    if errors:
        for kind,msg in errors:
            print(f"ERROR[{kind}]: {msg}")
        return 2

    manifest=load(ep/"scene_manifest.json")
    inv=load(ep/"item_inventory.json")
    sr=load(ep/"source_registry.json")
    obl=load(ep/"source_obligations.json")
    dec=load(ep/"asset_decisions.json")

    shots=manifest["shots"]
    shot_ids={s["id"] for s in shots}
    items=inv["items"]
    sources=sr["sources"]
    obligations=obl["obligations"]
    decisions=dec["decisions"]

    item_map={}
    source_map={}
    obligation_map={}
    decision_map={}

    runtime=sum(float(s["duration"]) for s in shots)
    target=float(manifest["film"]["runtime_seconds"])
    if abs(runtime-target)>1e-6:
        err("structural",f"manifest runtime mismatch {runtime} vs {target}")

    for it in items:
        iid=it.get("id")
        if iid in item_map:
            err("structural",f"duplicate item id {iid}")
        item_map[iid]=it
        if not it.get("purpose"):
            err("structural",f"item {iid} has no purpose")
        if it.get("importance") not in {"HERO","PRIMARY","SUPPORT","ATMOSPHERIC"}:
            err("structural",f"item {iid} has invalid importance")
        for sh in it.get("shot_ids",[]):
            if sh not in shot_ids:
                err("structural",f"item {iid} references unknown shot {sh}")
        req=it.get("requirements",{})
        for field in REQUIREMENT_FIELDS:
            if field not in req or not isinstance(req[field],list) or not req[field]:
                err("requirements",f"item {iid} missing/non-detailed requirements.{field}")

    for s in sources:
        sid=s.get("id")
        if sid in source_map:
            err("structural",f"duplicate source id {sid}")
        source_map[sid]=s
        if not str(s.get("url","")).startswith(("http://","https://")):
            err("source",f"source {sid} invalid url")
        rights=s.get("rights",{})
        if not rights.get("status") or not rights.get("commercial_asset_use"):
            err("rights",f"source {sid} missing rights status/use")
        for iid in s.get("supports_item_ids",[]):
            if iid not in item_map:
                err("source",f"source {sid} references unknown item {iid}")

    contract=obl.get("source_contract",{})
    candidate_source_ids=contract.get("candidate_source_ids",[])
    for sid in candidate_source_ids:
        if sid not in source_map:
            err("source_contract",f"source contract references unknown candidate source {sid}")
    selected_source_id=contract.get("selected_source_id")
    if selected_source_id is not None and selected_source_id not in candidate_source_ids:
        err("source_contract",f"selected source {selected_source_id} is not in candidate_source_ids")
    if contract.get("mode")!="BEST_FIT_REVISABLE":
        err("source_contract","source contract mode must be BEST_FIT_REVISABLE")

    for o in obligations:
        oid=o.get("id")
        if oid in obligation_map:
            err("source_fidelity",f"duplicate source obligation id {oid}")
        obligation_map[oid]=o
        if not o.get("fact") or not o.get("decision"):
            err("source_fidelity",f"obligation {oid} missing fact/decision")
        for sid in o.get("source_ids",[]):
            if sid not in source_map:
                err("source_fidelity",f"obligation {oid} references unknown source {sid}")
        for sh in o.get("shot_ids",[]):
            if sh not in shot_ids:
                err("source_fidelity",f"obligation {oid} references unknown shot {sh}")
        for iid in o.get("item_ids",[]):
            if iid not in item_map:
                err("source_fidelity",f"obligation {oid} references unknown item {iid}")

    expected_links=defaultdict(set)
    for o in obligations:
        for iid in o.get("item_ids",[]):
            expected_links[iid].add(o["id"])

    for iid,oids in expected_links.items():
        actual=set(item_map[iid].get("source_obligation_ids",[]))
        missing=oids-actual
        if missing:
            err("source_fidelity",f"item {iid} missing source_obligation_ids {sorted(missing)}")

    for it in items:
        iid=it["id"]
        for oid in it.get("source_obligation_ids",[]):
            if oid not in obligation_map:
                err("source_fidelity",f"item {iid} references unknown source obligation {oid}")
            elif iid not in obligation_map[oid].get("item_ids",[]):
                err("source_fidelity",f"item {iid} links obligation {oid}, but obligation does not link back")
        for sid in it.get("source_ids",[]):
            if sid not in source_map:
                err("source",f"item {iid} references unknown source {sid}")

    for d in decisions:
        did=d.get("id")
        if did in decision_map:
            err("structural",f"duplicate decision id {did}")
        decision_map[did]=d
        iid=d.get("item_id")
        if iid not in item_map:
            err("structural",f"decision {did} unknown item {iid}")
        candidate_ids=set()
        for c in d.get("candidates",[]):
            cid=c.get("candidate_id")
            if cid in candidate_ids:
                err("comparison",f"decision {did} duplicate candidate {cid}")
            candidate_ids.add(cid)
            for sid in c.get("source_ids",[]):
                if sid not in source_map:
                    err("source",f"candidate {cid} unknown source {sid}")
        sel=d.get("selected_candidate_id")
        if sel is not None and sel not in candidate_ids:
            err("selection",f"decision {did} selected candidate {sel} is not listed")

    for it in items:
        did=it.get("decision_id")
        if did not in decision_map:
            err("structural",f"item {it['id']} missing decision {did}")
        elif decision_map[did].get("item_id")!=it["id"]:
            err("structural",f"item {it['id']} points to wrong decision")

    covered={s:0 for s in shot_ids}
    for it in items:
        for sh in it["shot_ids"]:
            covered[sh]+=1
    for sh,n in covered.items():
        if n==0:
            err("structural",f"shot {sh} has zero Items")

    if args.strict_final:
        for it in items:
            if it["importance"] not in FINAL_REQUIRED:
                continue
            iid=it["id"]
            d=decision_map[it["decision_id"]]
            if it["status"]!="FINAL_APPROVED":
                err("item_state",f"{iid}: {it['status']} != FINAL_APPROVED")
            if not d.get("requirements_locked_before_search"):
                err("requirements",f"{iid}: requirements were not locked before search")
            if not d.get("selected_candidate_id"):
                err("selection",f"{iid}: no selected candidate")
            if it["importance"]=="HERO" and len(d.get("candidates",[]))<2:
                err("comparison",f"{iid}: HERO has insufficient documented comparison")
            selected=d.get("selected_candidate_id")
            if selected:
                cand=next((c for c in d.get("candidates",[]) if c.get("candidate_id")==selected),None)
                if cand:
                    scores=cand.get("scores",{})
                    for key in ("story_specificity","period_fit","style_fit","rights_confidence"):
                        if key in scores and scores[key]<8:
                            err("hard_gate",f"{iid}: selected candidate fails {key}={scores[key]}")

        if contract.get("status")!="LOCKED" or not selected_source_id:
            err("source_contract","final master requires a deliberately LOCKED source contract with a selected source")
        else:
            for o in obligations:
                applicability=o.get("applicability",{})
                sources=set(applicability.get("source_ids") or o.get("source_ids",[]))
                applies=(applicability.get("type")=="COMMON_ACROSS_CANDIDATES" or selected_source_id in sources)
                if not applies:
                    continue
                state=o.get("current_treatment","")
                if o.get("importance")=="HERO" and state in UNRESOLVED_OBLIGATION_STATES:
                    err("source_fidelity",f"{o['id']}: unresolved HERO obligation for selected source ({state})")
                if "CONTRADICTION" in state:
                    err("source_fidelity",f"{o['id']}: explicit source contradiction")

    if errors:
        detail=max(0,args.max_detail)
        for kind,msg in errors[:detail]:
            print(f"ERROR[{kind}]: {msg}")
        if len(errors)>detail:
            print(f"... {len(errors)-detail} additional blocker(s) omitted from detail output")
        counts=Counter(kind for kind,_ in errors)
        print("BLOCKER SUMMARY: "+", ".join(f"{k}={v}" for k,v in sorted(counts.items())))
        print(f"FAILED with {len(errors)} error(s)")
        return 2

    print(
        f"OK: {len(items)} items, {len(sources)} sources, "
        f"{len(obligations)} source obligations, {len(decisions)} decisions, {len(shot_ids)} shots"
    )
    print("STRICT FINAL GATE: PASS" if args.strict_final else
          "STRUCTURAL GATE: PASS (this does not imply final asset approval)")
    return 0

if __name__=="__main__":
    sys.exit(main())
