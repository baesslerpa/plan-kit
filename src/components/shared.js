import { css } from 'lit';

/** Statusfarben, gemeinsam für pk-summary und pk-decision. */
export const STATUS = {
  draft: { label: 'Entwurf', tone: 'muted' },
  review: { label: 'Im Review', tone: 'warn' },
  approved: { label: 'Freigegeben', tone: 'ok' },
  proposed: { label: 'Vorgeschlagen', tone: 'warn' },
  accepted: { label: 'Akzeptiert', tone: 'ok' },
  superseded: { label: 'Abgelöst', tone: 'muted' },
};

export const statusInfo = (status) =>
  STATUS[status] ?? { label: status || 'ohne Status', tone: 'muted' };

/** Formatiert ein ISO-Datum (YYYY-MM-DD) als deutsches Datum, ohne Zeitzonen-Verschiebung. */
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return m ? `${Number(m[3])}.${Number(m[2])}.${m[1]}` : iso ?? '';
}

export const badgeStyles = css`
  .badge {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    padding: 0.15rem 0.6rem;
    border-radius: 99px;
    white-space: nowrap;
    color: var(--pk-bg);
    background: var(--pk-muted);
  }
  .badge[data-tone='ok'] { background: var(--pk-ok); }
  .badge[data-tone='warn'] { background: var(--pk-warn); }
  .badge[data-tone='risk'] { background: var(--pk-risk); }
`;
