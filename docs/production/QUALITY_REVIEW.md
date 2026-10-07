# Shot quality and learning protocol

A structural pass means files are consistent. It does not mean the video is good.
The episode's `quality_review.json` is an independent final/shot-lock gate.

Before a change, read the current memory and find the affected defect. Record its
root cause and an experiment with alternatives and a falsifiable acceptance
criterion. Work on one shot or one shared mechanical system first.

Before rendering motion, compare clean approval frames with texture and shadows
removed where they conceal construction. Check complete underlying anatomy,
proportions, readable staging, object scale, contact points and silhouettes.
Review hands independently at delivery resolution. A silhouette style does not
waive correct construction.

Watch required actions with the camera locked: actors, targets, contact and change
must remain understandable. Deliberate stillness needs a narrative justification.
Rain, fog, flicker and zoom are secondary motion, not evidence of character action.
Check first, middle and last frames, then watch the complete motion. Check limb
lengths, weight transfer, support, cloth response and collisions where applicable.

Every visible wire must have two declared terminals, or an explicitly reviewed
narrative reason for a loose end. Draw endpoints from shared device transforms;
never approximate an attachment independently in each shot. Grip, wrist, sleeve,
lever and driven prop share attachment state. Electrical behavior requires its
own evidence: endpoint geometry alone cannot justify an arc or circuit claim.
Sound events follow the visible or offscreen story cause and are reviewed in context.

Ask a viewer unfamiliar with the novel to identify actor, action, target and
change, first from silent playback and then in the final edit. The style must be
accepted on a concrete frame and motion sample before scaling the production.
Compare materially different directions; bespoke art still needs scrutiny.

Each shot needs named human approval of readability, anatomy, motion, physics,
continuity, style and audio. Record dated evidence per affected shot with a
repository-relative path, SHA-256, reviewer name, `reviewer_type: HUMAN`, domain
and `verdict: APPROVED`. This is evidence of a review, not automatic certification.
Tests and generated contact sheets remain DIAGNOSTIC until actually reviewed.

Defects progress OPEN -> REPAIR_IMPLEMENTED -> RESOLVED. Closing a defect requires
review evidence for every affected shot. A repair can pass a numerical test while
remaining visually unapproved. Never relabel old evidence as new review evidence.

After the experiment, record actual checks, rejection or acceptance, limitations
and next action. Preserve failed alternatives. Add one atomic lesson when a
correction generalizes within this project; do not flood memory with transcripts.
Future production work reads these lessons through AGENTS.md. Repeated defects
must change the workflow/checks, not merely acquire another version number.

Commands:

```sh
make production-validate
cd production/living_engraving && npm test && npm run validate
# From repository root; expected to fail until actual review is complete:
make production-validate-final
```
