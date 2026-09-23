// Blog: posts from site data, newest first.
const { esc, pick, pageHead } = require('../site/ui.js');

const T = {
  en: { title: 'Blog', by: 'By', read: 'Read the full post' },
  hi: { title: 'ब्लॉग', by: 'लेखक:', read: 'पूरा लेख पढ़ें' },
};

function formatDate(iso, lang) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? new Date(`${iso}T00:00:00Z`) : null;
  return d ? new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d) : (iso || '');
}

function render(siteData, lang) {
  const t = T[lang];
  const blog = siteData.blog || {};
  const posts = [...(blog.posts || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const lead = pick(blog.migratedNotice, lang);
  return {
    title: t.title,
    desc: lead,
    content: `
  ${pageHead({ lang, title: t.title, lead })}
  <section class="cc-section">
    <div class="cc-wrap cc-wrap--narrow" style="display:grid; gap:1.25rem">
      ${posts.map((p) => `
      <article class="cc-card" id="${esc(p.slug || p.id)}">
        ${p.coverImage || p.image ? `<div class="cc-card__media"><img src="${esc(p.coverImage || p.image)}" alt="${esc(p.imageAlt || pick(p.title, lang))}" loading="lazy" decoding="async"></div>` : ''}
        <div class="cc-card__body">
          <p class="cc-kicker">${esc(p.category)} · <time datetime="${esc(p.date)}">${esc(formatDate(p.date, lang))}</time></p>
          <h2 class="cc-h2">${esc(pick(p.title, lang))}</h2>
          <p class="cc-muted">${t.by} ${esc(p.author)}</p>
          <p class="cc-prose">${esc(pick(p.excerpt, lang))}</p>
          <details>
            <summary class="cc-link" style="cursor:pointer">${t.read}</summary>
            <div class="cc-prose" style="margin-top:0.5rem">${pick(p.content, lang).split(/\n{2,}/).map((para) => `<p>${esc(para)}</p>`).join('')}</div>
          </details>
        </div>
      </article>`).join('')}
    </div>
  </section>`,
  };
}

module.exports = { render };
