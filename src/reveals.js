/** Visible CSS defaults; only below-viewport leaf groups acquire a paused entrance. */
export function installReferenceReveals(root = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  const elements = [...root.querySelectorAll('[data-reveal]')];
  let frame = 0;
  let observer;
  const finish = element => {
    element.dataset.revealPlayed = 'true';
    observer?.unobserve(element);
    animations.get(element)?.cancel();
    animations.delete(element);
  };
  if (typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        observer.unobserve(element);
        element.dataset.revealPlayed = 'true';
        if (reduced.matches || document.visibilityState === 'hidden' || entry.boundingClientRect.bottom <= 0) finish(element);
        else animations.get(element)?.play();
      }
    }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });
  }
  const stop = () => {
    observer?.disconnect();
    elements.forEach(finish);
  };
  const onPreference = () => { if (reduced.matches) stop(); };
  const onVisibility = () => { if (document.visibilityState === 'hidden') stop(); };
  const scan = () => {
    frame = 0;
    for (const [element] of animations) {
      const rect = element.getBoundingClientRect();
      // A fast jump past a group must never leave an invisible paused animation behind.
      if (rect.bottom <= 0) finish(element);
    }
  };
  const scheduleScan = () => { if (!frame) frame = requestAnimationFrame(scan); };
  reduced.addEventListener('change', onPreference);
  document.addEventListener('visibilitychange', onVisibility);
  addEventListener('scroll', scheduleScan, { passive: true });
  addEventListener('resize', scheduleScan, { passive: true });
  for (const element of elements) {
    if (element.dataset.revealPlayed === 'true') continue;
    const rect = element.getBoundingClientRect();
    if (reduced.matches || !observer || !element.animate || rect.top < innerHeight || document.visibilityState === 'hidden') {
      finish(element);
      continue;
    }
    const transform = element.dataset.reveal === 'slide' ? 'translateX(12px)' : element.dataset.reveal === 'media' ? 'scale(1.025)' : 'translateY(10px)';
    const animation = element.animate([{ opacity: 0, transform }, { opacity: 1, transform: 'none' }], {
      duration: Number(element.dataset.duration) || 600,
      delay: Math.min(240, Number(element.dataset.delay) || 0),
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    });
    animation.pause();
    animation.onfinish = () => finish(element);
    animations.set(element, animation);
    observer.observe(element);
  }
  return () => {
    stop();
    cancelAnimationFrame(frame);
    reduced.removeEventListener('change', onPreference);
    document.removeEventListener('visibilitychange', onVisibility);
    removeEventListener('scroll', scheduleScan);
    removeEventListener('resize', scheduleScan);
  };
}
