/** Desktop wheel enhancement; touch, keyboard and nested horizontal scrolling stay native. */
export function installSmoothScroll() {
  const desktop = matchMedia('(min-width: 1024px) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const native = new URLSearchParams(location.search).get('scroll') === 'native';
  let instance;
  let generation = 0;
  let disposed = false;

  const interrupt = () => instance?.scrollTo(scrollY, { immediate: true });
  const pointer = () => interrupt();
  const key = () => interrupt();
  const click = event => {
    // Let the browser keep anchor history, focus and existing per-page navigation.
    if (event.target.closest?.('a[href]')) interrupt();
  };
  const onScrollToTop = event => {
    if (!instance || reduced.matches) return;
    event.preventDefault();
    instance.scrollTo(0, { duration: .9, easing: progress => 1 - (1 - progress) ** 3 });
  };
  const configure = async () => {
    const token = ++generation;
    instance?.destroy();
    instance = undefined;
    if (disposed || native || !desktop.matches || reduced.matches) return;
    try {
      const { default: Lenis } = await import('/assets/vendor/lenis/lenis.js');
      if (disposed || token !== generation) return;
      instance = new Lenis({
        autoRaf: true,
        lerp: .18,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
        // A horizontal trackpad gesture belongs to the native service carousel.
        virtualScroll: ({ deltaX, deltaY, event }) => !event.shiftKey && Math.abs(deltaY) > Math.abs(deltaX),
        prevent: node => node.matches('textarea, select, [contenteditable], [data-native-scroll]'),
      });
      // Lenis 1.3.26 captures scrollend from nested scrollers too. Keep native
      // carousel completion events available for its hash/progress navigation.
      const onRootScrollEnd = instance.onScrollEnd;
      removeEventListener('scrollend', onRootScrollEnd, true);
      instance.onScrollEnd = event => {
        if (event.target === document || event.target === window) onRootScrollEnd(event);
      };
      addEventListener('scrollend', instance.onScrollEnd, true);
    } catch {
      // An unavailable enhancement must never prevent the page from scrolling.
    }
  };
  desktop.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  addEventListener('pointerdown', pointer, { capture: true, passive: true });
  addEventListener('keydown', key, true);
  addEventListener('click', click, true);
  addEventListener('hashchange', interrupt);
  addEventListener('site:scroll-to-top', onScrollToTop);
  configure();
  return () => {
    disposed = true;
    ++generation;
    instance?.destroy();
    desktop.removeEventListener('change', configure);
    reduced.removeEventListener('change', configure);
    removeEventListener('pointerdown', pointer, true);
    removeEventListener('keydown', key, true);
    removeEventListener('click', click, true);
    removeEventListener('hashchange', interrupt);
    removeEventListener('site:scroll-to-top', onScrollToTop);
  };
}
