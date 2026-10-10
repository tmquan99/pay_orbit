/** Rebase only the published copy; local development keeps root-relative URLs. */
export function normalizeBasePath(value = '') {
  if (!value || value === '/') return '';
  const base = `/${value.replace(/^\/+|\/+$/g, '')}`;
  if (!/^\/[\w.-]+(?:\/[\w.-]+)*$/.test(base) || base.split('/').some(part => part === '.' || part === '..')) {
    throw new Error('SITE_BASE_PATH must be a local path, such as /pay_orbit');
  }
  return base;
}

export function rebaseSiteFile(source, extension, base) {
  if (!base) return source;
  const prefix = value => value.startsWith('/') && !value.startsWith('//') ? base + value : value;
  if (extension === '.html') {
    return source.replace(/(\b(?:href|src|srcset)=)(["'])(.*?)\2/gs, (match, attribute, quote, value) => {
      const rebased = attribute === 'srcset=' ? value.replace(/(^|,\s*)\/(?!\/)/g, `$1${base}/`) : prefix(value);
      return `${attribute}${quote}${rebased}${quote}`;
    });
  }
  if (extension === '.css') return source.replace(/(\burl\(\s*["']?)\/(?!\/)/g, `$1${base}/`);
  if (extension === '.js') return source.replace(/(\bimport\(\s*["'])\/(?!\/)/g, `$1${base}/`);
  if (extension === '.webmanifest') {
    const manifest = JSON.parse(source);
    if (manifest.start_url) manifest.start_url = prefix(manifest.start_url);
    if (manifest.scope) manifest.scope = prefix(manifest.scope);
    for (const icon of manifest.icons || []) icon.src = prefix(icon.src);
    return JSON.stringify(manifest, null, 2) + '\n';
  }
  return source;
}
