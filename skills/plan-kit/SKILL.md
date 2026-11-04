---
name: plan-kit
description: Pläne, Explorationen, Reviews und Entscheidungen als HTML mit plan-kit schreiben. Verwenden, wenn ein Plan, Konzept, Walkthrough oder eine Architekturentscheidung festgehalten werden soll.
---

# plan-kit

Schreibe Pläne als HTML-Datei. Das Kit liefert Look und Verhalten – du schreibst nur semantisches HTML.

## Gerüst

```html
<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Titel</title>
<link rel="stylesheet" href="https://baesslerpa.github.io/plan-kit/0.1.0/plan-kit.css">
<script type="module" src="https://baesslerpa.github.io/plan-kit/0.1.0/plan-kit.js"></script>
</head><body>
<h1>Titel</h1>
<pk-summary status="draft" goal="Ein Satz: was soll erreicht werden">
  <p>TL;DR in 2–3 Sätzen.</p>
</pk-summary>
…
</body></html>
```

## Regeln

- **Immer zuerst `<pk-summary>`** – in 10 Sekunden erfassbar.
- **Native zuerst:** Standard-HTML wählen. Ein `pk-`-Tag nur, wenn es unten steht. Keine selbstgebauten Klapp-, Dialog- oder Fortschrittselemente.
- **Kein eigenes CSS, keine `class`- oder `style`-Attribute.**
- Inhalte stehen als normales HTML in den Tags (ohne JS lesbar).
- Details, Hintergründe, lange Listen in `<details>`.
- Offene Fragen **nie im Fließtext** – immer `<aside data-kind="question">`.
- Kurz halten. Lieber eine Tabelle als drei Absätze.

## Native Elemente

| Bedarf | HTML |
|---|---|
| Aufklappbar | `<details><summary>Titel</summary>…</details>`; `name="x"` auf mehreren = Akkordeon |
| Callout | `<aside data-kind="risk\|question\|note\|decision\|ok">…</aside>` |
| Schritte | `<ol data-steps><li><input type="checkbox"> Schritt</li></ol>` (`checked` = erledigt) |
| Fortschritt | `<progress value="2" max="5"></progress>`, `<meter>` |
| Vergleich | `<table>` mit `<th>` |
| Code | `<pre data-language="ts"><code>…</code></pre>` (wird eingefärbt), inline `<code>`, `<kbd>` |
| Bild/Diagramm | `<figure>…<figcaption>…</figcaption></figure>` |
| Popup | `<button commandfor="d" command="show-modal">…</button><dialog id="d">… <button commandfor="d" command="close">Schließen</button></dialog>` |
| Hervorhebung | `<mark>`, `<abbr title>`, `<dfn>`, `<time datetime>` |

## Komponenten

**`<pk-summary status goal>`** – `status`: `draft` · `review` · `approved`. Sammelt offene Fragen automatisch.

**`<pk-options>` + `<pk-option heading [selected] [pros] [cons]>`** – Lösungswege vergleichen, eine Karte pro Weg. `pros`/`cons` mit `;` getrennt, optional kurzer Text als Inhalt. `selected` an der gewählten Option.

```html
<pk-options>
  <pk-option heading="DB-Unique-Key" selected pros="einfach;robust" cons="Migration nötig"></pk-option>
  <pk-option heading="Redis-Lock" pros="schnell" cons="neue Infra"></pk-option>
</pk-options>
```

**`<pk-code language [file] [start] [mark]>`** – Code mit Zeilennummern und Randnotizen. `start`: erste Zeilennummer, `mark="3-5,8"` hebt Zeilen hervor.
**`<pk-diff language [file]>`** – Unified Diff (aus `git diff`). Notizen beziehen sich auf die neue Datei; für entfernte Zeilen `old-line`.
**`<pk-note line|old-line [severity]>`** – `severity`: `blocking` · `warning` · `suggestion` · `note` (Standard).

```html
<pk-code language="ts" file="src/a.ts" start="40" mark="42">
<pre><code>…Code…</code></pre>
<pk-note line="42" severity="blocking">Text</pk-note>
</pk-code>
```

**`<pk-diagram [caption]>`** – Inhalt ist Mermaid-Code (flowchart, sequenceDiagram, erDiagram, stateDiagram …). Nur, wenn ein Bild wirklich mehr sagt als eine Liste.

Im Code und in Diagrammen `<` als `&lt;` und `&` als `&amp;` schreiben. Sprachen: ts, js, tsx, jsx, json, html, xml, css, scss, sql, bash, yaml, toml, env, http, java, kotlin, go, python, php, graphql, vue, markdown, dockerfile, diff.

**`<pk-decision id status date [heading] [supersedes] [follows-up]>`** – Entscheidung (ADR-light).
`id`: kurze Verbphrase, klein, Bindestriche (`webhook-idempotenz`). `status`: `proposed` · `accepted` · `superseded`. `date`: `YYYY-MM-DD`.

```html
<pk-decision id="webhook-idempotenz" status="proposed" date="2026-11-04" heading="Events per Unique-Key deduplizieren">
  <h4 slot="context">Kontext</h4><p slot="context">Situation, Rahmenbedingungen.</p>
  <h4 slot="decision">Entscheidung</h4><p slot="decision">Was und warum.</p>
  <h4 slot="consequences">Konsequenzen</h4><p slot="consequences">Folgen, Nacharbeiten.</p>
</pk-decision>
```

## Entscheidungen

- Vor dem Planen `decisions/` im Repo lesen und nicht stillschweigend widersprechen.
- Neue Entscheidungen im Plan als `status="proposed"`.
