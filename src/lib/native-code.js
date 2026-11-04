import { tokenize } from './highlight.js';

/**
 * Färbt native Code-Blöcke ein: <pre data-language="ts"><code>…</code></pre>
 * (nicht innerhalb von pk-code/pk-diff, die färben selbst). Lädt den Highlighter nur bei Bedarf.
 */
export async function highlightNativeCode() {
  const blocks = [...document.querySelectorAll('pre[data-language]')].filter((pre) => !pre.closest('pk-code, pk-diff'));
  await Promise.all(
    blocks.map(async (pre) => {
      const target = pre.querySelector(':scope > code') ?? pre;
      const source = target.textContent.replace(/^\r?\n/, '').replace(/\s+$/, '');
      const lines = await tokenize(source, pre.dataset.language);
      if (!lines) return;
      const frag = document.createDocumentFragment();
      lines.forEach((line, i) => {
        if (i) frag.append('\n');
        for (const t of line) {
          if (!t.kind) {
            frag.append(t.content);
            continue;
          }
          const span = document.createElement('span');
          span.dataset.t = t.kind;
          span.textContent = t.content;
          frag.append(span);
        }
      });
      target.replaceChildren(frag);
    }),
  );
}
