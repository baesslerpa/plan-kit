/**
 * Syntax-Highlighting mit TanStack Highlight (klein, synchron, klassenbasiert).
 * Highlighter und Sprachen liegen in einem eigenen Chunk (~11 kB gzip), der erst geladen wird,
 * wenn eine Seite Code mit Sprachangabe enthält. Farben kommen aus tokens.css (--pk-tok-*).
 */

let modulePromise;
const load = () => (modulePromise ??= import('./highlighter.js').then((m) => m.highlighter));

/**
 * Zerlegt Code in Zeilen aus Tokens: [[{ content, kind }]] – kind ist die Token-Klasse
 * (keyword, string, comment …) oder undefined. Liefert null bei unbekannter Sprache.
 */
export async function tokenize(code, lang) {
  if (!lang) return null;
  try {
    const hl = await load();
    const name = hl.normalizeLanguage(lang);
    if (!hl.listLanguages().includes(name)) return null;
    const lines = [[]];
    for (const token of hl.tokenize(code, { lang: name }).tokens) {
      token.value.split('\n').forEach((part, i) => {
        if (i > 0) lines.push([]);
        if (part) lines.at(-1).push({ content: part, kind: token.className });
      });
    }
    return lines;
  } catch (err) {
    console.warn(`plan-kit: Highlighting für „${lang}“ fehlgeschlagen`, err);
    return null;
  }
}
