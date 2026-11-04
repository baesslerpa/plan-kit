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
| Code | `<pre><code>…</code></pre>`, inline `<code>`, `<kbd>` |
| Bild/Diagramm | `<figure>…<figcaption>…</figcaption></figure>` |
| Popup | `<button commandfor="d" command="show-modal">…</button><dialog id="d">… <button commandfor="d" command="close">Schließen</button></dialog>` |
| Hervorhebung | `<mark>`, `<abbr title>`, `<dfn>`, `<time datetime>` |

## Komponenten

**`<pk-summary status goal>`** – `status`: `draft` · `review` · `approved`. Sammelt offene Fragen automatisch.

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
