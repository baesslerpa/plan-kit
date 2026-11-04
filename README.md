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
<link rel="stylesheet" href="https://baesslerpa.github.io/plan-kit/0.1.0/plan-kit.css"> <!-- optional: Styling ohne JS -->
<script type="module" src="https://baesslerpa.github.io/plan-kit/0.1.0/plan-kit.js"></script>
```

Die Version steht immer im Pfad, damit alte Pläne stabil bleiben. Übersicht aller Versionen: <https://baesslerpa.github.io/plan-kit/>

## Release

1. Version in `package.json` erhöhen (SemVer), committen.
2. Tag ohne `v`-Präfix setzen und pushen: `git tag 0.2.0 && git push origin 0.2.0`
3. Der Workflow [`pages.yml`](.github/workflows/pages.yml) baut **alle** Versions-Tags und veröffentlicht sie auf GitHub Pages unter `/plan-kit/<version>/`. Tag und `package.json`-Version müssen übereinstimmen.

Einmalig nötig: unter *Settings → Pages → Build and deployment* die Quelle auf **GitHub Actions** stellen.

### Alternative: eigener Asset-Server

`scripts/deploy.sh` lädt `dist/` nach `s3://$PK_S3_BUCKET/plan-kit/<version>/` hoch (`PK_S3_BUCKET=… [PK_S3_ENDPOINT=…] npm run deploy`). Der Server muss `Access-Control-Allow-Origin: *` senden, da ES-Module cross-origin per CORS geladen werden.

## Skill installieren

`skills/plan-kit/` nach `~/.claude/skills/plan-kit/` (persönlich) oder `.claude/skills/plan-kit/` (pro Projekt) kopieren. Nach einem Release die Version im Gerüst anpassen.
