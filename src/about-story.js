/** Scroll selects a chapter; CSS handles the scene. No scroll listener or wheel interception. */
export function installAboutStory(root = document) {
  const story = root.querySelector('[data-about-story]');
  const scene = story?.querySelector('[data-story-desktop]');
  const chapters = story ? [...story.querySelectorAll('[data-story-chapter]')] : [];
  if (!scene || chapters.length < 2) return () => {};
  const desktop = matchMedia('(min-width: 1024px) and (min-height: 680px)');
  const mobile = matchMedia('(max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const copies = chapters.map(chapter => chapter.querySelector('.story-chapter-copy')).filter(Boolean);
  const mobileAnimations = new Map();
  let mobileObserver;
  let observer;
  let resizeFrame = 0;
  const cancelTransitions = () => scene.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  const stopMobile = () => {
    mobileObserver?.disconnect();
    mobileAnimations.forEach(animation => animation.cancel());
    mobileAnimations.clear();
  };
  const configureMobile = () => {
    if (!mobile.matches || reduced.matches || document.visibilityState === 'hidden' || typeof IntersectionObserver !== 'function') return;
    mobileObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const copy = entry.target;
        mobileObserver.unobserve(copy);
        copy.dataset.storyMobilePlayed = 'true';
        if (!mobile.matches || entry.boundingClientRect.bottom <= 0 || reduced.matches || document.visibilityState === 'hidden' || typeof copy.animate !== 'function') continue;
        const animation = copy.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        mobileAnimations.set(copy, animation);
        animation.onfinish = () => { mobileAnimations.delete(copy); animation.cancel(); };
      }
    }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });
    copies.forEach(copy => {
      if (copy.dataset.storyMobilePlayed === 'true') return;
      if (copy.getBoundingClientRect().top < innerHeight) copy.dataset.storyMobilePlayed = 'true';
      else mobileObserver.observe(copy);
    });
  };
  const selectChapter = (instant = false) => {
    const center = innerHeight / 2;
    const rects = chapters.map(chapter => chapter.getBoundingClientRect());
    const containing = rects.findIndex(rect => rect.top <= center && rect.bottom > center);
    const distances = rects.map(rect => Math.abs((rect.top + rect.bottom) / 2 - center));
    const bounds = story.getBoundingClientRect();
    // Match the observer's reading band so the opening chapter is selected on entry.
    const edge = Math.floor(innerHeight * .48);
    const index = bounds.top >= innerHeight - edge || bounds.bottom <= edge ? -1 : containing === -1 ? distances.indexOf(Math.min(...distances)) : containing;
    chapters.forEach((chapter, position) => { chapter.dataset.storyCurrent = String(position === index); });
    if (index === -1 || !story.hasAttribute('data-story-enhanced')) return;
    if (instant || document.visibilityState === 'hidden') scene.dataset.storyInstant = 'true';
    scene.dataset.storyStage = String(index);
    scene.querySelectorAll('[data-story-copy]').forEach(copy => { copy.hidden = copy.dataset.storyCopy !== String(index); });
    scene.querySelectorAll('[data-story-detail]').forEach(detail => { detail.hidden = detail.dataset.storyDetail !== String(index); });
    if (scene.hasAttribute('data-story-instant')) {
      cancelTransitions();
      // Commit the final style before restoring transitions after a resize/preference change.
      getComputedStyle(scene.querySelector('[data-story-flow]')).transform;
      if (document.visibilityState !== 'hidden') delete scene.dataset.storyInstant;
    }
  };
  const configure = () => {
    observer?.disconnect();
    stopMobile();
    scene.dataset.storyInstant = 'true';
    cancelTransitions();
    if (typeof IntersectionObserver !== 'function') {
      delete story.dataset.storyEnhanced;
      chapters.forEach(chapter => { delete chapter.dataset.storyCurrent; });
      return;
    }
    if (desktop.matches && !reduced.matches) story.dataset.storyEnhanced = 'true';
    else delete story.dataset.storyEnhanced;
    configureMobile();
    selectChapter(true);
    // Pixel margins use viewport height; percentage IO margins resolve against width.
    const margin = Math.floor(innerHeight * .48);
    observer = new IntersectionObserver(() => selectChapter(), { rootMargin: `-${margin}px 0px -${margin}px 0px`, threshold: 0 });
    chapters.forEach(chapter => observer.observe(chapter));
  };
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(configure);
  };
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      scene.dataset.storyInstant = 'true';
      cancelTransitions();
      stopMobile();
    } else configure();
  };
  desktop.addEventListener('change', configure);
  mobile.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  configure();
  return ({ preserveLayout = false } = {}) => {
    observer?.disconnect();
    stopMobile();
    cancelAnimationFrame(resizeFrame);
    scene.dataset.storyInstant = 'true';
    cancelTransitions();
    // BFCache freezes this DOM: keep its geometry so Back preserves the reading position.
    if (!preserveLayout) {
      delete story.dataset.storyEnhanced;
      chapters.forEach(chapter => { delete chapter.dataset.storyCurrent; });
    }
    desktop.removeEventListener('change', configure);
    mobile.removeEventListener('change', configure);
    reduced.removeEventListener('change', configure);
    removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
