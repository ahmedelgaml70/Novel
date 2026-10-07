#!/usr/bin/env python3
"""Validate Novel production governance records.

Default mode checks structure, referential integrity, source traceability, and
source-fidelity obligation links.

--strict-final additionally enforces final-approval rules. It reports blockers
by category so a prototype cannot look "almost final" merely because files are
present.
"""
from __future__ import annotations
import argparse, json, sys
from collections import Counter, defaultdict
from pathlib import Path

FINAL_STATES={"FINAL_APPROVED"}
VISIBLE_OR_AUDIO_CATEGORIES={
    "character","character_face","character_hair","character_hand","character_pose",
    "character_motion","creature_anatomy","creature_face","creature_hair",
    "costume","costume_drapery","architecture","environment","set_dressing",
    "hero_prop","support_prop","scientific_document","drapery","vfx","vfx_lighting",
    "lighting_composition","composition","global_material","global_lighting","global_style",
    "atmosphere","camera","transition","typography","audio_music_soundbed","audio_ambience",
    "audio_sfx","audio_foley","audio_character"
}
UNRESOLVED_OBLIGATION_STATES={
    "MISSING_FROM_CURRENT_RENDER","MISSING_OR_WEAK","NEEDS_REVALIDATION",
    "NOT_DIRECTLY_REPRESENTED","MOSTLY_NOT_EXPLICIT"
}

def load(path:Path):
    with path.open("r",encoding="utf-8") as f:
        return json.load(f)

def fail(errors,msg,kind="structural"):
    errors.append((kind,msg))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--episode",default="episodes/frankenstein-prototype")
    ap.add_argument("--strict-final",action="store_true")
    ap.add_argument("--max-detail",type=int,default=30,
                    help="Maximum individual error lines before grouped remainder summary")
    a=ap.parse_args()
    root=Path(__file__).resolve().parents[1]
    ep=root/a.episode
    errors=[]; warnings=[]
    req=["scene_manifest.json","item_inventory.json","source_registry.json","source_obligations.json",
         "asset_decisions.json","VERSION_LOG.md"]
    for name in req:
        if not (ep/name).exists(): fail(errors,f"missing {ep/name}")
    if errors:
        for _,e in errors: print("ERROR: "+e)
        return 2

    manifest=load(ep/"scene_manifest.json")
    inv=load(ep/"item_inventory.json")
    sr=load(ep/"source_registry.json")
    obl=load(ep/"source_obligations.json")
    dec=load(ep/"asset_decisions.json")
    shot_ids={s["id"] for s in manifest["shots"]}
    items=inv["items"]; sources=sr["sources"]; obligations=obl["obligations"]; decisions=dec["decisions"]
    item_map={}; source_map={}; obligation_map={}; decision_map={}

    for it in items:
        if it["id"] in item_map: fail(errors,f'duplicate item id {it["id"]}')
        item_map[it["id"]]=it
        for sh in it.get("shot_ids",[]):
            if sh not in shot_ids: fail(errors,f'item {it["id"]} references unknown shot {sh}')
        for field in ["story","period","visual","motion","continuity","technical","rights"]:
            if field not in it.get("requirements",{}): fail(errors,f'item {it["id"]} missing requirements.{field}')

    for s in sources:
        if s["id"] in source_map: fail(errors,f'duplicate source id {s["id"]}')
        source_map[s["id"]]=s
        if not s.get("url","").startswith(("http://","https://")): fail(errors,f'source {s["id"]} has invalid url')
        if not s.get("rights",{}).get("status"): fail(errors,f'source {s["id"]} missing rights.status')
        for iid in s.get("supports_item_ids",[]):
            if iid not in item_map: fail(errors,f'source {s["id"]} references unknown item {iid}')

    designated=obl.get("designated_source_id")
    if designated not in source_map:
        fail(errors,f"source_obligations designated_source_id {designated!r} is not in source_registry")

    for o in obligations:
        oid=o["id"]
        if oid in obligation_map: fail(errors,f"duplicate source obligation id {oid}")
        obligation_map[oid]=o
        for sh in o.get("shot_ids",[]):
            if sh not in shot_ids: fail(errors,f"obligation {oid} references unknown shot {sh}")
        for iid in o.get("item_ids",[]):
            if iid not in item_map: fail(errors,f"obligation {oid} references unknown item {iid}")

    expected_links=defaultdict(set)
    for o in obligations:
        for iid in o.get("item_ids",[]): expected_links[iid].add(o["id"])
    for iid,oids in expected_links.items():
        actual=set(item_map[iid].get("source_obligation_ids",[]))
        missing=oids-actual
        if missing: fail(errors,f"item {iid} missing source_obligation_ids {sorted(missing)}")
    for it in items:
        for oid in it.get("source_obligation_ids",[]):
            if oid not in obligation_map: fail(errors,f'item {it["id"]} references unknown source obligation {oid}')
            elif it["id"] not in obligation_map[oid].get("item_ids",[]):
                fail(errors,f'item {it["id"]} links obligation {oid}, but obligation does not link back')

    for it in items:
        for sid in it.get("source_ids",[]):
            if sid not in source_map: fail(errors,f'item {it["id"]} references unknown source {sid}')

    for d in decisions:
        if d["id"] in decision_map: fail(errors,f'duplicate decision id {d["id"]}')
        decision_map[d["id"]]=d
        if d["item_id"] not in item_map: fail(errors,f'decision {d["id"]} references unknown item {d["item_id"]}')
        cids=set()
        for c in d.get("candidates",[]):
            if c["candidate_id"] in cids: fail(errors,f'decision {d["id"]} duplicate candidate {c["candidate_id"]}')
            cids.add(c["candidate_id"])
            for sid in c.get("source_ids",[]):
                if sid not in source_map: fail(errors,f'candidate {c["candidate_id"]} references unknown source {sid}')
        sel=d.get("selected_candidate_id")
        if sel is not None and sel not in cids: fail(errors,f'decision {d["id"]} selected candidate {sel} is not listed')

    for it in items:
        did=it.get("decision_id")
        if did not in decision_map: fail(errors,f'item {it["id"]} missing decision record {did}')
        elif decision_map[did]["item_id"]!=it["id"]: fail(errors,f'item {it["id"]} decision points to wrong item')

    covered={sh:0 for sh in shot_ids}
    for it in items:
        for sh in it.get("shot_ids",[]): covered[sh]+=1
    for sh,n in covered.items():
        if not n: fail(errors,f"shot {sh} has zero item records")

    if a.strict_final:
        for it in items:
            if it["importance"] in {"HERO","PRIMARY"} and it["category"] in VISIBLE_OR_AUDIO_CATEGORIES:
                iid=it["id"]; d=decision_map[it["decision_id"]]
                if it["status"] not in FINAL_STATES:
                    fail(errors,f'{iid}: state={it["status"]}; requires FINAL_APPROVED',"item_state")
                if not d.get("selected_candidate_id"):
                    fail(errors,f"{iid}: no selected candidate","selection")
                if it["importance"]=="HERO" and len(d.get("candidates",[]))<2:
                    fail(errors,f"{iid}: HERO has fewer than 2 candidate/alternative records","comparison")
                if not d.get("requirements_locked_before_search"):
                    fail(errors,f"{iid}: requirements were not locked before search","requirements")
        for o in obligations:
            if o.get("importance")=="HERO" and o.get("current_treatment") in UNRESOLVED_OBLIGATION_STATES:
                fail(errors,f'{o["id"]}: HERO source obligation unresolved ({o["current_treatment"]})',"source_fidelity")
            if "CONTRADICTION" in o.get("current_treatment",""):
                fail(errors,f'{o["id"]}: explicit source contradiction',"source_fidelity")

    if warnings:
        for w in warnings: print("WARN: "+w)
    if errors:
        detail=max(0,a.max_detail)
        for kind,msg in errors[:detail]: print(f"ERROR[{kind}]: {msg}")
        if len(errors)>detail:
            print(f"... {len(errors)-detail} additional blocker(s) omitted from detail output")
        counts=Counter(kind for kind,_ in errors)
        print("BLOCKER SUMMARY: "+", ".join(f"{k}={v}" for k,v in sorted(counts.items())))
        print(f"FAILED with {len(errors)} error(s)")
        return 2
    print(f"OK: {len(items)} items, {len(sources)} sources, {len(obligations)} source obligations, {len(decisions)} decisions, {len(shot_ids)} shots")
    if a.strict_final: print("STRICT FINAL GATE: PASS")
    else: print("STRUCTURAL GATE: PASS (this does not imply final asset approval)")
    return 0

if __name__=="__main__": sys.exit(main())
