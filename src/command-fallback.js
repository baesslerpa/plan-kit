/**
 * Minimaler Fallback für Invoker-Commands (commandfor/command) in Browsern ohne native Unterstützung.
 * Deckt nur Dialoge und Popover ab:
 *   <button commandfor="d1" command="show-modal">…</button>
 *   <button commandfor="d1" command="close">…</button>
 *   <button commandfor="p1" command="toggle-popover">…</button>
 */
export function installCommandFallback() {
  if ('command' in HTMLButtonElement.prototype) return;
  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('button[commandfor]');
    if (!button) return;
    const target = document.getElementById(button.getAttribute('commandfor'));
    if (!target) return;
    const command = button.getAttribute('command');
    switch (command) {
      case 'show-modal': target.showModal?.(); break;
      case 'close': target.close?.(); break;
      case 'request-close': (target.requestClose ?? target.close)?.call(target); break;
      case 'toggle-popover': target.togglePopover?.(); break;
      case 'show-popover': target.showPopover?.(); break;
      case 'hide-popover': target.hidePopover?.(); break;
    }
  });
}
