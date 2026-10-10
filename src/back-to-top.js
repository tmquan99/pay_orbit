/** A shared scroll control; visibility follows a page marker, without scroll polling. */
export function installBackToTop(root = document) {
  const button = root.querySelector('[data-back-to-top]');
  const sentinel = root.querySelector('[data-back-to-top-sentinel]');
  if (!button || !sentinel || typeof IntersectionObserver !== 'function') return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const setVisible = visible => {
    button.toggleAttribute('data-visible', visible);
    button.inert = !visible;
    if (visible) button.dataset.visible = 'true';
  };
  const updateMarker = () => {
    const scrollable = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    // Short pages should also expose the control before reaching their footer.
    sentinel.style.top = `${Math.max(1, Math.min(560, innerHeight * .7, scrollable / 2))}px`;
  };
  const onClick = () => {
    root.querySelector('.site-header .wordmark')?.focus({ preventScroll: true });
    const request = new CustomEvent('site:scroll-to-top', { cancelable: true });
    // The existing Lenis controller handles desktop; other surfaces use native scrolling.
    if (dispatchEvent(request)) scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) setVisible(entry.boundingClientRect.top < 0);
  }, { threshold: 0 });
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(updateMarker) : null;
  setVisible(false);
  button.hidden = false;
  updateMarker();
  observer.observe(sentinel);
  resizeObserver?.observe(document.body);
  addEventListener('resize', updateMarker);
  button.addEventListener('click', onClick);
  return () => {
    observer.disconnect();
    resizeObserver?.disconnect();
    removeEventListener('resize', updateMarker);
    button.removeEventListener('click', onClick);
    setVisible(false);
    button.hidden = true;
  };
}
