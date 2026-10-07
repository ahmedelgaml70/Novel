# Production Source Registry Policy

## Rule

Whenever research reveals a source that materially informs the film, add it to the episode's `source_registry.json` **before** the information is allowed to become an untraceable assumption.

A source is logged even when the asset/candidate is later rejected. Rejected research still teaches the system what not to use.

## Source roles

A source may be used as one or more of:

- `NOVEL_SOURCE` — exact literary source/edition.
- `PRIMARY_HISTORICAL` — period document, technical treatise, fashion plate, map, engraving, catalogue, etc.
- `MUSEUM_OBJECT` — catalogued surviving object/costume/artifact.
- `ART_DIRECTION_REFERENCE` — composition/linework/lighting/visual language.
- `LOCATION_REFERENCE` — real architecture, map, city view, landscape.
- `ANATOMY_REFERENCE` — anatomical/medical reference.
- `TECHNICAL_REFERENCE` — mechanism/material/function reference.
- `TYPOGRAPHY_REFERENCE` — edition/title page/printing reference.
- `RIGHTS_EVIDENCE` — exact licence/public-domain/provider statement.
- `ASSET_CANDIDATE_SOURCE` — source from which a visible asset might be used.
- `TECHNIQUE_REFERENCE` — software/rendering/animation method documentation.

## Source record

```json
{
  "id": "SRC-FR-001",
  "title": "Frontispiece to Frankenstein, 1831",
  "creator": "Theodor von Holst",
  "date": "1831",
  "provider": "Wikimedia Commons",
  "url": "...",
  "roles": ["ART_DIRECTION_REFERENCE", "ASSET_CANDIDATE_SOURCE"],
  "supports_item_ids": ["creation_chamber_composition", "creature_drapery"],
  "rights": {
    "status": "PUBLIC_DOMAIN_MARK",
    "commercial_asset_use": "ELIGIBLE_WITH_JURISDICTION_CHECK",
    "evidence_url": "..."
  },
  "quality": {
    "authority": "HIGH",
    "period_proximity": "PRIMARY_OR_NEAR_PRIMARY",
    "notes": "Published as the 1831 frontispiece."
  },
  "discovered_at": "2026-10-07",
  "status": "ACTIVE_REFERENCE",
  "notes": "Reference does not automatically become the rendered asset."
}
```

## Source quality hierarchy

For factual design questions, prefer:

```text
exact primary-period source / surviving object
> museum / library / archive catalogue
> scholarly secondary source
> well-documented public-domain repository copy
> high-quality specialist secondary source
> general reference
> community post / unsourced image
```

A visually attractive Pinterest/repost image is not evidence of period accuracy or rights.

## Asset rights and factual evidence are separate

A museum page can be excellent factual evidence while its image is not licensed for commercial reuse.

Therefore record separately:

- whether facts/catalogue data may be used;
- whether the image itself may be copied into the final film;
- whether the image is reference-only;
- attribution/share-alike/noncommercial requirements;
- whether jurisdiction review is still required.

Do not infer image rights from the age of the depicted object.

## Source-to-item relationship

Every factual or aesthetic requirement that depends on external research should point to one or more `source_ids`.

Examples:

```text
victor_coat.period silhouette
    -> Met ca. 1820 coat
    -> Met ca. 1833 British coat

voltaic_pile.geometry
    -> Science Museum early-19th-century pile records
    -> Aldini 1803 galvanism treatise

creation_chamber.composition
    -> von Holst 1831 frontispiece

ingolstadt_exterior.roofline/location identity
    -> 1800 Ingolstadt engraving
    -> Hohe Schule historical building references
```

## Candidate discovery log

If a source is searched and rejected because it is generic, wrong-period, weakly licensed, too modern, or visually incompatible, keep the source record and add the rejection reason to the relevant candidate decision.

This prevents repeated rediscovery of the same bad candidate.

## Source promotion

`REFERENCE_ONLY` does not mean `APPROVED_VISIBLE_ASSET`.

To promote a source image into the final film:

1. verify exact rights for the actual file;
2. enter it as an asset candidate;
3. compare it against alternatives;
4. score it against the Item requirements;
5. test it in the actual shot;
6. record attribution/license obligations;
7. select it only if it wins.

## Source maintenance

If a URL disappears, keep the original record and add a replacement/mirror. Do not silently rewrite history. If rights information changes, record the new evidence and invalidate affected approvals until reviewed.


## Literary source obligations

The exact novel edition used for adaptation is a Source and must be logged with a stable provider record. Do not cite the Work generically when edition-dependent wording or visual implications matter.

For each scene/sequence, material literary facts that constrain adaptation are captured in `source_obligations.json`.

A literary obligation is different from a visual reference:
- it establishes what the chosen edition says;
- it does not prove the historical geometry of an interpretive prop;
- it does not grant rights to a modern illustration;
- it does not force every described detail to appear on screen.

Each obligation may be represented, adapted, or intentionally omitted, but the decision must be explicit. HERO obligations that remain unresolved block strict final approval.

When multiple editions are researched, designate one production text and mark the others as comparative/alternative. Never silently blend 1818 and 1831 choices.
