/**
 * Lightweight inline SVG replacement for <i class="fa-..."> tags.
 * Drops the FontAwesome CDN dependency so the demo is fully self-contained.
 * Scans for <i class="fa-...">, swaps in an inline SVG, and watches for
 * dynamically inserted icons via a MutationObserver.
 */
(function () {
  'use strict';

  const ICONS = {
    'fa-arrow-right':   '<path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/>',
    'fa-arrow-up':      '<path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"/>',
    'fa-arrow-up-right':'<path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M5 19L19 5m0 0H8.5M19 5v10.5"/>',
    'fa-check':         '<path stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M4.5 12.75l6 6 9-13.5"/>',
    'fa-circle-check':  '<path fill="currentColor" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 8.03l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06l1.72 1.72 4.72-4.72a.75.75 0 011.06 1.06z"/>',
    'fa-rotate-right':  '<path stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.66-4.348a8.25 8.25 0 0114.66-2.34l3.04 3.04m-17.7 6.348l3.04 3.04a8.25 8.25 0 0014.66-2.34"/>',
    'fa-rotate-left':   '<path stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-4.5"/>',
    'fa-shirt':         '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M8.25 3.5L4 6 2.4 9.4l3 1.45.6-1.2v11.35h12V9.65l.6 1.2 3-1.45L19.75 6 15.5 3.5l-1.1 1.15a3.4 3.4 0 01-5 0L8.25 3.5z"/>',
    'fa-wand-magic-sparkles': '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>',
    'fa-ruler':         '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M3 8.25h18v7.5H3v-7.5zM6.75 8.25v2.4M10.5 8.25v3.6M14.25 8.25v2.4M18 8.25v3.6"/>',
    'fa-coins':         '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M2.25 6.75h19.5v10.5H2.25zM12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM5.4 9.75h.01M18.6 14.25h.01"/>',
    'fa-bag-shopping':  '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12A1.125 1.125 0 0119.748 21H4.252a1.125 1.125 0 01-1.121-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>',
    'fa-tag':           '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke="currentColor" stroke-width="1.6" fill="none" d="M6 6.008V6"/>',
    'fa-truck':         '<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M8.25 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.25 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8.25 18.75h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v11.25m0-9h3.166c.66 0 1.282.31 1.68.836l2.04 2.7c.26.344.401.764.401 1.196v3.293c0 .621-.504 1.125-1.125 1.125H17.25"/>',
    'fa-bullseye':      '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
    'fa-phone':         '<path fill="currentColor" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>',
    'fa-message':       '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>',
    'fa-box':           '<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>',
    'fa-envelope':      '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>',
    'fa-envelope-open': '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98v9.766z"/>',
    'fa-star':          '<path fill="currentColor" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>',
    'fa-instagram':     '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M7.5 2.75h9A4.75 4.75 0 0121.25 7.5v9a4.75 4.75 0 01-4.75 4.75h-9A4.75 4.75 0 012.75 16.5v-9A4.75 4.75 0 017.5 2.75zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>',
    'fa-location-dot':  '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>',
    'fa-bolt':          '<path fill="currentColor" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"/>',
    'fa-heart':         '<path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>',
  };

  function svgFor(classList) {
    for (const cls of classList) if (ICONS[cls]) return ICONS[cls];
    return null;
  }

  function replaceIcon(i) {
    if (i.dataset.faSwapped === '1') return;
    const inner = svgFor(i.classList);
    if (!inner) return;
    i.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="width:1em;height:1em;display:inline-block;vertical-align:-0.125em;">${inner}</svg>`;
    i.style.display = 'inline-flex';
    i.style.alignItems = 'center';
    i.style.justifyContent = 'center';
    i.dataset.faSwapped = '1';
  }

  function scan(root) {
    (root || document).querySelectorAll('i[class*="fa-"]').forEach(replaceIcon);
  }

  function start() {
    scan(document);
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches('i[class*="fa-"]')) replaceIcon(node);
          if (node.querySelectorAll) scan(node);
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
