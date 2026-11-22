// sitemap.xml with every page except the error page.
const pages = import.meta.glob('./**/*.astro');
export function GET({ site }) {
  const urls = Object.keys(pages)
    .map((p) => p.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/index$/, '/'))
    .filter((p) => p !== '/404')
    .map((p) => new URL(p === '/' ? '/' : `${p}/`, site).href);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
