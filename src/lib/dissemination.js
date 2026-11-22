// Publications and Presentations come from two published Google Sheets (MPM_publications
// and MPM_lectures, filled in the sheets themselves or through the Content Desk).
// Used when the site is built and again in the visitor's browser, which reads the sheets
// live, so a new row shows without waiting for the daily rebuild. Same system as SAMuSe.

// "File > Share > Publish to web > CSV" addresses. Empty = use the copy in src/data.
export const SHEETS = {
  publications: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT93gGh1YybD7zTG7prs44Tjq0X6Y33AKu7uwpCCnlyy5nJ8qn9dAxo9XuFzMkaG1qIT5jyCMWyLHSE/pub?output=csv',
  lectures: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2poAiG1Jh652pnVAGU5QzCdWNVNsCpGrmOCKM0cTKWT_Pj-GqhikmQbihgHKQ0ZoxdNHJrtlOs_TB/pub?output=csv',
};
// To edit (Content Desk): MPM_publications 1XzFlQb6wZdK1MYa2h0B0B8JdzeLnWqyo2yS2Dd5hQ9M (gid 1806087880),
// MPM_lectures 1Nejw_CDe5CnuhWY_-pEUAiHvLlUdhcrtLwy21jniL2o (gid 823936320).

export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const head = (rows.shift() || []).map((h) => h.trim().toLowerCase());
  return rows
    .filter((r) => r.some((v) => v.trim() !== ''))
    .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])))
    .filter((r) => !/^(no|n|false|0)$/i.test(r.publish || ''));
}

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// *text* in the sheet means italics.
const stars = (s) => esc(s).replace(/\*([^*]+)\*/g, '<i>$1</i>');

const link = (href, text) => {
  const ext = /^https?:/i.test(href);
  return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
};
const end = (s) => (/[.!?"”]$/.test(s) ? s : s + '.');
const typeOf = (r) => String(r.type || '').toLowerCase();

// ---------- publications ----------

function publication(r) {
  let venue = '';
  if (r.venue) {
    const italic = /journal/.test(typeOf(r)) && !/\*/.test(r.venue);
    venue = italic ? `<i>${esc(r.venue)}</i>` : stars(r.venue);
    if (r.details) venue += (/^\(/.test(r.details) ? ' ' : ', ') + stars(r.details);
    venue = ' ' + end(venue);
  }
  const year = r.status && !/^published$/i.test(r.status) ? r.status : (r.year || 'n.d.');
  let out = `${esc(r.authors)} (${esc(year)}). ${end(stars(r.title))}${venue}`;
  if (r.doi) {
    const url = /^https?:/.test(r.doi) ? r.doi : 'https://doi.org/' + r.doi;
    out += ' ' + link(url, esc(url));
  } else if (r.url) out += ' ' + link(r.url, esc(r.url));
  return `<p class="item">${out}</p>`;
}

// The sections of the Weebly page, in its order; a new section in the sheet goes last.
export const SECTION_ORDER = ['In preparation', 'International peer-reviewed journals',
  'Peer-reviewed international conference proceedings', 'Book chapters', 'Other publications', 'PhD thesis'];
export const TYPE_ORDER = ['journal article', 'book', 'book chapter', 'conference paper',
  'professional article', 'report', 'thesis'];
export const TYPE_LABEL = {
  'journal article': 'Journal articles',
  book: 'Books',
  'book chapter': 'Book chapters',
  'conference paper': 'Conference papers',
  'professional article': 'Professional and practitioner articles',
  report: 'Reports',
  thesis: 'Theses',
};
const rank = (list, k) => (list.indexOf(k) + 1) || 99;
// Newest year first; within a year the order of the sheet stays.
const byYear = (a, b) => (parseInt(b.year, 10) || 9999) - (parseInt(a.year, 10) || 9999);

// Grouped list: mode 'section' (as on the old site), 'year' (newest first) or 'type'.
export function publicationsHtml(recs, mode = 'section') {
  const buckets = new Map();
  for (const r of recs) {
    const k = mode === 'type' ? (typeOf(r) || 'other')
      : mode === 'year' ? (/^\d{4}/.test(r.year) ? r.year.slice(0, 4) : 'Forthcoming')
      : (r.section || 'Other publications');
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(r);
  }
  const keys = [...buckets.keys()].sort(
    mode === 'type' ? (a, b) => rank(TYPE_ORDER, a) - rank(TYPE_ORDER, b)
    : mode === 'year' ? (a, b) => (!/^\d/.test(a) ? -1 : !/^\d/.test(b) ? 1 : Number(b) - Number(a))
    : (a, b) => rank(SECTION_ORDER, a) - rank(SECTION_ORDER, b));
  const out = [];
  for (const k of keys) {
    const items = buckets.get(k).sort(byYear);
    const label = mode === 'type' ? (TYPE_LABEL[k] || k) : k;
    out.push(`<p class="group">${esc(label)} <span>${items.length}</span></p>`);
    out.push(items.map(publication).join(''));
  }
  return out.join('') || '<p class="item none">Nothing matches these filters.</p>';
}

export function filterPublications(recs, { type = '', from = 0, to = 9999, q = '' } = {}) {
  q = q.trim().toLowerCase();
  return recs.filter((r) => {
    if (type && typeOf(r) !== type) return false;
    const y = parseInt(r.year, 10);
    if (y && (y < from || y > to)) return false;   // undated items always stay
    if (q && ![r.authors, r.title, r.venue, r.details, r.type, r.year, r.doi].join(' ').toLowerCase().includes(q)) return false;
    return true;
  });
}

export function countText(recs) {
  return `${recs.length} publication${recs.length === 1 ? '' : 's'}`;
}

// ---------- presentations ----------

// One line per row, grouped by year as on the old site: "keynote @ ArtEZ Hogeschool, Enschede (NL)".
function lecture(r) {
  const where = r.url ? link(r.url, esc(r.occasion)) : esc(r.occasion);
  const who = r.speaker ? `${esc(r.speaker)} - ` : '';
  const title = r.title ? `: "${esc(r.title)}"` : '';
  return `<p class="item">${who}${r.kind ? esc(r.kind) + ' @ ' : ''}${where}${title}</p>`;
}

export function lecturesHtml(recs) {
  const years = new Map();
  for (const r of recs) {
    const y = String(r.date || '').slice(0, 4) || 'Undated';
    if (!years.has(y)) years.set(y, []);
    years.get(y).push(r);
  }
  // Newest year first; within a year, newest date first, else the order of the sheet.
  return [...years.keys()].sort((a, b) => b.localeCompare(a)).map((y) => {
    const items = years.get(y).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return `<p class="group">${esc(y)}</p>` + items.map(lecture).join('');
  }).join('') || '<p class="item none">No presentations yet.</p>';
}

// At build time, read a live sheet; if it can't be reached, use the copy in src/data.
export async function load(url, fallback) {
  if (url) {
    try {
      const r = await fetch(url);
      if (r.ok) return parseCSV(await r.text());
    } catch {}
  }
  return parseCSV(fallback);
}
