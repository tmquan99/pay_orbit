/** Optional finite-state motion for the shared connection and technology graphics. */
export function installHeroGraphics(root = document) {
  const graphic = root.querySelector('[data-hero-graphic]');
  if (!graphic || typeof IntersectionObserver !== 'function' || !Element.prototype.animate) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let animations = [];
  const create = () => {
    if (graphic.dataset.heroGraphic === 'connection') {
      animations = [...graphic.querySelectorAll('[data-connection-signal]')].map((path, index) => {
        const start = index * .34;
        const end = start + .28;
        return path.animate([
          { strokeDashoffset: 13, opacity: 0, offset: 0 },
          { strokeDashoffset: 13, opacity: 0, offset: start },
          { strokeDashoffset: 10, opacity: 1, offset: start + .02 },
          { strokeDashoffset: -100, opacity: 1, offset: end - .02 },
          { strokeDashoffset: -113, opacity: 0, offset: end },
          { strokeDashoffset: -113, opacity: 0, offset: 1 },
        ], { duration: 6000, iterations: Infinity, fill: 'both' });
      });
      animations.push(graphic.querySelector('[data-connection-firewall]').animate([
        { opacity: 0, transform: 'scale(.85)', offset: 0 },
        { opacity: 0, transform: 'scale(.85)', offset: .28 },
        { opacity: .5, transform: 'scale(1)', offset: .31 },
        { opacity: 0, transform: 'scale(1.12)', offset: .38 },
        { opacity: 0, transform: 'scale(1.12)', offset: 1 },
      ], { duration: 6000, iterations: Infinity }));
    } else {
      const modules = [...graphic.querySelectorAll('[data-technology-module]')];
      const style = getComputedStyle(graphic);
      const rest = { backgroundColor: style.getPropertyValue('--surface').trim(), borderColor: style.getPropertyValue('--divider').trim(), transform: 'translateY(0)', boxShadow: '0 0 0 rgb(0 58 147 / 0)' };
      const selected = { backgroundColor: style.getPropertyValue('--surface-alt').trim(), borderColor: '#84AFF1', transform: 'translateY(-4px)', boxShadow: '0 6px 12px rgb(0 58 147 / .10)' };
      animations = modules.map((module, index) => {
        const start = index / modules.length;
        const step = 1 / modules.length;
        return module.animate([
          { ...rest, offset: 0 },
          { ...rest, offset: start, easing: 'ease-in-out' },
          { ...selected, offset: start + step * .2 },
          { ...selected, offset: start + step * .7, easing: 'ease-in-out' },
          { ...rest, offset: start + step * .95 },
          { ...rest, offset: 1 },
        ], { duration: modules.length * 1500, iterations: Infinity });
      });
    }
    const startTime = document.timeline.currentTime;
    animations.forEach(animation => { animation.startTime = startTime; });
  };
  const sync = () => {
    if (reduced.matches) { animations.forEach(animation => animation.cancel()); animations = []; return; }
    if (!visible || document.visibilityState === 'hidden') { animations.forEach(animation => animation.pause()); return; }
    if (!animations.length) create();
    else animations.forEach(animation => animation.play());
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .15);
    sync();
  }, { threshold: .15 });
  observer.observe(graphic);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  return () => {
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
    reduced.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  };
}
