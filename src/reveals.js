/** Visible CSS defaults; entrances are paused until their groups enter the viewport. */
export function installReferenceReveals(root = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  const elements = [...root.querySelectorAll('[data-reveal]')];
  let frame = 0;
  let observer;
  let ctaObserver;
  const observerFor = element => element.dataset.reveal === 'cta' ? ctaObserver : observer;
  const finish = element => {
    element.dataset.revealPlayed = 'true';
    observerFor(element)?.unobserve(element);
    animations.get(element)?.forEach(animation => animation.cancel());
    animations.delete(element);
  };
  if (typeof IntersectionObserver === 'function') {
    const onIntersection = entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        if (element.dataset.reveal === 'cta' && entry.intersectionRatio < .4) continue;
        observerFor(element).unobserve(element);
        element.dataset.revealPlayed = 'true';
        if (reduced.matches || document.visibilityState === 'hidden' || entry.boundingClientRect.bottom <= 0) finish(element);
        else animations.get(element)?.forEach(animation => animation.play());
      }
    };
    observer = new IntersectionObserver(onIntersection, { threshold: 0, rootMargin: '0px 0px 80px 0px' });
    // CTA motion must be seen, rather than finishing below the screen during a slow scroll.
    ctaObserver = new IntersectionObserver(onIntersection, { threshold: .4, rootMargin: '0px 0px -48px 0px' });
  }
  const stop = () => {
    observer?.disconnect();
    ctaObserver?.disconnect();
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
    const isCTA = element.dataset.reveal === 'cta';
    if (reduced.matches || !observerFor(element) || !element.animate || rect.bottom <= 0 || (!isCTA && rect.top < innerHeight) || document.visibilityState === 'hidden') {
      finish(element);
      continue;
    }
    const targets = isCTA ? [...element.querySelectorAll('h2, p, :scope > .button')] : [element];
    const transform = isCTA ? 'translateY(40px)' : element.dataset.reveal === 'slide' ? 'translateX(12px)' : element.dataset.reveal === 'media' ? 'scale(1.025)' : 'translateY(10px)';
    const group = targets.map((target, index) => {
      const animation = target.animate([{ opacity: 0, transform }, { opacity: 1, transform: 'none' }], {
        duration: Number(element.dataset.duration) || 600,
        delay: isCTA ? index * 160 : Math.min(240, Number(element.dataset.delay) || 0),
        easing: isCTA ? 'cubic-bezier(0.22, 0.68, 0.2, 1)' : 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards',
      });
      animation.pause();
      return animation;
    });
    // Keep the group alive until the last staggered item has settled.
    group.at(-1).onfinish = () => finish(element);
    animations.set(element, group);
    observerFor(element).observe(element);
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
