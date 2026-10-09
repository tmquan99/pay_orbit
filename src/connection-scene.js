/** One finite explanation; labels and the completed path are ordinary HTML/CSS. */
export function installConnectionScene(root = document) {
  const scene = root.querySelector('[data-connection-scene]');
  if (!scene) return () => {};
  const diagram = scene.querySelector('[data-connection-diagram]');
  const flow = scene.querySelector('[data-connection-flow]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 639px)');
  const animations = new Set();
  let observer;
  let played = false;
  const settle = () => {
    played = true;
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    scene.dataset.connectionPlayed = 'true';
  };
  const play = () => {
    if (played) return;
    played = true;
    observer?.disconnect();
    if (reduced.matches || document.visibilityState === 'hidden') { settle(); return; }
    const axis = compact.matches ? 'Y' : 'X';
    const animation = flow.animate([
      { transform: `scale${axis}(0)`, opacity: .45 },
      { transform: `scale${axis}(1)`, opacity: 1 },
    ], { duration: 1800, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
    animations.add(animation);
    scene.querySelectorAll('[data-connection-halo]').forEach((halo, index) => {
      const pulse = halo.animate([
        { transform: 'scale(.88)', opacity: 0 },
        { transform: 'scale(1)', opacity: .8, offset: .4 },
        { transform: 'scale(1.16)', opacity: 0 },
      ], { duration: 640, delay: index * 380, easing: 'ease-out', fill: 'backwards' });
      animations.add(pulse);
    });
    Promise.all([...animations].map(animation => animation.finished.catch(() => {}))).then(settle);
  };
  const onPreference = () => { if (reduced.matches) settle(); };
  const onVisibility = () => { if (document.visibilityState === 'hidden') settle(); };
  const onAxis = () => { if (played) settle(); };
  reduced.addEventListener('change', onPreference);
  compact.addEventListener('change', onAxis);
  document.addEventListener('visibilitychange', onVisibility);
  if (reduced.matches || !flow.animate || typeof IntersectionObserver !== 'function') settle();
  else {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) play();
    }, { threshold: .2 });
    observer.observe(diagram);
  }
  return () => {
    settle();
    reduced.removeEventListener('change', onPreference);
    compact.removeEventListener('change', onAxis);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
