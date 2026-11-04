import { LitElement, html, css } from 'lit';
import { badgeStyles, statusInfo } from './shared.js';

/**
 * <pk-summary status="draft|review|approved" goal="…">TL;DR als normales HTML</pk-summary>
 *
 * Kopf des Plans. Zeigt Ziel, Status und TL;DR und sammelt alle
 * <aside data-kind="question"> der Seite als Sprungliste „Offene Fragen“.
 */
export class PkSummary extends LitElement {
  static properties = {
    status: { type: String, reflect: true },
    goal: { type: String },
    _questions: { state: true },
  };

  static styles = [
    badgeStyles,
    css`
      :host {
        display: block;
        margin: 0 0 1.5rem;
        background: var(--pk-card);
        border: 1px solid var(--pk-line);
        border-left: 5px solid var(--pk-accent);
        border-radius: var(--pk-radius);
        padding: 1rem 1.25rem;
      }
      header { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; margin-bottom: 0.4rem; }
      .label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pk-muted); }
      .goal { font-size: 1.2rem; font-weight: 650; line-height: 1.3; margin: 0 0 0.5rem; }
      .body ::slotted(:last-child) { margin-bottom: 0; }
      .questions { margin-top: 0.8rem; padding-top: 0.6rem; border-top: 1px dashed var(--pk-line); font-size: 0.92rem; }
      .questions b { color: var(--pk-warn); }
      .questions ol { margin: 0.3rem 0 0; padding-left: 1.3rem; }
      .questions a { color: inherit; }
    `,
  ];

  constructor() {
    super();
    this.status = 'draft';
    this._questions = [];
  }

  connectedCallback() {
    super.connectedCallback();
    // Erst nach dem Parsen der ganzen Seite sammeln.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._collectQuestions(), { once: true });
    } else {
      queueMicrotask(() => this._collectQuestions());
    }
  }

  _collectQuestions() {
    const asides = [...document.querySelectorAll('aside[data-kind="question"]')];
    this._questions = asides.map((el, i) => {
      if (!el.id) el.id = `frage-${i + 1}`;
      return { id: el.id, text: el.textContent.trim().replace(/\s+/g, ' ') };
    });
  }

  render() {
    const s = statusInfo(this.status);
    const q = this._questions;
    return html`
      <header>
        <span class="label">Plan</span>
        <span class="badge" data-tone=${s.tone}>${s.label}</span>
      </header>
      ${this.goal ? html`<p class="goal">${this.goal}</p>` : ''}
      <div class="body"><slot></slot></div>
      ${q.length
        ? html`<div class="questions">
            <b>${q.length === 1 ? '1 offene Frage' : `${q.length} offene Fragen`}</b>
            <ol>${q.map((x) => html`<li><a href="#${x.id}">${x.text}</a></li>`)}</ol>
          </div>`
        : ''}
    `;
  }
}

customElements.define('pk-summary', PkSummary);
