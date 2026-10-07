# Novel project instructions

Before changing production work, read `docs/STANDARDS.md`, `docs/DECISIONS.md`,
`docs/production/CURRENT_METHOD.md`, `docs/memory/STATE.md`, and the episode's
`quality_review.json`. Read the relevant Item checklists, source policy and
decision records before designing or replacing an Item.

## Non-negotiable quality requirements

- User corrections override previous proposals. V5.3 was rejected; its art and
  style are evidence of failure, not an approved template.
- Show an understandable action and causal sequence. A pan, zoom, flicker,
  grain, fog or rain does not substitute for a required character action.
- Design connected, proportionate characters. Review joint movement, weight,
  grips, hands, silhouettes and crops at delivery size. Partial lighting is
  allowed; accidentally missing anatomy or floating body parts is not.
- Bind cables, hands, props and effects to shared attachment points. Verify
  contact, collision, support, gravity and sound timing where applicable.
- Fix a rejected composition or drawing before adding texture, lighting or
  camera movement. Compare materially different designs before style lock.
- Passing structural checks is never evidence of artistic approval. Never
  invent scores, silently close defects, or call a diagnostic render final.

## Memory and improvement

- Use repository-owned memory; do not install global hooks or background
  observers as a side effect of working on this project.
- Keep `docs/memory/STATE.md` short and current. Preserve atomic lessons in
  `docs/memory/lessons.json` and experiments in `docs/memory/experiments.json`.
- Before a change, identify a defect and the lesson it tests. After it, record
  the change, actual checks, result, remaining limits and next experiment.
- User requirements are authoritative requirements. Implementation ideas are
  hypotheses until tested. Preserve failed approaches and replacement triggers.
- Store concise project facts, not raw chats, credentials or tool transcripts.
- Close an episode defect only with dated, hash-bound review evidence for each
  affected shot. Tests may verify mechanics; visual/audio approval needs a
  named human reviewer. Automated diagnostics remain explicitly diagnostic.
- Update the one canonical method, its state, inventory and history together.
  Historical documents must not serve as competing current instructions.

## Checks

Run `make production-validate` and, after renderer changes, run
`npm test` and `npm run validate` in `production/living_engraving`.
Run appropriate existing tests after changing their code. Render a focused
motion proof and inspect start, intermediate and end frames before a full film.
`make production-validate-final` must fail while defects or approvals remain
unresolved. Stop extending runtime until the next shot passes its quality gates.
