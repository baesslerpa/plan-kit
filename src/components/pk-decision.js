import { LitElement, html, css } from 'lit';
import { badgeStyles, formatDate, statusInfo } from './shared.js';

/**
 * <pk-decision id="kurze-verbphrase" status="proposed|accepted|superseded" date="YYYY-MM-DD"
 *              supersedes="andere-id" follows-up="andere-id">
 *   <h4 slot="context">Kontext</h4><p slot="context">…</p>
 *   <h4 slot="decision">Entscheidung</h4><p slot="decision">…</p>
 *   <h4 slot="consequences">Konsequenzen</h4><p slot="consequences">…</p>
 * </pk-decision>
 *
 * ADR-light. Ohne JS bleiben Überschriften und Absätze als normales HTML lesbar.
 * Optionaler Titel über das Attribut `heading`, sonst wird die id angezeigt.
 */
export class PkDecision extends LitElement {
  static properties = {
    status: { type: String, reflect: true },
    date: { type: String },
    supersedes: { type: String },
    followsUp: { type: String, attribute: 'follows-up' },
    decisionsPath: { type: String, attribute: 'decisions-path' },
  };

  static styles = [
    badgeStyles,
    css`
      :host {
        display: block;
        margin: 0 0 1.5rem;
        background: var(--pk-card);
        border: 1px solid var(--pk-line);
        border-radius: var(--pk-radius);
        overflow: hidden;
      }
      :host([status='superseded']) { opacity: 0.75; }
      header {
        display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem 0.75rem;
        padding: 0.7rem 1.1rem;
        background: var(--pk-th);
        border-bottom: 1px solid var(--pk-line);
      }
      .kind { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pk-muted); }
      .title { font-weight: 650; margin-right: auto; }
      .id { font-family: var(--pk-mono); font-size: 0.85em; }
      time { color: var(--pk-muted); font-size: 0.85rem; }
      .refs { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; padding: 0.4rem 1.1rem; font-size: 0.85rem; color: var(--pk-muted); border-bottom: 1px solid var(--pk-line); }
      .refs a { color: var(--pk-accent); font-family: var(--pk-mono); }
      section { padding: 0.2rem 1.1rem; }
      section + section { border-top: 1px dashed var(--pk-line); }
      section[data-part='decision'] { background: var(--pk-ok-bg); }
      :host([status='proposed']) section[data-part='decision'] { background: var(--pk-warn-bg); }
      :host([status='superseded']) section[data-part='decision'] { background: transparent; }
      ::slotted(h1), ::slotted(h2), ::slotted(h3), ::slotted(h4), ::slotted(h5), ::slotted(h6) {
        font-size: 0.78rem !important;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--pk-muted);
        margin: 0.8rem 0 0.3rem !important;
        border: 0 !important;
        padding: 0 !important;
      }
      .extra ::slotted(*) { margin: 0.8rem 1.1rem; }
    `,
  ];

  constructor() {
    super();
    this.status = 'proposed';
    this.decisionsPath = '';
  }

  _ref(id) {
    // Bekannte id auf derselben Seite → Anker, sonst Datei in decisions/.
    const href = document.getElementById(id) ? `#${id}` : `${this.decisionsPath}${id}.html`;
    return html`<a href=${href}>${id}</a>`;
  }

  render() {
    const s = statusInfo(this.status);
    const title = this.getAttribute('heading');
    return html`
      <header>
        <span class="kind">Entscheidung</span>
        <span class="title">${title ? title : html`<span class="id">${this.id}</span>`}</span>
        ${this.date ? html`<time datetime=${this.date}>${formatDate(this.date)}</time>` : ''}
        <span class="badge" data-tone=${s.tone}>${s.label}</span>
      </header>
      ${this.supersedes || this.followsUp
        ? html`<div class="refs">
            ${this.supersedes ? html`<span>löst ab: ${this._ref(this.supersedes)}</span>` : ''}
            ${this.followsUp ? html`<span>folgt auf: ${this._ref(this.followsUp)}</span>` : ''}
          </div>`
        : ''}
      <section data-part="context"><slot name="context"></slot></section>
      <section data-part="decision"><slot name="decision"></slot></section>
      <section data-part="consequences"><slot name="consequences"></slot></section>
      <div class="extra"><slot></slot></div>
    `;
  }
}

customElements.define('pk-decision', PkDecision);
