# plan-kit

Web Components und ein Classless-Stylesheet, mit denen Claude Code Pläne, Explorationen und Reviews als HTML schreibt – tokensparend, mit einheitlichem Look und auf einen Blick lesbar. Dazu ein schlankes Entscheidungs-Log (`decisions/`) nach dem Vorbild von ADRs.

Konzept: [`docs/konzept.html`](docs/konzept.html)

## Stand (MVP, Roadmap-Schritt 1)

- **Classless-Basis-Stylesheet** (`src/base.css`) für native Elemente: `details`/`summary` (animiert, Akkordeon), `aside[data-kind]`, `ol[data-steps]` mit Checkboxen, `table`, `dialog`/`popover`, `progress`/`meter`, `figure`, Code, Inline-Semantik. Dark Mode über `light-dark()`.
- **`<pk-summary>`** – Kopf des Plans mit Status, Ziel, TL;DR und automatisch gesammelten offenen Fragen.
- **`<pk-decision>`** – Entscheidung mit Kontext, Entscheidung, Konsequenzen; Status, Datum, Verweise (`supersedes`, `follows-up`).
- Kleiner Fallback für `commandfor`/`command` in älteren Browsern.
- **Skill** für Claude Code: [`skills/plan-kit/SKILL.md`](skills/plan-kit/SKILL.md)
- Beispiel: [`examples/beispiel-plan.html`](examples/beispiel-plan.html)

## Entwicklung

```sh
npm install
npm run build     # → dist/plan-kit.js (ES-Modul, Lit + CSS gebündelt) und dist/plan-kit.css
npm run dev       # Watch-Modus
npm run serve     # http://localhost:8080/examples/beispiel-plan.html
```

Module laden nicht über `file://` – zum Ansehen lokal immer über einen HTTP-Server öffnen.

## Einbinden

```html
<link rel="stylesheet" href="https://<asset-server>/plan-kit/0.1.0/plan-kit.css"> <!-- optional: Styling ohne JS -->
<script type="module" src="https://<asset-server>/plan-kit/0.1.0/plan-kit.js"></script>
```

Die Version steht immer im Pfad, damit alte Pläne stabil bleiben.

## Deployment

```sh
PK_S3_BUCKET=… [PK_S3_ENDPOINT=…] npm run deploy
```

Lädt `dist/` nach `s3://$PK_S3_BUCKET/plan-kit/<version>/` (Version aus `package.json`, Cache `immutable`). Eine bereits veröffentlichte Version wird nicht überschrieben.

Der Asset-Server muss `Access-Control-Allow-Origin: *` senden – ES-Module werden cross-origin per CORS geladen.

## Skill installieren

`skills/plan-kit/` nach `~/.claude/skills/plan-kit/` (persönlich) oder `.claude/skills/plan-kit/` (pro Projekt) kopieren und die Asset-URL im Gerüst anpassen.
