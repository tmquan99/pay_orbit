/** Anchor links and full descriptions work without this optional reading aid. */
export function installSolutions(root = document) {
  const nav = root.querySelector('[data-solution-nav]');
  if (!nav || typeof IntersectionObserver !== 'function') return () => {};
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => root.getElementById(link.hash.slice(1))).filter(Boolean);
  let frame = 0;
  let observer;
  let readingLine = 100;
  const update = () => {
    const current = sections.findLast(section => section.getBoundingClientRect().top <= readingLine) || sections[0];
    links.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const observe = () => {
    frame = 0;
    observer?.disconnect();
    const viewportHeight = Math.max(1, innerHeight);
    // Match the foreground reading region, including short window transitions.
    const preferredLine = matchMedia('(min-width: 1024px)').matches ? Math.max(nav.getBoundingClientRect().height + 48, viewportHeight * .45) : 100;
    readingLine = Math.max(0, Math.min(viewportHeight - 1, Math.round(preferredLine)));
    observer = new IntersectionObserver(update, {
      rootMargin: `${-readingLine}px 0px ${-Math.max(0, viewportHeight - readingLine - 1)}px 0px`, threshold: 0,
    });
    sections.forEach(section => observer.observe(section));
    update();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(observe); };
  addEventListener('resize', schedule);
  addEventListener('hashchange', update);
  observe();
  return () => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    removeEventListener('resize', schedule);
    removeEventListener('hashchange', update);
  };
}
