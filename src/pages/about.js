// About: who we are, what shapes our work, the people, the journey.
const { esc, pick, icon, pageHead, sectionHead, stats } = require('../site/ui.js');

const SOCIAL_PATHS = {
  linkedin: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z',
  twitter: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z',
  instagram: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
  youtube: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z',
};

const T = {
  en: {
    title: 'About us', lead: 'A theatre and culture group from Jashpur, Chhattisgarh, making plays, festivals, camps and a magazine since 2014.',
    mission: 'Our mission', vision: 'Our vision', roots: 'What shapes our work',
    pillars: [
      ['leaf', 'Maati: the soil', 'Our stories, songs and satire come from the folk theatre and oral poetry of Chhattisgarh.'],
      ['mask', 'Prayog: the stage', 'We bring those forms to today’s stages with new writing, light and movement.'],
      ['users', 'Shilp: the community', 'Camps, festivals and the magazine open theatre to children and new audiences.'],
    ],
    leaders: 'Directors', ensemble: 'Our team', journey: 'Our journey', numbers: 'Our work in numbers',
    milestones: [
      ['2014', 'Founded in Jashpur', 'A group of actors and writers set up a non-profit trust to record Chhattisgarhi songs and train young people.'],
      ['2018', 'Jashrang festival begins', 'The first national theatre festival in Jashpur brings visiting groups to local audiences.'],
      ['2022', 'The magazine launches', 'A monthly magazine on theatre, folk arts and literature. Fourteen issues so far.'],
      ['2026', 'Bilingual and on tour', 'Plays tour beyond Chhattisgarh, and our work is now online in Hindi and English.'],
    ],
    links: (name) => `${name} on`,
  },
  hi: {
    title: 'परिचय', lead: 'जशपुर, छत्तीसगढ़ का एक रंगमंच और सांस्कृतिक दल, जो 2014 से नाटक, समारोह, शिविर और पत्रिका बना रहा है।',
    mission: 'हमारा ध्येय', vision: 'हमारी दृष्टि', roots: 'हमारे काम की नींव',
    pillars: [
      ['leaf', 'माटी', 'हमारी कहानियां, गीत और व्यंग्य छत्तीसगढ़ के लोकनाट्य और वाचिक कविता से आते हैं।'],
      ['mask', 'प्रयोग', 'हम इन विधाओं को नए लेखन, प्रकाश और गति के साथ आज के मंच पर लाते हैं।'],
      ['users', 'शिल्प', 'शिविर, समारोह और पत्रिका बच्चों और नए दर्शकों के लिए रंगमंच के द्वार खोलते हैं।'],
    ],
    leaders: 'निर्देशक', ensemble: 'हमारा दल', journey: 'हमारी यात्रा', numbers: 'आंकड़ों में हमारा काम',
    milestones: [
      ['2014', 'जशपुर में स्थापना', 'कलाकारों और लेखकों ने छत्तीसगढ़ी गीतों को सहेजने और युवाओं को सिखाने के लिए एक गैर-लाभकारी न्यास बनाया।'],
      ['2018', 'जशरंग समारोह की शुरुआत', 'जशपुर का पहला राष्ट्रीय नाट्य समारोह, जो बाहर के नाट्य दलों को स्थानीय दर्शकों तक लाया।'],
      ['2022', 'पत्रिका की शुरुआत', 'रंगमंच, लोक कला और साहित्य पर मासिक पत्रिका। अब तक चौदह अंक।'],
      ['2026', 'द्विभाषी और दौरे पर', 'नाटक छत्तीसगढ़ के बाहर दौरे पर हैं, और हमारा काम अब हिंदी और अंग्रेज़ी में ऑनलाइन है।'],
    ],
    links: (name) => `${name}:`,
  },
};

function socialLinks(person, lang) {
  const s = person.social || {};
  const items = [];
  ['linkedin', 'twitter', 'instagram', 'youtube'].forEach((k) => {
    const href = s[k] || (k === 'twitter' ? s.x : '');
    if (href) items.push(`<a href="${esc(href)}" target="_blank" rel="noopener" aria-label="${esc(`${T[lang].links(person.name)} ${k === 'twitter' ? 'X' : k[0].toUpperCase() + k.slice(1)}`)}"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="${SOCIAL_PATHS[k]}"/></svg></a>`);
  });
  return items.length ? `<div class="cc-person__links">${items.join('')}</div>` : '';
}

function person(m, lang, lead = false) {
  const img = m.photo || m.image;
  return `
        <li class="cc-person${lead ? ' cc-person--lead' : ''}">
          ${img ? `<img class="cc-person__photo" src="${esc(img)}" alt="${esc(m.name)}" width="112" height="112" loading="lazy" decoding="async">` : ''}
          <div>
            <p class="cc-person__name">${esc(m.name)}</p>
            <p class="cc-person__role">${esc(pick(m.role, lang))}</p>
            <p class="cc-person__bio">${esc(pick(m.bio, lang))}</p>
            ${socialLinks(m, lang)}
          </div>
        </li>`;
}

function render(siteData, lang) {
  const t = T[lang];
  const a = siteData.about || {};
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, page: 'about', title: t.title, lead: t.lead })}
  <section class="cc-section">
    <div class="cc-wrap">
      <div class="cc-grid cc-grid--2">
        <div class="cc-card cc-card--clay"><div class="cc-card__body"><h2 class="cc-h3">${t.mission}</h2><p class="cc-card__text">${esc(pick(a.mission, lang))}</p></div></div>
        <div class="cc-card cc-card--accent"><div class="cc-card__body"><h2 class="cc-h3">${t.vision}</h2><p class="cc-card__text">${esc(pick(a.vision, lang))}</p></div></div>
      </div>
    </div>
  </section>
  <section class="cc-section cc-section--tint" aria-labelledby="roots-title">
    <div class="cc-wrap">
      ${sectionHead(t.roots, { id: 'roots-title', sub: pick(a.culturalConnection, lang) })}
      <ul class="cc-grid cc-grid--3">
        ${t.pillars.map(([ic, title, text]) => `
        <li class="cc-card"><div class="cc-card__body">
          <span class="cc-icon-chip">${icon(ic)}</span>
          <h3 class="cc-h3">${title}</h3>
          <p class="cc-card__text">${text}</p>
        </div></li>`).join('')}
      </ul>
    </div>
  </section>
  <section class="cc-section" aria-labelledby="numbers-title">
    <div class="cc-wrap">
      ${sectionHead(t.numbers, { id: 'numbers-title' })}
      ${stats((siteData.homepage || {}).impactStats, lang)}
    </div>
  </section>
  <section class="cc-section" aria-labelledby="leaders-title">
    <div class="cc-wrap">
      ${sectionHead(t.leaders, { id: 'leaders-title' })}
      <ul class="cc-grid cc-grid--3">${(a.team || []).map((m) => person(m, lang, true)).join('')}</ul>
    </div>
  </section>
  <section class="cc-section cc-section--tint" aria-labelledby="team-title">
    <div class="cc-wrap">
      ${sectionHead(t.ensemble, { id: 'team-title' })}
      <ul class="cc-grid cc-grid--2">${(a.members || []).map((m) => person(m, lang)).join('')}</ul>
    </div>
  </section>
  <section class="cc-section" aria-labelledby="journey-title">
    <div class="cc-wrap cc-wrap--narrow">
      ${sectionHead(t.journey, { id: 'journey-title' })}
      <ol class="cc-timeline">
        ${t.milestones.map(([year, title, text]) => `
        <li><p class="cc-timeline__year">${year}</p><h3 class="cc-h3">${title}</h3><p class="cc-card__text">${text}</p></li>`).join('')}
      </ol>
    </div>
  </section>`,
  };
}

module.exports = { render };
