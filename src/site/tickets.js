// Chhattisgadhiya Cloud - event ticket card (build time, Node).
// One design for every dated event: home "Coming up" and What's On. A
// coloured stub (date, status, type), a perforated tear line, then title,
// dates, venue, a live countdown (site.js), the pass/register button and a
// details link. Styles: .cc-ticket in site.css.

const { esc, pick, icon, formButton } = require('./ui.js');
const { dateBadge, parseEnd, statusOf, statusTag } = require('./events.js');

const T = {
  en: { festival: 'Festival', camp: 'Summer camp', pass: 'Reserve free pass', register: 'Register child', details: 'Details' },
  hi: { festival: 'समारोह', camp: 'समर कैम्प', pass: 'निःशुल्क पास', register: 'पंजीकरण', details: 'विवरण' },
};

function renderTicket(item, lang, { level = 3 } = {}) {
  const t = T[lang];
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const monthYear = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(item.start);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(item.start);
  const d = dateBadge(item.start, lang);
  const isCamp = item.kind === 'camp';
  const end = parseEnd(item.dates.en);
  const cta = isCamp
    ? formButton({ lang, form: 'camp', label: t.register, size: 'sm' })
    : formButton({ lang, form: 'pass', label: t.pass, size: 'sm', prefill: { festival: item.id } });
  const details = isCamp ? `/${lang}/training-workshops/` : `/${lang}/events/#${esc(item.id)}`;
  return `
        <li class="cc-ticket cc-ticket--${isCamp ? 'camp' : 'festival'}">
          <div class="cc-ticket__stub">
            <time class="cc-ticket__date" datetime="${d.iso}">
              <span class="cc-ticket__day">${esc(d.day)}</span>
              <span class="cc-ticket__when"><span>${esc(monthYear)}</span><span>${esc(weekday)}</span></span>
            </time>
            <div class="cc-ticket__tags">${statusTag(item.dates, item.statusTag, lang)}<span class="cc-ticket__kind">${isCamp ? t.camp : t.festival}</span></div>
          </div>
          <div class="cc-ticket__body">
            <h${level} class="cc-ticket__title"><a href="${details}">${esc(pick(item.title, lang))}</a></h${level}>
            <ul class="cc-ticket__facts">
              <li>${icon('calendar')}<span>${esc(pick(item.dates, lang))}</span></li>
              <li>${icon('pin')}<span>${esc(pick(item.venue, lang))}</span></li>
            </ul>
            <p class="cc-ticket__count" data-cc-countdown data-start="${d.iso}" data-end="${end.toISOString().slice(0, 10)}" data-lang="${lang}" hidden></p>
            <div class="cc-ticket__actions">
              ${statusOf(item.dates, item.statusTag) === 'closed' ? '' : cta}
              <a class="cc-ticket__more" href="${details}">${t.details}${icon('arrowRight')}</a>
            </div>
          </div>
        </li>`;
}

module.exports = { renderTicket };
