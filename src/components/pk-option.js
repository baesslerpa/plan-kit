import { LitElement, html, css } from 'lit';

/**
 * <pk-options>
 *   <pk-option heading="DB-Unique-Key" selected pros="einfach;robust" cons="Migration nötig"></pk-option>
 *   <pk-option heading="Redis-Lock" pros="schnell" cons="neue Infra">Optionale Beschreibung als HTML.</pk-option>
 * </pk-options>
 *
 * Eine Karte pro Lösungsweg. pros/cons: Liste, getrennt mit „;“. `selected` markiert die Wahl.
 * <pk-options> selbst ist nur ein CSS-Grid (siehe base.css) und braucht kein JS.
 */
const split = (value) => (value ?? '').split(';').map((s) => s.trim()).filter(Boolean);

export class PkOption extends LitElement {
  static properties = {
    heading: { type: String },
    pros: { type: String },
    cons: { type: String },
    selected: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--pk-card);
      border: 1px solid var(--pk-line);
      border-radius: var(--pk-radius);
      padding: 0.8rem 1rem;
    }
    :host([selected]) {
      border: 2px solid var(--pk-accent);
      padding: calc(0.8rem - 1px) calc(1rem - 1px);
    }
    header { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem 0.6rem; margin-bottom: 0.3rem; }
    .heading { font-weight: 650; margin-right: auto; }
    .tag {
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em;
      padding: 0.1rem 0.55rem; border-radius: 99px;
      background: var(--pk-accent); color: #fff;
    }
    .body { color: var(--pk-muted); font-size: 0.93rem; }
    .body ::slotted(:last-child) { margin-bottom: 0; }
    ul { list-style: none; margin: 0.4rem 0 0; padding: 0; font-size: 0.93rem; }
    li { display: flex; gap: 0.45rem; margin: 0.15rem 0; }
    li::before { flex: none; width: 1ch; font-weight: 700; }
    .pro::before { content: '+'; color: var(--pk-ok); }
    .con::before { content: '−'; color: var(--pk-risk); }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `;

  render() {
    const pros = split(this.pros);
    const cons = split(this.cons);
    return html`
      <header>
        <span class="heading">${this.heading}</span>
        ${this.selected ? html`<span class="tag">gewählt</span>` : ''}
      </header>
      <div class="body"><slot></slot></div>
      ${pros.length || cons.length
        ? html`<ul>
            ${pros.map((p) => html`<li class="pro"><span class="sr">Vorteil: </span>${p}</li>`)}
            ${cons.map((c) => html`<li class="con"><span class="sr">Nachteil: </span>${c}</li>`)}
          </ul>`
        : ''}
    `;
  }
}

customElements.define('pk-option', PkOption);
