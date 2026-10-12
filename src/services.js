export function installServices() {
  const nav = document.querySelector('[data-service-nav]');
  if (!nav) return () => {};
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  let pending = 0;
  function update() {
    pending = 0;
    const line = getComputedStyle(nav).position === 'sticky' ? nav.offsetHeight + 32 : 100;
    let current = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= line) current = index; });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) current = sections.length - 1;
    links.forEach((link, index) => index === current ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
  }
  const schedule = () => { if (!pending) pending = requestAnimationFrame(update); };
  ['scroll', 'resize', 'hashchange'].forEach(event => window.addEventListener(event, schedule, { passive: true }));
  document.addEventListener('toggle', schedule, true);
  update();
  return () => {
    cancelAnimationFrame(pending);
    ['scroll', 'resize', 'hashchange'].forEach(event => window.removeEventListener(event, schedule));
    document.removeEventListener('toggle', schedule, true);
  };
}
