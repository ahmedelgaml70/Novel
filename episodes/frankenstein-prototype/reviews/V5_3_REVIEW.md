# V5.3 visual and Item review — 2026-10-07

V5.3 is a rendered 24-second prototype and a complete diagnostic review system. **It is not a final-approved film.** The inventory contains 67 records, 64 active; 3 records document retired elements. Generated visual diagnostics are not subjective approval evidence.

## Baseline defects observed

The reproduced V5.1 frames exposed oversized round heads, triangular face wedges, hands with missing digit articulation, a blanket-like cloth shape, uniform diagonal mesh hatching, anonymous repeated skyline blocks, unmotivated electrical glow, and a Linux-only font path. The original first-eye shot hid most of the frame while leaving a schematic head enlarged as its hero subject. The governance records also contained text constraints that the renderer did not implement.

## What changed and why

| Item / family | Previous defect | V5.3 test | Selection evidence / remaining limit |
|---|---|---|---|
| Ingolstadt roofline | Repeated generic roof blocks | Traced skyline mask from the 1800 Eckarth engraving | Location/date and actual city linework beat the invented block skyline and a minimal two-tower redraw. Still a flat background; foreground laboratory is fictional. SRC-FR-010. |
| Victor profile | Oversized circular head and triangular facial wedge | Smaller head/body ratio; separate brow, bridge, nostril, lips, chin and jaw | More human proportions in the shot. Still schematic; not a hero illustration approval. SRC-FR-001 is art direction, not sufficient anatomical evidence. |
| Victor / creature hands | Mitten shape with too few separately articulated digits | Four fingers and thumb; separate palm/wrist crease structure | Diagnostic crops expose each pose. Anatomy and convincing contact grip remain unresolved. |
| Creature eye / hair | Pale dot and helmet-like hair mass | Dull yellow opening, limited wet highlight, long curved black strands | Prose supports the colour and flowing hair, not exact biological geometry. Hero close-up still needs dedicated art. SRC-FR-012. |
| Cloth | Single flat blanket shape | Curved folds, plane shadows, segmented surface marks | More form cues, but concealed anatomy, weight and folds need reference-driven drawing. SRC-FR-001. |
| Candle / light | Candle mentioned but absent; lightning dominates room | Short candle, restrained warm flame and spatial falloff | Direct creation-passage support. Light direction and flame/intensity coupling remain incomplete. SRC-FR-012. |
| Apparatus | Repeated glowing symbols; no separator layer | Alternating plate/separator construction; jar glass/foil/stopper/terminal parts | Better construction vocabulary, not a validated circuit. The 1801–1805 pile conflicts with a literally eighteenth-century story chronology. Resolve the adaptation contract before approval. SRC-FR-005/006. |
| Contact macro | Hand points away from the contact | Wrist-led reach with fingers toward the lever | Shot endpoint can be inspected; final physical grip is not approved. A tiny spark remains an explicit cinematic hypothesis. |
| Electrical effect / transition | Continuous glow and a whole-frame arc wipe | Brief local spark; hard cut to eye | Removes decorative electricity. The spark is not a fact established by the novel or certified physical behavior. A no-spark direction remains a live comparison. |
| Engraving surface | One diagonal grid over every material | Short deterministic curved segments and differentiated folds/strands | More specific material cues. Still much less rich than genuine period engraving. |
| Typeface | Linux font path, silent system fallback | Bundled EB Garamond Roman + OFL + hash | Reproducible and licensed. Modern revival; exact 1818 title-page relationship still pending. SRC-FR-014. |
| Audio | Breath is a sinusoid; rain has no distinct stem | Noise-envelope breath, independent rain layer, solo stems, edge fades | Technically audible synthetic layers; listening and acoustic realism remain unapproved. |
| Final validator | Missing score fields can be skipped | Missing critical scores, evidence, comparison and selected final status fail | Labels alone cannot approve a film; adversarial regression test added. |

## Source contract

The text anchor is the 1818 edition, volume I chapter IV. Rain, nearly exhausted candle, dull yellow eye, proportionate limbs, flowing black hair, hard breathing and convulsive movement are supported by the creation passage. The source does not specify a galvanic apparatus. The tableau is inspired by the 1831 frontispiece. The exterior uses an 1800 city engraving. These are separate evidence roles, not a claim that publication year dates the fictional action.

Every material source is in `source_registry.json`, including references and rejected directions. The font and historical plate are bundled and hash-bound in `production/living_engraving/asset_manifest.json`. See that directory’s `LICENSES.md` for local asset provenance. A first rectangular crop retained part of the decorative banner and had an obvious lower edge; contact-sheet review rejected that integration. The active render uses a traced skyline mask and a lower-edge night fade. The rejected crop is not retained as a competing current method.

## Diagnostic review modes

- **ISOLATED_LAYER**: transparent crop of one implemented layer, with marked context at an integer frame/timecode. Shadows and surrounding layers are intentionally absent in the solo; approve only with context.
- **INTEGRATED_SOURCE_DETAIL**: windows are embedded in the historical plate; inspect the plate/context. No claim of independent window extraction. The city skyline mask excludes the decorative banner; its lower edge fades into night.
- **STYLE_CONTEXT / COMPOSITION_CONTEXT**: palette, shared engraving strokes and composition are attributes; inspect representative shot frames.
- **MOTION_SEQUENCE**: first/last frames plus the linked film segment. Endpoint stills cannot establish smoothness.
- **AUDIO_STEM**: solo WAV, then mixed movie. Generated stems are not listening approvals.
- **RETIRED**: interior lightning, unmotivated footsteps and full-screen arc transition are absent from the current render and explicitly documented.

The generator fails if an active layer has no rendered pixels. The gallery includes existing requirements, candidate reasons, source links and unresolved risks for every Item. No numerical art-quality rating is invented in V5.3; prototype selection does not satisfy the final 8/10 thresholds.

## Verification and what it proves

The structural gate verifies IDs, record references, shot coverage and runtime. The renderer validator checks 24-second duration, 1280×720/24 fps delivery contract, cue bounds, identical episode/renderer manifests, version agreement and bundled asset hashes. The review generator checks layer coverage, records exact integer frames and emits solo audio files. The final gate deliberately rejects this prototype.

All 26 repository tests passed after the validator change. One adversarial test gives every record a FINAL_APPROVED label but withholds scores/review evidence; the gate rejects it. This does not test human artistic judgment.

Visual still review confirmed improved head scale, separate facial planes, five-digit hand geometry, readable eye colour, a visible candle, the source skyline, and absent continuous apparatus glow. It also confirms that the revised heads and cloth still look like simplified vector illustration. Motion/audio diagnostics are available for review; they are not final listening or continuity approvals. FFprobe verified 24.000 seconds, 576 H.264 frames at 1280×720/24 fps, and 48 kHz stereo AAC. Full decode passed; encoded audio maximum was −6.6 dBFS and mean volume −28.2 dBFS (sample/volume analysis, not a listening verdict). A repeated render of frame 441 produced identical raw pixels. Gallery search was checked in the browser and isolated the intended eye review card.

## Next defects to resolve

1. Dedicated engraved hero eye/profile drawing with anatomical references; do not merely enlarge the shared rig again.
2. Independent grip/foreshortening study and cloth/body gesture study, tested at final crop.
3. Deliberate source-era versus illustration-era contract for costume and apparatus; compare replacing the pile with less date-specific instruments.
4. Physical circuit review or remove the contact spark; no electrical spectacle as filler.
5. Reference-based wood/metal/glass rendering, restrained parallax and stronger world depth.
6. Acoustic listening pass: rain through glass versus outside, human breath, heartbeat perspective and stereo spatial cues.
7. Compare at least three viable directions / sufficient source coverage for every HERO/PRIMARY Item, record actual scores and hash-bound approved evidence only after review.

Keep current instructions in CURRENT_METHOD.md. Keep defects, experiments and replaced approaches here and in VERSION_LOG.md; do not preserve two active renderers.
