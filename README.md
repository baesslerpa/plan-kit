# plan-kit

Web Components und ein Classless-Stylesheet, mit denen Claude Code Pläne, Explorationen und Reviews als HTML schreibt – tokensparend, mit einheitlichem Look und auf einen Blick lesbar. Dazu ein schlankes Entscheidungs-Log (`decisions/`) nach dem Vorbild von ADRs.

Konzept: [`docs/konzept.html`](docs/konzept.html)

## Stand (MVP: Roadmap-Schritt 1 + Options, Code, Diagramme)

- **Classless-Basis-Stylesheet** (`src/base.css`) für native Elemente: `details`/`summary` (animiert, Akkordeon), `aside[data-kind]`, `ol[data-steps]` mit Checkboxen, `table`, `dialog`/`popover`, `progress`/`meter`, `figure`, Code, Inline-Semantik. Dark Mode über `light-dark()`.
- **`<pk-summary>`** – Kopf des Plans mit Status, Ziel, TL;DR und automatisch gesammelten offenen Fragen.
- **`<pk-decision>`** – Entscheidung mit Kontext, Entscheidung, Konsequenzen; Status, Datum, Verweise (`supersedes`, `follows-up`).
- **`<pk-options>` / `<pk-option>`** – Lösungswege als Karten mit Vor- und Nachteilen, `selected` markiert die Wahl.
- **`<pk-code>` / `<pk-diff>` mit `<pk-note>`** – Code bzw. Diff mit Zeilennummern, hervorgehobenen Zeilen und Randnotizen (Blocker, Achtung, Vorschlag, Notiz) direkt unter der Zeile. Highlighting mit [TanStack Highlight](https://tanstack.com/highlight/latest), lazy (~11 kB gzip).
- **`<pk-diagram>`** – Mermaid-Diagramme, lazy geladen, folgt Hell/Dunkel.
- Natives `<pre data-language="…">` wird ebenfalls eingefärbt.
- Kleiner Fallback für `commandfor`/`command` in älteren Browsern.
- **Skill** für Claude Code: [`skills/plan-kit/SKILL.md`](skills/plan-kit/SKILL.md)
- Beispiel: [`examples/beispiel-plan.html`](examples/beispiel-plan.html)

## Entwicklung

```sh
npm install
npm run build     # → dist/plan-kit.js (ES-Modul, Lit + CSS gebündelt), dist/plan-kit.css
                  #   und dist/chunks/ (Mermaid, Highlighter – nur bei Bedarf nachgeladen)
npm run dev       # Watch-Modus
npm run serve     # http://localhost:8080/examples/beispiel-plan.html
```

Module laden nicht über `file://` – zum Ansehen lokal immer über einen HTTP-Server öffnen.

## Einbinden

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/baesslerpa/plan-kit@0.1.0/dist/plan-kit.css"> <!-- optional: Styling ohne JS -->
<script type="module" src="https://cdn.jsdelivr.net/gh/baesslerpa/plan-kit@0.1.0/dist/plan-kit.js"></script>
```

Ausgeliefert über [jsDelivr](https://www.jsdelivr.com/) direkt aus dem GitHub-Tag. Die Version steht immer im Pfad, damit alte Pläne stabil bleiben.

## Release

jsDelivr liefert Dateien aus dem getaggten Commit – `dist/` muss dort also eingecheckt sein. Damit `main` frei von Build-Artefakten bleibt, landet `dist/` nur auf dem Release-Branch. Das erledigt der Workflow [`release.yml`](.github/workflows/release.yml) (*Actions → Release → Run workflow*).

**Neues Release (X.Y.0)**
1. Auf `main` die Version in `package.json` erhöhen (`npm version 0.2.0 --no-git-tag-version`), committen, pushen.
2. Workflow auf `main` starten → legt `release/0.2` an, committet `dist/`, setzt Tag `0.2.0`.

**Hotfix (X.Y.Z+1)**
1. Fix auf `main` committen.
2. Per `git cherry-pick` nach `release/X.Y` übernehmen, dort die Patch-Version erhöhen, pushen.
3. Workflow auf `release/X.Y` starten → neuer Tag auf diesem Branch.

Release-Branches werden nie nach `main` zurückgemergt. Tags ohne `v`-Präfix.

### Alternative: eigener Asset-Server

`scripts/deploy.sh` lädt `dist/` nach `s3://$PK_S3_BUCKET/plan-kit/<version>/` hoch (`PK_S3_BUCKET=… [PK_S3_ENDPOINT=…] npm run deploy`). Der Server muss `Access-Control-Allow-Origin: *` senden, da ES-Module cross-origin per CORS geladen werden.

## Skill installieren

`skills/plan-kit/` nach `~/.claude/skills/plan-kit/` (persönlich) oder `.claude/skills/plan-kit/` (pro Projekt) kopieren. Nach einem Release die Version im Gerüst anpassen.
