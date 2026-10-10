/** Repeat only while visible; labels and the completed path remain static HTML/CSS. */
export function installConnectionScene(root = document) {
  const scene = root.querySelector('[data-connection-scene]');
  if (!scene) return () => {};
  const diagram = scene.querySelector('[data-connection-diagram]');
  const flow = scene.querySelector('[data-connection-flow]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 639px)');
  const animations = new Set();
  const supported = typeof flow.animate === 'function' && typeof IntersectionObserver === 'function';
  let visible = false;
  const cancel = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
  const createLoop = () => {
    const axis = compact.matches ? 'Y' : 'X';
    const animation = flow.animate([
      { transform: `scale${axis}(0)`, opacity: .45, offset: 0, easing: 'cubic-bezier(.22, 1, .36, 1)' },
      { transform: `scale${axis}(1)`, opacity: 1, offset: .45 },
      { transform: `scale${axis}(1)`, opacity: 1, offset: .83, easing: 'ease-out' },
      { transform: `scale${axis}(1)`, opacity: 0, offset: 1 },
    ], { duration: 4000, iterations: Infinity });
    animations.add(animation);
    scene.querySelectorAll('[data-connection-halo]').forEach((halo, index) => {
      const start = index * .095;
      const pulse = halo.animate([
        { transform: 'scale(.88)', opacity: 0, offset: 0 },
        // A shared cycle keeps the four pulses in order on every repetition.
        ...(start ? [{ transform: 'scale(.88)', opacity: 0, offset: start }] : []),
        { transform: 'scale(1)', opacity: .8, offset: start + .064, easing: 'ease-out' },
        { transform: 'scale(1.16)', opacity: 0, offset: start + .16 },
        { transform: 'scale(1.16)', opacity: 0, offset: 1 },
      ], { duration: 4000, iterations: Infinity });
      animations.add(pulse);
    });
  };
  const sync = () => {
    if (!supported || reduced.matches) { cancel(); return; }
    if (!visible || document.visibilityState === 'hidden') {
      animations.forEach(animation => animation.pause());
      return;
    }
    if (!animations.size) createLoop();
    else animations.forEach(animation => animation.play());
  };
  const onAxis = () => { cancel(); sync(); };
  reduced.addEventListener('change', sync);
  compact.addEventListener('change', onAxis);
  document.addEventListener('visibilitychange', sync);
  const observer = supported ? new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .2);
    sync();
  }, { threshold: .2 }) : null;
  observer?.observe(diagram);
  return () => {
    observer?.disconnect();
    cancel();
    reduced.removeEventListener('change', sync);
    compact.removeEventListener('change', onAxis);
    document.removeEventListener('visibilitychange', sync);
  };
}
