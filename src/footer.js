/** One visible entrance; the footer remains fully rendered without JavaScript. */
export function installFooterMotion(root = document) {
  const footer = root.querySelector('.site-footer');
  const scene = footer?.querySelector('[data-footer-fold]');
  if (!scene?.animate || footer.dataset.footerPlayed === 'true' || typeof IntersectionObserver !== 'function') return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  const settle = () => { animation?.cancel(); animation = undefined; };
  const play = () => {
    if (document.hidden || footer.dataset.footerPlayed === 'true') return;
    observer.unobserve(footer);
    footer.dataset.footerPlayed = 'true';
    if (reduced.matches) return;
    const resting = getComputedStyle(scene).transform;
    animation = scene.animate([
      { opacity: 0, transform: `translate(90px, 36px) ${resting}` },
      { opacity: 1, transform: resting },
    ], { duration: 1400, easing: 'cubic-bezier(.22,.68,.2,1)' });
    animation.onfinish = settle;
  };
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .35)) play();
  }, { threshold: .35 });
  observer.observe(footer);
  const onPreference = () => { if (reduced.matches) settle(); };
  const onVisibility = () => {
    if (document.hidden) settle();
    else {
      const rect = footer.getBoundingClientRect();
      if (Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top)) >= rect.height * .35) play();
    }
  };
  reduced.addEventListener('change', onPreference);
  document.addEventListener('visibilitychange', onVisibility);
  addEventListener('resize', settle, { passive: true });
  return () => {
    observer.disconnect();
    settle();
    reduced.removeEventListener('change', onPreference);
    document.removeEventListener('visibilitychange', onVisibility);
    removeEventListener('resize', settle);
  };
}
