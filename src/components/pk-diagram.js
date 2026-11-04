import { LitElement, html, css, nothing } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

/**
 * <pk-diagram caption="Ablauf Webhook">
 * sequenceDiagram
 *   Stripe->>API: event
 *   API->>DB: INSERT event_id
 * </pk-diagram>
 *
 * Inhalt = Mermaid-Code (< und & escapen). Mermaid wird erst geladen, wenn ein Diagramm
 * auf der Seite steht. Ohne JS bleibt der Mermaid-Code als vorformatierter Text lesbar.
 * Folgt Hell/Dunkel der Seite und rendert bei einem Wechsel neu.
 */

let mermaidPromise;
let queue = Promise.resolve();
let counter = 0;

const loadMermaid = () => (mermaidPromise ??= import('mermaid').then((m) => m.default));

const isDark = () => {
  const theme = document.documentElement.dataset.theme;
  if (theme) return theme === 'dark';
  return matchMedia('(prefers-color-scheme: dark)').matches;
};

/** Mermaid-Renderaufrufe nacheinander ausführen – Mermaid ist nicht für parallele Aufrufe gebaut. */
function renderMermaid(source) {
  const run = queue.then(async () => {
    const mermaid = await loadMermaid();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: isDark() ? 'dark' : 'neutral',
      fontFamily: getComputedStyle(document.body).fontFamily,
    });
    const { svg } = await mermaid.render(`pk-diagram-${++counter}`, source);
    return svg;
  });
  queue = run.catch(() => {});
  return run;
}

const schemeListeners = new Set();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => schemeListeners.forEach((fn) => fn()));
new MutationObserver(() => schemeListeners.forEach((fn) => fn())).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

export class PkDiagram extends LitElement {
  static properties = {
    caption: { type: String },
    _svg: { state: true },
    _error: { state: true },
  };

  static styles = css`
    :host { display: block; margin: 0 0 1rem; }
    figure {
      margin: 0; padding: 1rem;
      background: var(--pk-card);
      border: 1px solid var(--pk-line);
      border-radius: var(--pk-radius);
      overflow-x: auto;
      text-align: center;
    }
    .svg svg { max-width: 100%; height: auto; }
    figcaption { color: var(--pk-muted); font-size: 0.9rem; margin-top: 0.6rem; text-align: left; }
    .error { text-align: left; color: var(--pk-risk); font-size: 0.9rem; }
    pre {
      text-align: left; margin: 0.5rem 0 0; padding: 0.8rem;
      background: var(--pk-code-bg); border-radius: var(--pk-radius);
      font-family: var(--pk-mono); font-size: 0.85rem; white-space: pre-wrap;
    }
    .loading { color: var(--pk-muted); font-size: 0.9rem; }
  `;

  constructor() {
    super();
    this._rerender = () => this._source && this._draw();
  }

  connectedCallback() {
    super.connectedCallback();
    schemeListeners.add(this._rerender);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._start(), { once: true });
    } else {
      queueMicrotask(() => this._start());
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    schemeListeners.delete(this._rerender);
  }

  _start() {
    this._source = dedent(this.textContent);
    this._draw();
  }

  async _draw() {
    try {
      this._svg = await renderMermaid(this._source);
      this._error = undefined;
    } catch (err) {
      this._error = err?.message ?? String(err);
    }
  }

  render() {
    return html`<figure>
      ${this._error
        ? html`<div class="error">Diagramm konnte nicht gerendert werden: ${this._error}</div><pre>${this._source}</pre>`
        : this._svg
          ? html`<div class="svg" role="img" aria-label=${this.caption ?? 'Diagramm'}>${unsafeSVG(this._svg)}</div>`
          : html`<div class="loading">Diagramm wird geladen …</div>`}
      ${this.caption ? html`<figcaption>${this.caption}</figcaption>` : nothing}
    </figure>`;
  }
}

/** Gemeinsame Einrückung entfernen, damit eingerückter Mermaid-Code im HTML funktioniert. */
function dedent(text) {
  const lines = text.replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
}

customElements.define('pk-diagram', PkDiagram);
