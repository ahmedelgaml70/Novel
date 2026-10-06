# Novel — Story-to-Short Video Machine

Novel is a reusable pipeline for turning a source story into a polished vertical short video.

The repository is the **source of truth** for:
- the pipeline and stage contracts,
- prompts and schemas,
- visual and audio rules,
- rendering instructions,
- decisions and trade-offs,
- changes to the system,
- reproducible run instructions.

The goal is not to mass-produce generic stock-footage videos. The goal is to build a repeatable system that can produce authored, high-quality 45–60 second visual stories and improve over time.

## Current architecture

```text
source / rights check
        ↓
story adaptation
        ↓
timed screenplay
        ↓
scene plan + visual direction
        ↓
asset plan / asset generation
        ↓
voice + captions + music + SFX
        ↓
HTML / SVG / CSS / JS composition
        ↓
HyperFrames render
        ↓
quality checks
        ↓
final vertical MP4 + metadata
```

Every stage has an explicit input/output contract. Providers are adapters, not hard-coded assumptions.

## Why HyperFrames first?

HyperFrames renders ordinary HTML/CSS/JavaScript into deterministic video. It supports agent-authored compositions and web animation techniques while leaving the project editable. Local rendering is open source and does not consume HeyGen credits.

Upstream:
- https://github.com/heygen-com/hyperframes
- https://github.com/heygen-com/hyperframes-launch-video

We keep the renderer behind an adapter so another renderer can be evaluated later.

## Prerequisites

- Node.js 22+
- FFmpeg
- Git
- Internet access for `npx` on first use

Check the machine:

```bash
npm run doctor
```

## Start

Clone and enter the repository:

```bash
git clone https://github.com/ahmedelgaml70/Novel.git
cd Novel
```

No global HyperFrames install is required.

Create a new story project:

```bash
npm run new -- my-story
```

Validate its manifest:

```bash
npm run validate -- projects/my-story/story.json
```

Preview:

```bash
npm run preview -- my-story
```

Render:

```bash
npm run render -- my-story
```

The generated project lives under `projects/my-story/`.

## Repository map

```text
Novel/
├── AGENTS.md
├── config/
│   └── defaults.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── DECISIONS.md
│   ├── PIPELINE.md
│   └── ROADMAP.md
├── projects/
│   └── demo/
├── schemas/
│   └── story.schema.json
├── scripts/
│   └── novel.mjs
├── templates/
│   └── story/
├── package.json
└── README.md
```

## Project principles

1. **Quality before scale.** One excellent short is more useful than 100 mediocre ones.
2. **Reproducible by default.** Important settings and prompts belong in Git.
3. **No hidden manual step.** If a human decision is required, record it as a named pipeline gate.
4. **Replaceable providers.** LLM, image, TTS, music and render providers are adapters.
5. **Deterministic render.** A saved project should render the same sequence again.
6. **Rights-aware inputs.** Source text, translations, images, music and fonts must have appropriate usage rights.
7. **Change the docs with the system.** Architecture/pipeline changes must update `docs/CHANGELOG.md` and, when a trade-off changes, `docs/DECISIONS.md`.

## Status

**Phase 0 — machine foundation.**

The repository currently provides the reusable project contract, CLI scaffold, documentation, a vertical HyperFrames demo composition and the first quality gates. AI adapters and production asset generation will be added stage-by-stage rather than hidden behind placeholder claims.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the build order.
