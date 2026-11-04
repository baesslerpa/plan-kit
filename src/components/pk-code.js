import { LitElement, html, css, nothing, unsafeCSS } from 'lit';
import { tokenize } from '../lib/highlight.js';
import tokenCss from '../lib/tokens.css';

/**
 * <pk-code language="ts" file="src/webhooks/stripe.ts" start="40" mark="42-44">
 *   <pre><code>…Code (mit &lt; und &amp; escaped)…</code></pre>
 *   <pk-note line="42" severity="blocking">Text als HTML</pk-note>
 * </pk-code>
 *
 * <pk-diff language="ts" file="src/webhooks/stripe.ts">
 *   <pre><code>@@ -10,4 +10,6 @@
 *  unverändert
 * -entfernt
 * +hinzugefügt</code></pre>
 *   <pk-note line="11">Bezieht sich auf Zeile 11 der neuen Datei.</pk-note>
 *   <pk-note old-line="11">Bezieht sich auf Zeile 11 der alten Datei (entfernte Zeile).</pk-note>
 * </pk-diff>
 *
 * Ohne JS bleibt der Code als normales <pre> lesbar, die Notizen stehen darunter.
 * Notizen werden per Slot direkt unter ihrer Zeile eingeblendet.
 */

/** "3-5, 8" → Set{3,4,5,8} */
function parseRanges(value) {
  const set = new Set();
  for (const part of (value ?? '').split(',')) {
    const m = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(part);
    if (!m) continue;
    const from = Number(m[1]);
    const to = Number(m[2] ?? m[1]);
    for (let i = from; i <= to; i++) set.add(i);
  }
  return set;
}

/** Text des <pre> ohne führenden/abschließenden Zeilenumbruch. */
function readSource(host) {
  const pre = host.querySelector(':scope > pre');
  return (pre?.textContent ?? '').replace(/^\r?\n/, '').replace(/\s+$/, '');
}

/**
 * Unified Diff → Zeilen. Kopfzeilen (diff/index/---/+++) werden ausgeblendet,
 * aus „+++ b/pfad“ wird bei Bedarf der Dateiname übernommen.
 */
function parseDiff(text) {
  const rows = [];
  let file = null;
  let oldNo = 1;
  let newNo = 1;
  for (const raw of text.split(/\r?\n/)) {
    if (/^(diff |index |--- )/.test(raw)) continue;
    if (raw.startsWith('+++ ')) {
      file = raw.slice(4).replace(/^b\//, '').trim();
      continue;
    }
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/.exec(raw);
    if (hunk) {
      oldNo = Number(hunk[1]);
      newNo = Number(hunk[2]);
      rows.push({ kind: 'hunk', text: raw });
      continue;
    }
    const sign = raw[0];
    const code = raw.slice(1);
    if (sign === '+') rows.push({ kind: 'add', code, newNo: newNo++ });
    else if (sign === '-') rows.push({ kind: 'del', code, oldNo: oldNo++ });
    else if (sign === '\\') rows.push({ kind: 'hunk', text: raw });
    else rows.push({ kind: 'ctx', code: sign === ' ' ? code : raw, oldNo: oldNo++, newNo: newNo++ });
  }
  return { rows, file };
}

const sharedStyles = css`
  :host {
    display: block;
    margin: 0 0 1rem;
    background: var(--pk-code-bg);
    border: 1px solid var(--pk-line);
    border-radius: var(--pk-radius);
    overflow: hidden;
    font-size: 0.88rem;
  }
  header {
    display: flex; gap: 0.75rem; align-items: center;
    padding: 0.4rem 0.9rem;
    background: var(--pk-th);
    border-bottom: 1px solid var(--pk-line);
    font-family: var(--pk-mono);
    font-size: 0.82rem;
  }
  .file { font-weight: 600; overflow-wrap: anywhere; margin-right: auto; }
  .lang { color: var(--pk-muted); text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.05em; }
  .lines { padding: 0.5rem 0; font-family: var(--pk-mono); line-height: 1.55; }
  .row { display: grid; grid-template-columns: var(--pk-gutter) 1fr; }
  .num {
    color: var(--pk-muted); opacity: 0.7; text-align: right; padding: 0 0.7rem 0 0.5rem;
    user-select: none; font-variant-numeric: tabular-nums; white-space: pre;
  }
  .code { white-space: pre-wrap; overflow-wrap: anywhere; padding-right: 0.9rem; min-height: 1.55em; }
  .row.mark { background: color-mix(in srgb, var(--pk-warn) 16%, transparent); box-shadow: inset 3px 0 var(--pk-warn); }
  .row.add { background: color-mix(in srgb, var(--pk-ok) 14%, transparent); }
  .row.del { background: color-mix(in srgb, var(--pk-risk) 14%, transparent); }
  .row.hunk { color: var(--pk-muted); background: color-mix(in srgb, var(--pk-info) 10%, transparent); }
  .row.hunk .code { padding-left: 0.5rem; }
  .sign { user-select: none; text-align: center; }
  .add .sign { color: var(--pk-ok); }
  .del .sign { color: var(--pk-risk); }
  .notes { padding: 0.15rem 0.9rem 0.35rem calc(var(--pk-gutter) + 0.2rem); font-family: var(--pk-font); line-height: 1.5; }
  .orphans { padding: 0.3rem 0.9rem 0.6rem; border-top: 1px dashed var(--pk-line); font-family: var(--pk-font); line-height: 1.5; }
  ::slotted(pk-note) { margin: 0.2rem 0 !important; }
`;

/** Gemeinsame Basis: liest Quelltext + Notizen, lädt Highlighting nach. */
class CodeBase extends LitElement {
  static properties = {
    language: { type: String },
    file: { type: String },
    _tokens: { state: true },
    _source: { state: true },
  };

  connectedCallback() {
    super.connectedCallback();
    // Inhalte erst nach dem Parsen der Kinder lesen.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._read(), { once: true });
    } else {
      queueMicrotask(() => this._read());
    }
  }

  _read() {
    this._source = readSource(this);
    this._assignNotes();
    this._highlight();
  }

  /**
   * pk-note → slot="new-N" / "old-N", damit die Notiz unter ihrer Zeile erscheint.
   * Notizen ohne passende Zeile landen gesammelt unter dem Code (slot="orphan").
   */
  _assignNotes() {
    const valid = this._lineSlots();
    for (const note of this.querySelectorAll(':scope > pk-note')) {
      const oldLine = note.getAttribute('old-line');
      const name = oldLine ? `old-${oldLine}` : `new-${note.getAttribute('line')}`;
      note.slot = valid.has(name) ? name : 'orphan';
    }
  }

  _orphans() {
    return this.querySelector(':scope > pk-note[slot="orphan"]')
      ? html`<div class="orphans"><slot name="orphan"></slot></div>`
      : nothing;
  }

  _notes(slotNames) {
    const used = slotNames.filter((name) => this.querySelector(`:scope > pk-note[slot="${name}"]`));
    return used.length ? html`<div class="notes">${used.map((n) => html`<slot name=${n}></slot>`)}</div>` : nothing;
  }

  _renderTokens(index, fallback) {
    const line = this._tokens?.[index];
    if (!line) return fallback;
    return line.map((t) => (t.kind ? html`<span data-t=${t.kind}>${t.content}</span>` : t.content));
  }

  _header(file) {
    if (!file && !this.language) return nothing;
    return html`<header>
      <span class="file">${file ?? ''}</span>
      ${this.language ? html`<span class="lang">${this.language}</span>` : nothing}
    </header>`;
  }
}

export class PkCode extends CodeBase {
  static properties = {
    ...CodeBase.properties,
    start: { type: Number },
    mark: { type: String },
  };

  static styles = [sharedStyles, unsafeCSS(tokenCss)];

  constructor() {
    super();
    this.start = 1;
  }

  _lineSlots() {
    const count = this._source.split(/\r?\n/).length;
    return new Set(Array.from({ length: count }, (_, i) => `new-${this.start + i}`));
  }

  async _highlight() {
    if (this.language && this._source) this._tokens = await tokenize(this._source, this.language);
  }

  render() {
    if (this._source === undefined) return html`<slot></slot>`;
    const lines = this._source.split(/\r?\n/);
    const marked = parseRanges(this.mark);
    const width = String(this.start + lines.length - 1).length;
    return html`
      ${this._header(this.file)}
      <div class="lines" style=${`--pk-gutter: calc(${width}ch + 1.2rem)`}>
        ${lines.map((code, i) => {
          const no = this.start + i;
          return html`
            <div class="row ${marked.has(no) ? 'mark' : ''}">
              <span class="num">${no}</span>
              <span class="code">${this._renderTokens(i, code)}</span>
            </div>
            ${this._notes([`new-${no}`])}`;
        })}
      </div>
      ${this._orphans()}`;
  }
}

export class PkDiff extends CodeBase {
  static styles = [
    sharedStyles,
    unsafeCSS(tokenCss),
    css`
      .row { grid-template-columns: var(--pk-num) var(--pk-num) 1.4em 1fr; }
      .row.hunk { grid-template-columns: 1fr; }
    `,
  ];

  _lineSlots() {
    const names = new Set();
    for (const r of parseDiff(this._source).rows) {
      if (r.newNo !== undefined) names.add(`new-${r.newNo}`);
      if (r.kind === 'del') names.add(`old-${r.oldNo}`);
    }
    return names;
  }

  async _highlight() {
    const { rows } = parseDiff(this._source);
    // Nur die Codezeilen (ohne +/-/Hunk) gemeinsam einfärben, damit mehrzeilige Konstrukte stimmen.
    const codeRows = rows.filter((r) => r.kind !== 'hunk');
    if (!this.language || !codeRows.length) return;
    const tokens = await tokenize(codeRows.map((r) => r.code).join('\n'), this.language);
    if (!tokens) return;
    let i = 0;
    this._tokens = rows.map((r) => (r.kind === 'hunk' ? null : tokens[i++]));
  }

  render() {
    if (this._source === undefined) return html`<slot></slot>`;
    const { rows, file } = parseDiff(this._source);
    const maxNo = Math.max(1, ...rows.map((r) => Math.max(r.oldNo ?? 0, r.newNo ?? 0)));
    const width = String(maxNo).length;
    return html`
      ${this._header(this.file ?? file)}
      <div class="lines" style=${`--pk-num: calc(${width}ch + 0.9rem); --pk-gutter: calc(${width * 2}ch + 3.2rem)`}>
        ${rows.map((r, i) => {
          if (r.kind === 'hunk') return html`<div class="row hunk"><span class="code">${r.text}</span></div>`;
          const sign = r.kind === 'add' ? '+' : r.kind === 'del' ? '−' : ' ';
          const slots = [];
          if (r.newNo !== undefined) slots.push(`new-${r.newNo}`);
          if (r.kind === 'del') slots.push(`old-${r.oldNo}`);
          return html`
            <div class="row ${r.kind}">
              <span class="num">${r.oldNo ?? ''}</span>
              <span class="num">${r.newNo ?? ''}</span>
              <span class="sign">${sign}</span>
              <span class="code">${this._renderTokens(i, r.code)}</span>
            </div>
            ${this._notes(slots)}`;
        })}
      </div>
      ${this._orphans()}`;
  }
}

customElements.define('pk-code', PkCode);
customElements.define('pk-diff', PkDiff);
