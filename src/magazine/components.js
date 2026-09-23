// Chhattisgadhiya Cloud - Masik Patrika page components (build time, Node).
//
// Each render* function returns an HTML string for one section of the
// magazine page. Everything is driven by `siteData.magazine` (issues, prices,
// preview length) and `src/data/magazine-pages.json` (page content), so a new
// monthly issue is published by editing data, not markup.
//
// Access control: only pages 1..config.previewPages are ever rendered into the
// public HTML. Locked pages contribute metadata (title/author) for the preview
// gate, never their body. The browser reader asks config.accessEndpoint for the
// remaining pages once a reader holds a valid access token.

const STRINGS = {
  en: {
    monthly: 'Monthly',
    issn: 'ISSN 2709-4112',
    latestIssue: 'Latest issue',
    issueLabel: 'Issue',
    published: 'Published',
    pages: 'Pages',
    freePreview: 'Free preview',
    pagesRange: (a, b) => `Pages ${a}–${b}`,
    readPreview: 'Read free preview',
    buyThisIssue: 'Buy this issue',
    coverAlt: (month) => `Cover of the ${month} issue`,
    buyHeading: 'Get the full issue',
    buySub: (month, total) => `${month} · all ${total} pages`,
    digitalCopy: 'Digital Copy',
    printCopy: 'Print Copy',
    digitalDesc: 'Read the magazine online.',
    printDesc: 'Get the physical magazine delivered.',
    digitalPoints: (total) => [`All ${total} pages in the reader`, 'Access right after payment'],
    printPoints: () => ['Printed copy posted to your address', 'Delivery details taken at checkout'],
    buyDigital: 'Buy Digital Copy',
    orderPrint: 'Order Print Copy',
    payNote: 'Pay securely by UPI, card or net banking.',
    previousIssue: 'Previous Issue',
    previousIssues: 'Previous Issues',
    archiveCount: (n) => `${n} issues in the archive`,
    buy: 'Buy',
    order: 'Order',
    readHeading: 'Read the magazine',
    readSub: (preview, total) => `Pages 1–${preview} are free to read. The remaining ${total - preview} pages open with a Digital Copy or a subscription.`,
    fullIssue: 'Full issue',
    textSize: 'Text size',
    zoomOut: 'Smaller text',
    zoomIn: 'Larger text',
    fullscreen: 'Full screen',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    previous: 'Previous',
    next: 'Next',
    pageOf: (n, total) => `Page ${n} of ${total}`,
    pageNav: 'Pages',
    pageFree: (n) => `Page ${n}, free preview`,
    pageLocked: (n) => `Page ${n}, full issue`,
    by: 'By',
    gateEyebrow: (preview) => `End of the ${preview}-page free preview`,
    gateTitle: 'Enjoying the magazine?',
    gateBody: "You've reached the end of the free preview. Subscribe or purchase the complete issue to continue reading.",
    subscribeNow: 'Subscribe Now',
    buyDigitalPrice: (p) => `Buy Digital Copy — ${p}`,
    gatePrint: (p) => `Prefer paper? Order the print copy — ${p}`,
    gateNext: 'Still to read in this issue',
    pageShort: 'p.',
  },
  hi: {
    monthly: 'मासिक',
    issn: 'ISSN 2709-4112',
    latestIssue: 'नवीनतम अंक',
    issueLabel: 'अंक',
    published: 'प्रकाशन',
    pages: 'पृष्ठ',
    freePreview: 'निःशुल्क पूर्वावलोकन',
    pagesRange: (a, b) => `पृष्ठ ${a}–${b}`,
    readPreview: 'निःशुल्क पूर्वावलोकन पढ़ें',
    buyThisIssue: 'यह अंक खरीदें',
    coverAlt: (month) => `${month} अंक का मुखपृष्ठ`,
    buyHeading: 'संपूर्ण अंक प्राप्त करें',
    buySub: (month, total) => `${month} · सभी ${total} पृष्ठ`,
    digitalCopy: 'डिजिटल प्रति',
    printCopy: 'मुद्रित प्रति',
    digitalDesc: 'पत्रिका ऑनलाइन पढ़ें।',
    printDesc: 'छपी हुई पत्रिका आपके पते पर।',
    digitalPoints: (total) => [`रीडर में सभी ${total} पृष्ठ`, 'भुगतान के तुरंत बाद उपलब्ध'],
    printPoints: () => ['मुद्रित प्रति डाक से आपके पते पर', 'पता चेकआउट के समय लिया जाएगा'],
    buyDigital: 'डिजिटल प्रति खरीदें',
    orderPrint: 'मुद्रित प्रति मंगाएं',
    payNote: 'UPI, कार्ड या नेट बैंकिंग से सुरक्षित भुगतान।',
    previousIssue: 'पिछला अंक',
    previousIssues: 'पिछले अंक',
    archiveCount: (n) => `अभिलेखागार में ${n} अंक`,
    buy: 'खरीदें',
    order: 'मंगाएं',
    readHeading: 'पत्रिका पढ़ें',
    readSub: (preview, total) => `पृष्ठ 1–${preview} निःशुल्क पढ़ें। शेष ${total - preview} पृष्ठ डिजिटल प्रति या सदस्यता के साथ खुलते हैं।`,
    fullIssue: 'संपूर्ण अंक',
    textSize: 'अक्षर आकार',
    zoomOut: 'छोटे अक्षर',
    zoomIn: 'बड़े अक्षर',
    fullscreen: 'पूर्ण स्क्रीन',
    prevPage: 'पिछला पृष्ठ',
    nextPage: 'अगला पृष्ठ',
    previous: 'पिछला',
    next: 'अगला',
    pageOf: (n, total) => `पृष्ठ ${n} / ${total}`,
    pageNav: 'पृष्ठ',
    pageFree: (n) => `पृष्ठ ${n}, निःशुल्क`,
    pageLocked: (n) => `पृष्ठ ${n}, संपूर्ण अंक`,
    by: '',
    gateEyebrow: (preview) => `${preview} पृष्ठों का निःशुल्क पूर्वावलोकन समाप्त`,
    gateTitle: 'पत्रिका पसंद आ रही है?',
    gateBody: 'आपने निःशुल्क पूर्वावलोकन पूरा कर लिया है। आगे पढ़ने के लिए सदस्यता लें या संपूर्ण अंक खरीदें।',
    subscribeNow: 'अभी सदस्यता लें',
    buyDigitalPrice: (p) => `डिजिटल प्रति खरीदें — ${p}`,
    gatePrint: (p) => `कागज़ पर पढ़ना पसंद है? मुद्रित प्रति मंगाएं — ${p}`,
    gateNext: 'इस अंक में आगे',
    pageShort: 'पृ.',
  },
};

// Strings the browser reader and checkout need at runtime.
const CLIENT_STRINGS = {
  en: {
    pageOf: 'Page {n} of {total}',
    statusPreview: 'Free preview · pages 1–{preview}',
    statusLocked: 'Page {n} is in the full issue',
    statusFull: 'Full issue',
    checkoutTitle: 'Complete your order',
    products: {
      digital: { label: 'Digital Copy', desc: 'Read the full issue online' },
      print: { label: 'Print Copy', desc: 'Delivered to your address' },
      subscription: { label: 'Monthly Subscription', desc: 'Every new issue, digital · per month' },
    },
    perMonth: '/month',
    total: 'Total',
    name: 'Full name',
    phone: 'Phone / WhatsApp',
    email: 'Email',
    address: 'Delivery address',
    addressHint: 'House, street, city, PIN code',
    submit: 'Continue to payment',
    submitting: 'Please wait…',
    required: 'Please fill in your name, phone and email.',
    requiredAddress: 'Please add a delivery address for the print copy.',
    failed: 'We could not start the payment. Please try again, or contact us.',
    doneTitle: 'Your order is ready to send',
    doneBody: 'Send these details to us and we will reply with a secure payment link. Your access is activated as soon as payment is confirmed.',
    sendWhatsApp: 'Send on WhatsApp',
    sendEmail: 'Send by email',
    close: 'Close',
    orderLine: 'Magazine order',
    issue: 'Issue',
    item: 'Item',
  },
  hi: {
    pageOf: 'पृष्ठ {n} / {total}',
    statusPreview: 'निःशुल्क पूर्वावलोकन · पृष्ठ 1–{preview}',
    statusLocked: 'पृष्ठ {n} संपूर्ण अंक में है',
    statusFull: 'संपूर्ण अंक',
    checkoutTitle: 'अपना ऑर्डर पूरा करें',
    products: {
      digital: { label: 'डिजिटल प्रति', desc: 'संपूर्ण अंक ऑनलाइन पढ़ें' },
      print: { label: 'मुद्रित प्रति', desc: 'आपके पते पर डाक से' },
      subscription: { label: 'मासिक सदस्यता', desc: 'हर नया अंक, डिजिटल · प्रति माह' },
    },
    perMonth: '/माह',
    total: 'कुल',
    name: 'पूरा नाम',
    phone: 'फ़ोन / व्हाट्सएप',
    email: 'ईमेल',
    address: 'डिलीवरी का पता',
    addressHint: 'मकान, गली, शहर, पिन कोड',
    submit: 'भुगतान के लिए आगे बढ़ें',
    submitting: 'कृपया प्रतीक्षा करें…',
    required: 'कृपया नाम, फ़ोन और ईमेल भरें।',
    requiredAddress: 'मुद्रित प्रति के लिए डिलीवरी का पता भरें।',
    failed: 'भुगतान शुरू नहीं हो सका। कृपया पुनः प्रयास करें या हमसे संपर्क करें।',
    doneTitle: 'आपका ऑर्डर भेजने के लिए तैयार है',
    doneBody: 'ये विवरण हमें भेजें, हम सुरक्षित भुगतान लिंक भेजेंगे। भुगतान की पुष्टि होते ही आपकी पहुंच सक्रिय हो जाएगी।',
    sendWhatsApp: 'व्हाट्सएप पर भेजें',
    sendEmail: 'ईमेल से भेजें',
    close: 'बंद करें',
    orderLine: 'पत्रिका ऑर्डर',
    issue: 'अंक',
    item: 'विवरण',
  },
};

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pick = (v, lang) => (v && typeof v === 'object' ? (v[lang] || v.en || '') : (v || ''));

const ICONS = {
  screen: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
  parcel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};

function formatDate(value, lang) {
  if (!value) return '';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T00:00:00Z') : null;
  if (!d || isNaN(d)) return value;
  return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

// Minimal Markdown used by page content: paragraphs, "> " pull quotes,
// "1. " lists, "### " sub-heads, **bold** and *italic*.
function formatPageContent(md) {
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  return String(md || '').trim().split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    if (block.startsWith('> ')) return `<blockquote>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`;
    if (block.startsWith('### ')) return `<h4>${inline(block.slice(4))}</h4>`;
    if (lines.every((l) => /^\d+\.\s/.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s/, ''))}</li>`).join('')}</ol>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('\n');
}

// Normalises siteData.magazine into the shape the components use.
function getMagazineModel(magazine, pagesData, lang) {
  const config = Object.assign(
    { currency: '₹', digitalPrice: 99, printPrice: 199, subscriptionPrice: 99, previewPages: 5, accessEndpoint: '', checkoutEndpoint: '' },
    magazine.config || {}
  );
  const price = (n) => `${config.currency}${n}`;
  const toIssue = (raw, fallbackId) => ({
    id: raw.id || fallbackId,
    number: raw.number || '',
    month: pick(raw.month, lang),
    title: pick(raw.title, lang),
    description: pick(raw.description, lang) || pick(raw.readExcerpt, lang),
    coverImg: raw.coverImg || '/src/assets/images/mag-issue-14-cover.svg',
    publishDate: formatDate(raw.publishDate, lang),
    totalPages: raw.totalPages || 0,
    digitalPrice: price(raw.digitalPrice || config.digitalPrice),
    printPrice: price(raw.printPrice || config.printPrice),
  });

  const current = toIssue(magazine.currentIssue || {}, 'current');
  const issuePages = (pagesData && pagesData[current.id]) || { pages: [] };
  const totalPages = issuePages.totalPages || current.totalPages || issuePages.pages.length;
  const previewPages = Math.max(0, Math.min(config.previewPages, totalPages));

  const pages = issuePages.pages
    .filter((p) => p.page >= 1 && p.page <= totalPages)
    .sort((a, b) => a.page - b.page)
    .map((p) => ({
      page: p.page,
      category: pick(p.category, lang),
      title: pick(p.title, lang),
      author: pick(p.author, lang),
      excerpt: pick(p.excerpt, lang),
      // Body text is dropped for every page past the preview, even if the data has it.
      contentHtml: p.page <= previewPages ? formatPageContent(pick(p.content, lang)) : '',
    }));

  return {
    lang,
    name: pick(magazine.name, lang),
    tagline: pick(magazine.tagline, lang),
    config,
    price,
    current: Object.assign(current, { totalPages, previewPages }),
    previewSheets: pages.filter((p) => p.page <= previewPages),
    lockedTeasers: pages.filter((p) => p.page > previewPages),
    previous: (magazine.previousIssues || []).map((raw, i) => toIssue(raw, `previous-${i}`)),
  };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function renderMasthead(m) {
  const t = STRINGS[m.lang];
  return `
  <header class="mz-masthead">
    <div class="mz-wrap mz-masthead__inner">
      <div>
        <p class="mz-kicker">${t.monthly}</p>
        <h1 class="mz-masthead__title">${esc(m.name)}</h1>
      </div>
      <p class="mz-masthead__tagline">${esc(m.tagline)}<span aria-hidden="true"> · </span><span class="mz-nowrap">${t.issn}</span></p>
    </div>
  </header>`;
}

function renderCurrentIssue(m) {
  const t = STRINGS[m.lang];
  const i = m.current;
  const meta = [
    [t.issueLabel, i.number],
    [t.published, i.publishDate],
    [t.pages, i.totalPages],
    [t.freePreview, t.pagesRange(1, i.previewPages)],
  ].filter(([, v]) => v);
  return `
  <section class="mz-hero" aria-labelledby="mz-current-title">
    <div class="mz-wrap mz-hero__grid">
      <p class="mz-hero__eyebrow"><span class="mz-tag">${t.latestIssue}</span><span>${esc(i.month)}</span></p>
      <div class="mz-hero__cover">
        <a class="mz-cover mz-cover--hero" href="#mz-reader" aria-label="${esc(t.readPreview)}">
          <img src="${esc(i.coverImg)}" alt="${esc(t.coverAlt(i.month))}" width="400" height="560" fetchpriority="high">
        </a>
      </div>
      <div class="mz-hero__body">
        <h2 class="mz-hero__title" id="mz-current-title">${esc(i.title)}</h2>
        <p class="mz-hero__desc">${esc(i.description)}</p>
        <dl class="mz-meta">
          ${meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
        <div class="mz-actions">
          <a class="mz-btn mz-btn--primary" href="#mz-reader">${t.readPreview}</a>
          <a class="mz-btn mz-btn--outline" href="#mz-buy">${t.buyThisIssue}</a>
        </div>
      </div>
    </div>
  </section>`;
}

// Subscription / purchase call to action. `product` is digital | print | subscription.
function renderPurchaseCta({ product, issueId, label, variant = 'primary', block = false, size = '' }) {
  const cls = ['mz-btn', `mz-btn--${variant}`, block ? 'mz-btn--block' : '', size ? `mz-btn--${size}` : ''].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" data-mz-buy="${product}" data-mz-issue="${esc(issueId)}">${esc(label)}</button>`;
}

function renderOffer({ kind, title, price, desc, points, cta, icon }) {
  return `
    <article class="mz-offer mz-offer--${kind}">
      <div class="mz-offer__head">
        <span class="mz-offer__icon">${icon}</span>
        <h3 class="mz-offer__title">${esc(title)}</h3>
        <p class="mz-offer__price">${esc(price)}</p>
      </div>
      <p class="mz-offer__desc">${esc(desc)}</p>
      <ul class="mz-offer__points">${points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      ${cta}
    </article>`;
}

function renderPurchaseOptions(m) {
  const t = STRINGS[m.lang];
  const i = m.current;
  return `
  <section class="mz-section mz-buy" id="mz-buy" aria-labelledby="mz-buy-title">
    <div class="mz-wrap">
      <div class="mz-section__head">
        <h2 class="mz-section__title" id="mz-buy-title">${t.buyHeading}</h2>
        <p class="mz-section__sub">${esc(t.buySub(i.month, i.totalPages))}</p>
      </div>
      <div class="mz-buy__grid">
        ${renderOffer({
          kind: 'digital', title: t.digitalCopy, price: i.digitalPrice, desc: t.digitalDesc,
          points: t.digitalPoints(i.totalPages), icon: ICONS.screen,
          cta: renderPurchaseCta({ product: 'digital', issueId: i.id, label: t.buyDigital, block: true }),
        })}
        ${renderOffer({
          kind: 'print', title: t.printCopy, price: i.printPrice, desc: t.printDesc,
          points: t.printPoints(), icon: ICONS.parcel,
          cta: renderPurchaseCta({ product: 'print', issueId: i.id, label: t.orderPrint, variant: 'dark', block: true }),
        })}
      </div>
      <p class="mz-buy__note">${ICONS.lock}<span>${t.payNote}</span></p>
    </div>
  </section>`;
}

function renderMagazineCard(issue, lang) {
  const t = STRINGS[lang];
  return `
    <article class="mz-card">
      <div class="mz-card__cover mz-cover">
        <img src="${esc(issue.coverImg)}" alt="${esc(t.coverAlt(issue.month))}" width="400" height="560" loading="lazy">
      </div>
      <div class="mz-card__body">
        <p class="mz-card__meta"><span>${esc(issue.month)}</span><span>${esc(issue.number)}</span></p>
        <h3 class="mz-card__title">${esc(issue.title)}</h3>
        <p class="mz-card__desc">${esc(issue.description)}</p>
      </div>
      <ul class="mz-card__prices">
        <li><span class="mz-card__format">${t.digitalCopy}</span><span class="mz-card__price">${esc(issue.digitalPrice)}</span>${renderPurchaseCta({ product: 'digital', issueId: issue.id, label: t.buy, size: 'sm' })}</li>
        <li><span class="mz-card__format">${t.printCopy}</span><span class="mz-card__price">${esc(issue.printPrice)}</span>${renderPurchaseCta({ product: 'print', issueId: issue.id, label: t.order, variant: 'outline', size: 'sm' })}</li>
      </ul>
    </article>`;
}

function renderPreviousIssues(m) {
  if (!m.previous.length) return '';
  const t = STRINGS[m.lang];
  const many = m.previous.length > 1;
  return `
  <section class="mz-section mz-archive" aria-labelledby="mz-archive-title">
    <div class="mz-wrap">
      <div class="mz-section__head">
        <h2 class="mz-section__title" id="mz-archive-title">${many ? t.previousIssues : t.previousIssue}</h2>
        ${many ? `<p class="mz-section__sub">${t.archiveCount(m.previous.length)}</p>` : ''}
      </div>
      <div class="mz-archive__grid">
        ${m.previous.map((issue) => renderMagazineCard(issue, m.lang)).join('')}
      </div>
    </div>
  </section>`;
}

function renderSheet(p, m) {
  const t = STRINGS[m.lang];
  const i = m.current;
  return `
        <article class="mr-sheet" data-mr-page="${p.page}" aria-label="${esc(t.pageOf(p.page, i.totalPages))}">
          <header class="mr-sheet__running"><span>${esc(m.name)}</span><span>${esc(i.month)}</span></header>
          <p class="mr-sheet__kicker">${esc(p.category)}</p>
          <h3 class="mr-sheet__title">${esc(p.title)}</h3>
          ${p.excerpt ? `<p class="mr-sheet__deck">${esc(p.excerpt)}</p>` : ''}
          ${p.author ? `<p class="mr-sheet__byline">${t.by ? `${t.by} ` : ''}<span>${esc(p.author)}</span></p>` : ''}
          <div class="mr-sheet__body">${p.contentHtml}</div>
          <footer class="mr-sheet__folio"><span>${t.freePreview}</span><span class="mr-sheet__num">${p.page}</span></footer>
        </article>`;
}

function renderPreviewGate(m) {
  const t = STRINGS[m.lang];
  const i = m.current;
  if (!m.lockedTeasers.length) return '';
  return `
        <section class="mr-gate" data-mr-gate aria-labelledby="mr-gate-title">
          <p class="mr-gate__eyebrow">${ICONS.lock}<span>${esc(t.gateEyebrow(i.previewPages))}</span></p>
          <h3 class="mr-gate__title" id="mr-gate-title">${t.gateTitle}</h3>
          <p class="mr-gate__body">${t.gateBody}</p>
          <div class="mz-actions mr-gate__actions">
            ${renderPurchaseCta({ product: 'subscription', issueId: i.id, label: t.subscribeNow })}
            ${renderPurchaseCta({ product: 'digital', issueId: i.id, label: t.buyDigitalPrice(i.digitalPrice), variant: 'outline' })}
          </div>
          <p class="mr-gate__alt"><button type="button" class="mz-link" data-mz-buy="print" data-mz-issue="${esc(i.id)}">${esc(t.gatePrint(i.printPrice))}</button></p>
          <div class="mr-gate__next">
            <p class="mr-gate__label">${t.gateNext}</p>
            <ol>
              ${m.lockedTeasers.map((p) => `<li><span class="mr-gate__pg">${t.pageShort} ${p.page}</span><span><span class="mr-gate__cat">${esc(p.category)}</span> ${esc(p.title)}</span></li>`).join('')}
            </ol>
          </div>
        </section>`;
}

function renderReaderTrack(m) {
  const t = STRINGS[m.lang];
  const { totalPages, previewPages } = m.current;
  const segs = [];
  for (let n = 1; n <= totalPages; n++) {
    const free = n <= previewPages;
    segs.push(`<li><button type="button" class="mr-track__seg ${free ? 'is-free' : 'is-locked'}" data-mr-goto="${n}" aria-label="${esc(free ? t.pageFree(n) : t.pageLocked(n))}"></button></li>`);
  }
  return `
      <div class="mr-progress">
        <ol class="mr-track" aria-label="${t.pageNav}">${segs.join('')}</ol>
        <p class="mr-legend">
          <span class="mr-legend__free">${t.freePreview} · 1–${previewPages}</span>
          ${previewPages < totalPages ? `<span class="mr-legend__locked">${t.fullIssue} · ${previewPages + 1}–${totalPages}</span>` : ''}
        </p>
      </div>`;
}

function renderReaderControls(m) {
  const t = STRINGS[m.lang];
  const i = m.current;
  return `
      <div class="mr-toolbar">
        <p class="mr-toolbar__title"><strong>${esc(i.month)}</strong><span>${esc(i.number)}</span></p>
        <p class="mr-status" data-mr-status>${t.freePreview} · ${t.pagesRange(1, i.previewPages)}</p>
        <div class="mr-tools">
          <div class="mr-zoom" role="group" aria-label="${t.textSize}">
            <button type="button" class="mr-icon-btn" data-mr-zoom="-1" aria-label="${t.zoomOut}"><span aria-hidden="true">A−</span></button>
            <output class="mr-zoom__level" data-mr-zoom-level aria-live="polite">100%</output>
            <button type="button" class="mr-icon-btn" data-mr-zoom="1" aria-label="${t.zoomIn}"><span aria-hidden="true">A+</span></button>
          </div>
          <button type="button" class="mr-icon-btn" data-mr-fullscreen aria-label="${t.fullscreen}" aria-pressed="false">${ICONS.expand}</button>
        </div>
      </div>`;
}

function renderMagazineReader(m) {
  const t = STRINGS[m.lang];
  const i = m.current;
  return `
  <section class="mz-section mz-read" id="mz-reader" aria-labelledby="mz-read-title">
    <div class="mz-wrap">
      <div class="mz-section__head">
        <h2 class="mz-section__title" id="mz-read-title">${t.readHeading}</h2>
        <p class="mz-section__sub">${esc(t.readSub(i.previewPages, i.totalPages))}</p>
      </div>
      <div class="mr" data-mz-reader data-mr-issue="${esc(i.id)}" data-mr-total="${i.totalPages}" data-mr-preview="${i.previewPages}" tabindex="-1">
        ${renderReaderControls(m)}
        <div class="mr-stage">
          <button type="button" class="mr-nav mr-nav--prev" data-mr-prev aria-label="${t.prevPage}">${ICONS.chevronLeft}</button>
          <div class="mr-viewport" data-mr-viewport>
            ${m.previewSheets.map((p) => renderSheet(p, m)).join('')}
            ${renderPreviewGate(m)}
          </div>
          <button type="button" class="mr-nav mr-nav--next" data-mr-next aria-label="${t.nextPage}">${ICONS.chevronRight}</button>
        </div>
        <div class="mr-footer">
          <button type="button" class="mr-step" data-mr-prev>${ICONS.chevronLeft}<span>${t.previous}</span></button>
          <p class="mr-indicator" data-mr-indicator aria-live="polite">${esc(t.pageOf(1, i.totalPages))}</p>
          <button type="button" class="mr-step" data-mr-next><span>${t.next}</span>${ICONS.chevronRight}</button>
        </div>
        ${renderReaderTrack(m)}
      </div>
    </div>
  </section>`;
}

function renderCheckoutDialog(m) {
  const t = CLIENT_STRINGS[m.lang];
  const c = m.config;
  const products = [
    ['digital', c.digitalPrice, ''],
    ['print', c.printPrice, ''],
    ['subscription', c.subscriptionPrice, t.perMonth],
  ];
  return `
  <dialog class="mz-checkout" id="mz-checkout" aria-labelledby="mz-checkout-title">
    <form method="dialog" class="mz-checkout__close-form"><button class="mz-checkout__close" aria-label="${t.close}">×</button></form>
    <div class="mz-checkout__panel" data-mz-step="form">
      <p class="mz-kicker" data-mz-checkout-issue></p>
      <h2 class="mz-checkout__title" id="mz-checkout-title">${t.checkoutTitle}</h2>
      <form class="mz-checkout__form" data-mz-checkout-form novalidate>
        <fieldset class="mz-choice">
          <legend class="mz-visually-hidden">${t.item}</legend>
          ${products.map(([key, amount, suffix]) => `
          <label class="mz-choice__opt">
            <input type="radio" name="product" value="${key}">
            <span class="mz-choice__text"><strong>${t.products[key].label}</strong><span>${t.products[key].desc}</span></span>
            <span class="mz-choice__price">${esc(c.currency)}${amount}${suffix ? `<small>${suffix}</small>` : ''}</span>
          </label>`).join('')}
        </fieldset>
        <div class="mz-field"><label for="mz-f-name">${t.name}</label><input id="mz-f-name" name="name" autocomplete="name" required></div>
        <div class="mz-field-row">
          <div class="mz-field"><label for="mz-f-phone">${t.phone}</label><input id="mz-f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required></div>
          <div class="mz-field"><label for="mz-f-email">${t.email}</label><input id="mz-f-email" name="email" type="email" autocomplete="email" required></div>
        </div>
        <div class="mz-field" data-mz-address hidden><label for="mz-f-address">${t.address}</label><textarea id="mz-f-address" name="address" rows="2" autocomplete="street-address" placeholder="${t.addressHint}"></textarea></div>
        <p class="mz-checkout__error" data-mz-error role="alert" hidden></p>
        <div class="mz-checkout__foot">
          <p class="mz-checkout__total">${t.total} <strong data-mz-total></strong></p>
          <button type="submit" class="mz-btn mz-btn--primary" data-mz-submit>${t.submit}</button>
        </div>
      </form>
    </div>
    <div class="mz-checkout__panel" data-mz-step="done" hidden>
      <h2 class="mz-checkout__title">${t.doneTitle}</h2>
      <p class="mz-checkout__lead">${t.doneBody}</p>
      <pre class="mz-checkout__summary" data-mz-summary></pre>
      <div class="mz-actions">
        <a class="mz-btn mz-btn--primary" data-mz-send="whatsapp" target="_blank" rel="noopener">${t.sendWhatsApp}</a>
        <a class="mz-btn mz-btn--outline" data-mz-send="email">${t.sendEmail}</a>
      </div>
    </div>
  </dialog>`;
}

// Public, bypass-safe runtime config for the browser (no locked content).
function getClientConfig(m, contact) {
  const issues = {};
  [m.current, ...m.previous].forEach((i) => { issues[i.id] = `${i.month} · ${i.number}`; });
  return {
    lang: m.lang,
    issueId: m.current.id,
    totalPages: m.current.totalPages,
    previewPages: m.current.previewPages,
    currency: m.config.currency,
    prices: { digital: m.config.digitalPrice, print: m.config.printPrice, subscription: m.config.subscriptionPrice },
    accessEndpoint: m.config.accessEndpoint || '',
    checkoutEndpoint: m.config.checkoutEndpoint || '',
    contact: { email: (contact && contact.email) || '', whatsapp: ((contact && contact.phone) || '').replace(/\D/g, '') },
    issues,
    strings: CLIENT_STRINGS[m.lang],
  };
}

function renderMagazinePage(magazine, pagesData, lang, contact) {
  const m = getMagazineModel(magazine, pagesData, lang);
  const clientJson = JSON.stringify(getClientConfig(m, contact)).replace(/</g, '\\u003c');
  return `
  <div class="mz">
    ${renderMasthead(m)}
    ${renderCurrentIssue(m)}
    ${renderPurchaseOptions(m)}
    ${renderPreviousIssues(m)}
    ${renderMagazineReader(m)}
    ${renderCheckoutDialog(m)}
    <script type="application/json" id="mz-config">${clientJson}</script>
  </div>`;
}

module.exports = {
  getMagazineModel,
  formatPageContent,
  renderMasthead,
  renderCurrentIssue,
  renderPurchaseOptions,
  renderPurchaseCta,
  renderMagazineCard,
  renderPreviousIssues,
  renderMagazineReader,
  renderReaderControls,
  renderPreviewGate,
  renderCheckoutDialog,
  renderMagazinePage,
};
