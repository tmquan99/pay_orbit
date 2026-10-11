import fs from 'node:fs/promises';

// Reuse the approved mark's geometry; only the decorative background is stretched.
const source = await fs.readFile(new URL('../public/assets/brand/pay-orbit-mark.svg', import.meta.url), 'utf8');
const [upper, lower] = source.match(/<path[^>]*d="([^"]+)"/)[1].match(/M[^M]+/g);

export function footerGraphic() {
  return `<div class="footer-fold-art" aria-hidden="true"><div class="footer-fold-scene" data-footer-fold>
    <svg class="footer-fold-piece footer-fold-upper" data-footer-graphic="upper" aria-hidden="true" viewBox="40 40 176 104" preserveAspectRatio="none"><defs><linearGradient id="footer-fold-upper-color" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#64B0FF"/><stop offset=".4" stop-color="#257EEF"/><stop offset="1" stop-color="#0B438D"/></linearGradient></defs><path d="${upper}" fill="url(#footer-fold-upper-color)"/><path class="footer-fold-seam" d="${upper}"/></svg>
    <svg class="footer-fold-piece footer-fold-lower" data-footer-graphic="lower" aria-hidden="true" viewBox="40 112 176 104" preserveAspectRatio="none"><defs><linearGradient id="footer-fold-lower-color" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0A3E83"/><stop offset=".6" stop-color="#166BE0"/><stop offset="1" stop-color="#61ACFF"/></linearGradient></defs><path d="${lower}" fill="url(#footer-fold-lower-color)"/><path class="footer-fold-seam" d="${lower}"/></svg>
  </div></div>`;
}
