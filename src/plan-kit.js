/**
 * plan-kit – Einstiegspunkt.
 * Bindet das Classless-Basis-Stylesheet in die Seite ein und registriert die Komponenten.
 *
 *   <link rel="stylesheet" href="…/plan-kit/<version>/plan-kit.css">   (optional: Styling auch ohne JS)
 *   <script type="module" src="…/plan-kit/<version>/plan-kit.js"></script>
 */
import baseCss from './base.css';
import tokenCss from './lib/tokens.css';
import './components/pk-summary.js';
import './components/pk-decision.js';
import './components/pk-option.js';
import './components/pk-code.js';
import './components/pk-diagram.js';
import { highlightNativeCode } from './lib/native-code.js';
import { installCommandFallback } from './command-fallback.js';

export const VERSION = __PK_VERSION__;

function installBaseStyles() {
  // Schon vorhanden (doppelt eingebunden oder per <link href="…/plan-kit.css">)? Dann nichts tun.
  if (document.querySelector('style[data-plan-kit], link[rel="stylesheet"][href$="plan-kit.css"]')) return;
  const style = document.createElement('style');
  style.dataset.planKit = VERSION;
  style.textContent = baseCss + tokenCss;
  // Vor alle anderen Styles, damit eigene Overrides der Seite gewinnen.
  document.head.prepend(style);
}

installBaseStyles();
installCommandFallback();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', highlightNativeCode, { once: true });
} else {
  highlightNativeCode();
}
