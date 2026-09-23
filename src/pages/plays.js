// Plays: the touring repertoire, one feature per play.
const { esc, pick, icon, picture, pageHead, formButton } = require('../site/ui.js');

const ART = {
  'kahani-vasu-ki': '/src/assets/images/play-vasu.svg',
  'vincent-a-flashback': '/src/assets/images/play-vincent.svg',
  'gabar-ghichor': '/src/assets/images/play-gabar.svg',
  'raja-ravi-verma': '/src/assets/images/play-raja.svg',
};

const T = {
  en: {
    title: 'Plays', lead: 'Four original plays rooted in Chhattisgarhi folk theatre. All are available to book for festivals, colleges and venues.',
    direction: 'Direction', duration: 'Duration', language: 'Language', age: 'Audience', cast: 'Cast',
    past: 'Recent shows', book: 'Book this play', artAlt: (t) => `Illustration for ${t}`,
    riderTitle: 'Bring a play to your stage', riderText: 'Every play travels with a technical rider covering lights, sound and stage size, for indoor halls and open-air stages.',
    press: 'Press kit',
  },
  hi: {
    title: 'नाटक', lead: 'छत्तीसगढ़ी लोक रंगमंच से जुड़े चार मौलिक नाटक। सभी समारोहों, कॉलेजों और सभागारों के लिए बुक किए जा सकते हैं।',
    direction: 'निर्देशन', duration: 'अवधि', language: 'भाषा', age: 'दर्शक', cast: 'कलाकार',
    past: 'हाल की प्रस्तुतियां', book: 'यह नाटक बुक करें', artAlt: (t) => `${t} का चित्रांकन`,
    riderTitle: 'नाटक को अपने मंच पर बुलाएं', riderText: 'हर नाटक के साथ प्रकाश, ध्वनि और मंच आकार की तकनीकी जानकारी दी जाती है — सभागार और खुले मंच, दोनों के लिए।',
    press: 'प्रेस किट',
  },
};

function renderPlay(p, lang) {
  const t = T[lang];
  const title = pick(p.title, lang);
  const art = p.photo || p.image || p.poster || ART[p.id] || '/src/assets/images/hero-art.svg';
  const review = (p.reviews || [])[0];
  const history = (p.performanceHistory || []).slice(-3).reverse();
  return `
    <article class="cc-feature" id="${esc(p.id)}" aria-labelledby="play-${esc(p.id)}">
      <div class="cc-feature__media">${picture(art, p.photoAlt || t.artAlt(title), { width: 640, height: 360 })}</div>
      <div class="cc-feature__body">
        <p class="cc-kicker">${esc(pick(p.genre, lang))} · ${esc(p.year)}</p>
        <h2 class="cc-h2" id="play-${esc(p.id)}">${esc(title)}</h2>
        <p class="cc-card__text"><strong>${esc(pick(p.subtitle, lang))}.</strong> ${esc(pick(p.synopsis, lang))}</p>
        <ul class="cc-facts">
          <li>${icon('mask')}<span><strong>${t.direction}:</strong> ${esc(p.director)}</span></li>
          <li>${icon('clock')}<span><strong>${t.duration}:</strong> ${esc(p.duration)} · ${esc(p.language)}</span></li>
          ${p.ageSuitability ? `<li>${icon('users')}<span><strong>${t.age}:</strong> ${esc(p.ageSuitability)}</span></li>` : ''}
          ${(p.cast || []).length ? `<li>${icon('star')}<span><strong>${t.cast}:</strong> ${esc(p.cast.slice(0, 4).join(', '))}</span></li>` : ''}
        </ul>
        ${review ? `<figure class="cc-quote" style="height:auto"><blockquote lang="en">“${esc(review.quote)}”</blockquote><figcaption><strong>${esc(review.critic)}</strong></figcaption></figure>` : ''}
        ${history.length ? `
        <details>
          <summary class="cc-link" style="cursor:pointer">${t.past}</summary>
          <ul class="cc-facts" style="margin-top:0.5rem">${history.map((h) => `<li>${icon('pin')}<span><strong>${esc(h.date)}</strong> · ${esc(h.venue)}</span></li>`).join('')}</ul>
        </details>` : ''}
        <div class="cc-actions">${formButton({ lang, form: 'booking', label: t.book, prefill: { play: p.id } })}</div>
      </div>
    </article>`;
}

function render(siteData, lang) {
  const t = T[lang];
  const plays = siteData.productions || [];
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, title: t.title, lead: t.lead })}
  <section class="cc-section">
    <div class="cc-wrap" style="display:grid; gap:1.5rem">${plays.map((p) => renderPlay(p, lang)).join('')}</div>
  </section>
  <section class="cc-section">
    <div class="cc-wrap">
      <div class="cc-callout">
        <div><h2 class="cc-h3">${t.riderTitle}</h2><p>${t.riderText}</p></div>
        <div class="cc-actions">${formButton({ lang, form: 'booking', label: t.book })}<a class="cc-btn cc-btn--secondary" href="/${lang}/press/">${t.press}</a></div>
      </div>
    </div>
  </section>`,
  };
}

module.exports = { render, ART };
