/** Progressive enhancement: mobile and no-JS retain the native vertical articles. */
export function installServices(root = document) {
  const nav = root.querySelector('[data-service-nav]');
  const experience = root.querySelector('[data-service-experience]');
  const track = root.querySelector('[data-service-track]');
  if (!nav || !experience || !track || typeof IntersectionObserver !== 'function') return () => {};
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => root.getElementById(link.hash.slice(1))).filter(Boolean);
  const controls = experience.querySelector('[data-service-controls]');
  const previous = controls.querySelector('[data-service-prev]');
  const next = controls.querySelector('[data-service-next]');
  const status = controls.querySelector('[data-service-status]');
  const desktop = matchMedia('(min-width: 1024px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const records = sections.map(section => ({ section, grid: section.querySelector('.service-detail-grid'), details: section.querySelector('details') }));
  let observer;
  let frame = 0;
  let horizontal = false;
  let pending = null;
  let manual = false;
  let internalHash = false;
  let readingLine = 100;
  let current = Math.max(0, sections.findIndex(section => section.id === experience.dataset.currentService || (!experience.dataset.currentService && `#${section.id}` === location.hash)));

  const select = index => {
    current = Math.max(0, Math.min(sections.length - 1, index));
    experience.dataset.currentService = sections[current].id;
    experience.style.setProperty('--service-position', String(current / Math.max(1, sections.length - 1)));
    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      link.parentElement.toggleAttribute('data-before', i < current);
      const record = records[i];
      record.section.toggleAttribute('data-current', i === current);
      record.grid.inert = horizontal && i !== current;
      if (horizontal && i !== current) record.details.open = false;
    });
    previous.disabled = current === 0;
    next.disabled = current === sections.length - 1;
    const announcement = `${current + 1} / ${sections.length} · ${sections[current].querySelector('h2').textContent}`;
    if (status.textContent !== announcement) status.textContent = announcement;
  };
  const nearest = () => {
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    return sections.reduce((best, section, i) => {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      return distance < best.distance ? { index: i, distance } : best;
    }, { index: 0, distance: Infinity }).index;
  };
  const update = () => {
    if (horizontal) { if (pending === null) select(nearest()); }
    else select(Math.max(0, sections.findLastIndex(section => section.getBoundingClientRect().top <= readingLine + 1)));
  };
  const writeHash = (index, replace = false) => {
    if (location.hash === links[index].hash) return;
    const oldURL = location.href;
    history[replace ? 'replaceState' : 'pushState'](null, '', links[index].hash);
    internalHash = true;
    dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
    internalHash = false;
  };
  const navigate = (index, { push = true, reveal = false, instant = false } = {}) => {
    index = Math.max(0, Math.min(sections.length - 1, index));
    manual = false;
    if (push) writeHash(index);
    select(index);
    if (!horizontal) return;
    const rect = sections[index].getBoundingClientRect();
    const left = track.scrollLeft + rect.left + rect.width / 2 - track.getBoundingClientRect().left - track.clientWidth / 2;
    const behavior = instant || reduced.matches || !('onscrollend' in track) ? 'instant' : 'smooth';
    pending = Math.abs(track.scrollLeft - left) > 1 && behavior === 'smooth' ? index : null;
    track.scrollTo({ left, behavior });
    if (reveal) track.scrollIntoView({ block: 'start', behavior });
  };
  const finish = () => {
    pending = null;
    if (horizontal) {
      select(nearest());
      if (manual) writeHash(current, true);
    }
    manual = false;
  };
  const interrupt = () => {
    if (pending !== null) track.scrollTo({ left: track.scrollLeft, behavior: 'instant' });
    pending = null;
    manual = true;
  };
  const enable = () => {
    horizontal = true;
    experience.setAttribute('data-horizontal', '');
    controls.hidden = false;
    track.tabIndex = 0;
    track.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End');
    navigate(current, { push: false, instant: true });
  };
  const disable = () => {
    horizontal = false;
    pending = null;
    experience.removeAttribute('data-horizontal');
    track.removeAttribute('tabindex');
    track.removeAttribute('aria-keyshortcuts');
    controls.hidden = true;
    records.forEach(record => { record.grid.inert = false; });
  };
  const observe = () => {
    frame = 0;
    observer?.disconnect();
    if (desktop.matches && !horizontal) enable();
    else if (!desktop.matches && horizontal) disable();
    if (horizontal) {
      navigate(current, { push: false, instant: true });
      const center = Math.floor(track.clientWidth / 2);
      observer = new IntersectionObserver(update, { root: track, rootMargin: `0px ${-Math.max(0, track.clientWidth - center - 1)}px 0px ${-center}px`, threshold: 0 });
    } else {
      const height = Math.max(1, innerHeight);
      readingLine = Math.max(0, Math.min(height - 1, 100));
      observer = new IntersectionObserver(update, { rootMargin: `${-readingLine}px 0px ${-Math.max(0, height - readingLine - 1)}px 0px`, threshold: 0 });
    }
    sections.forEach(section => observer.observe(section));
    update();
  };
  const resize = () => { if (!frame) frame = requestAnimationFrame(observe); };
  const motionPreference = () => { if (horizontal && reduced.matches) navigate(current, { push: false, instant: true }); };
  const hash = () => {
    if (internalHash) return;
    const index = sections.findIndex(section => `#${section.id}` === location.hash);
    if (horizontal && index >= 0) navigate(index, { push: false });
    else update();
  };
  const click = event => {
    if (!horizontal) return;
    const anchor = event.target.closest('[data-service-nav] a, .service-explore');
    if (anchor && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const index = sections.findIndex(section => `#${section.id}` === anchor.hash);
      if (index >= 0) { event.preventDefault(); navigate(index, { reveal: true }); }
    } else if (event.target.closest('[data-service-prev]')) navigate(current - 1, { reveal: true });
    else if (event.target.closest('[data-service-next]')) navigate(current + 1, { reveal: true });
    else {
      const panel = event.target.closest('[data-service]');
      const index = sections.indexOf(panel);
      if (index >= 0 && index !== current) navigate(index);
    }
  };
  const key = event => {
    if (!horizontal || event.target !== track) return;
    const index = event.key === 'ArrowRight' ? current + 1 : event.key === 'ArrowLeft' ? current - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : null;
    if (index !== null) { event.preventDefault(); navigate(index, { reveal: true }); }
  };
  root.addEventListener('click', click);
  track.addEventListener('keydown', key);
  track.addEventListener('scrollend', finish);
  track.addEventListener('wheel', interrupt, { passive: true });
  track.addEventListener('pointerdown', interrupt, { passive: true });
  addEventListener('resize', resize);
  addEventListener('hashchange', hash);
  reduced.addEventListener('change', motionPreference);
  observe();
  return () => {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    root.removeEventListener('click', click);
    track.removeEventListener('keydown', key);
    track.removeEventListener('scrollend', finish);
    track.removeEventListener('wheel', interrupt);
    track.removeEventListener('pointerdown', interrupt);
    removeEventListener('resize', resize);
    removeEventListener('hashchange', hash);
    reduced.removeEventListener('change', motionPreference);
    if (horizontal) disable();
  };
}
