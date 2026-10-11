(() => {
  const script = document.currentScript;
  const home = new URL('../', script.src);
  const preferenceKey = `pay-orbit-language:${home.pathname}`;
  const current = new URL(location.href);
  let preference;
  try { preference = localStorage.getItem(preferenceKey); } catch {}

  // Run before rendering the Vietnamese home to avoid a language flash.
  // Explicit deep links retain their language; the site entry defaults to EN.
  if (script.hasAttribute('data-default-entry') && preference !== 'vi' && current.searchParams.get('lang') !== 'vi') {
    const destination = new URL(document.querySelector('link[hreflang="en"]').href);
    destination.search = current.search;
    destination.hash = current.hash;
    location.replace(destination.href);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-language]');
    if (!link || event.defaultPrevented) return;
    try {
      localStorage.setItem(preferenceKey, link.dataset.language);
    } catch {
      // The explicit VI home choice must also work when storage is unavailable.
      const destination = new URL(link.href);
      if (link.dataset.language === 'vi' && destination.pathname === home.pathname) {
        destination.searchParams.set('lang', 'vi');
        link.href = destination.href;
      }
    }
  });
})();
