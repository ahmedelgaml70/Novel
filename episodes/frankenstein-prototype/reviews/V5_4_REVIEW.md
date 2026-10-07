# V5.4 quality reset and mechanics experiment

2026-10-07. Verdict: **DIAGNOSTIC ONLY — VISUAL REDESIGN REQUIRED**.

The user rejected V5.3's style, confusing views, still-like scenes, proportions,
hands, incomplete characters, physics and disconnected wires. Structural tests
had passed without proving that the video met the existing project guidelines.
V5.3 remains in history as rejected evidence; it is not the approved art template.

## Confirmed causes and first repair

- Wire paths used independent literal endpoints, including an endpoint in empty
  space. Named ports now feed both the apparatus drawing and every active cable.
- The macro hand moved downward while its sleeve/cuff and contact lever stayed
  fixed. A single state now rotates the lever and binds grip/wrist to a two-link
  arm. The shoulder enters from beyond the crop; limb lengths stay constant.
- Spark/crackle events fired independently of contact or validated electrical
  behavior. The current experiment removes both effects and their audio.
- The foreground cable and unconnected duplicate jar were decorative. Retired
  them, preserving their decision records. Inventory: 67 records, 59 active.
- Existing recurring-shot bindings omitted components already visible in the
  renderer. A census corrected those records; integration checks prevent repeats.
- Shot-lock documents disagreed. Every active Item now needs final approval,
  plus independent shot/style approval and resolution of affecting defects.

## Memory and enforcement

`AGENTS.md` tells every production session to load current guidelines, memory,
lessons and open faults. `docs/memory/STATE.md` retains the current outcome and
next steps; ten atomic lessons preserve corrections; experiments preserve
alternatives, checks, results and remaining limits. The active experiment binds
its implementation files by hash so edits without updated learning records fail.

`quality_review.json` contains ten blocking defects, each with affected Items,
shots, root cause, remediation and acceptance criteria. Every shot requires
readability, anatomy, motion, physics, continuity, style and audio review. A
resolution label alone cannot pass; evidence must name a human reviewer and date,
match the artifact hash, and cover every affected shot. This validates records,
not reviewer competence. Automated renders never grant human visual approval.

## Actual verification

- 32 Python repository tests pass, including false-approval and stale-memory cases.
- Four Node tests pass: attachments in both views; constant-length lever reaching
  contact; arm/wrist constraints with real motion; active/recurring layer bindings.
- Renderer versions, timing, asset hashes and production/memory structure pass.
- A four-second, 96-frame macro proof was rendered. Codex inspected start,
  intermediate and closed-contact frames as diagnostics. The first proof exposed
  a floating shoulder cap; the repair moved the shoulder beyond the crop.
- Strict-final correctly fails for unapproved style, all ten unresolved defect
  groups, all six unapproved shots and unfinished Item approvals.

## Remaining work

The proof is still schematic. Its hand anatomy, sleeve drawing, staging and style
are not approved. The tests certify geometric constraints only. Electrical and
historical validity, body support, collision, weight transfer and other character
motion remain unverified. The other shots retain rejected prototype construction.
A full revised film has not been presented as completed.

Compare materially different visual directions for one narrative beat, then
create dedicated referenced characters/hands and a readable shot. Review clean
construction before shading; watch required action with a locked camera. Test
sound and recurring appearances. Expand runtime only after that shot passes.

## Reproduce the experiment

From `production/living_engraving`, run `npm ci`, `npm test`, `npm run validate`
and `npm run proof`. The proof writes frames under `review-output/mechanics-proof`.
It contains no unsupported discharge. From the repository root run
`make production-validate`; `make production-validate-final` must remain red until
real reviews exist. See `docs/production/QUALITY_REVIEW.md` for review recording.
