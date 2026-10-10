/** Product motion stays inside existing illustration/icon frames. */
export function installProducts(root = document) {
  const page = root.querySelector('[data-products]');
  if (!page || typeof IntersectionObserver !== 'function' || !Element.prototype.animate) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...page.querySelectorAll('.product-card')];
  const sections = [...page.querySelectorAll('.product-section')];
  const links = [...page.querySelectorAll('.vendor-summary')];
  const visible = new Set();
  const iconAnimations = new Map();
  let readingObserver;
  let resizeFrame = 0;
  const stopIcons = () => {
    iconAnimations.forEach((animations, card) => {
      card.removeAttribute('data-product-animating');
      animations.forEach(animation => animation.cancel());
    });
    iconAnimations.clear();
  };
  const playIcon = card => {
    if (reduced.matches || document.visibilityState === 'hidden' || iconAnimations.has(card)) return;
    const kind = card.dataset.productKind;
    const shapes = [...card.querySelectorAll('.icon-badge .icon > :is(path,rect,circle,polygon,polyline)')];
    const animations = shapes.map((shape, index) => {
      let frames;
      if (kind === 'wireless') frames = [{ transform: 'scale(.8)', opacity: .25 }, { transform: 'scale(1)', opacity: 1 }];
      else if (kind === 'cloud-security' && index === shapes.length - 1) frames = [{ transform: 'rotate(-35deg)', opacity: .4 }, { transform: 'rotate(0deg)', opacity: 1 }];
      else if ((kind === 'routing' && shape.tagName === 'circle') || kind === 'security-operations') frames = [{ opacity: 1 }, { opacity: .3, offset: .35 }, { opacity: 1 }];
      else {
        const length = shape.getTotalLength();
        // The camera uses the same line drawing as the other outline icons.
        // Keep both outlines equally bright and in sync instead of blinking.
        frames = [{ strokeDasharray: `${length}`, strokeDashoffset: length, opacity: kind === 'collaboration' ? 1 : .4 }, { strokeDasharray: `${length}`, strokeDashoffset: 0, opacity: 1 }];
      }
      return shape.animate(frames, { duration: 520, delay: kind === 'collaboration' ? 0 : Math.min(index * 70, 280), easing: 'cubic-bezier(.22,1,.36,1)' });
    });
    card.setAttribute('data-product-animating', '');
    iconAnimations.set(card, animations);
    Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => {
      if (iconAnimations.get(card) !== animations) return;
      iconAnimations.delete(card);
      card.removeAttribute('data-product-animating');
      animations.forEach(animation => animation.cancel());
    });
  };
  const syncIcons = () => { if (reduced.matches || document.visibilityState === 'hidden') stopIcons(); };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
      if (isIntersecting && intersectionRatio >= .15) visible.add(target);
      else visible.delete(target);
      if (visible.has(target) && !target.hasAttribute('data-product-seen')) {
        target.setAttribute('data-product-seen', 'true');
        if (target.matches('.product-card')) playIcon(target);
      }
    });
  }, { threshold: .15 });
  [...cards, ...sections].forEach(element => observer.observe(element));
  const updateReading = () => {
    const current = sections.findLast(section => section.getBoundingClientRect().top <= innerHeight * .35) || sections[0];
    links.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const observeReading = () => {
    resizeFrame = 0;
    readingObserver?.disconnect();
    const line = Math.max(0, Math.min(innerHeight - 1, Math.round(innerHeight * .35)));
    readingObserver = new IntersectionObserver(updateReading, { rootMargin: `${-line}px 0px ${-Math.max(0, innerHeight - line - 1)}px 0px` });
    sections.forEach(section => readingObserver.observe(section));
    updateReading();
  };
  const onResize = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(observeReading); };
  const onEnter = event => { if (pointer.matches && event.pointerType === 'mouse') playIcon(event.currentTarget); };
  const onFocus = event => { if (!event.currentTarget.contains(event.relatedTarget)) playIcon(event.currentTarget); };
  cards.forEach(card => { card.addEventListener('pointerenter', onEnter); card.addEventListener('focusin', onFocus); });
  reduced.addEventListener('change', syncIcons);
  document.addEventListener('visibilitychange', syncIcons);
  addEventListener('resize', onResize, { passive: true });
  observeReading();
  return () => {
    observer.disconnect();
    readingObserver?.disconnect();
    cancelAnimationFrame(resizeFrame);
    stopIcons();
    cards.forEach(card => { card.removeEventListener('pointerenter', onEnter); card.removeEventListener('focusin', onFocus); });
    reduced.removeEventListener('change', syncIcons);
    document.removeEventListener('visibilitychange', syncIcons);
    removeEventListener('resize', onResize);
    links.forEach(link => link.removeAttribute('aria-current'));
  };
}
