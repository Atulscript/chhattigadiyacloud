// Chhattisgadhiya Cloud - upcoming programme, derived from site data (Node).
// Festivals (siteData.events[].years) and the next Ullas camp are merged into
// one dated list so What's On and the homepage always agree.

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

// Parses the start of English date ranges such as "October 02–03, 2026",
// "November 14–18, 2026" or "May 10 – June 02, 2027".
function parseStart(text) {
  const m = /([A-Za-z]+)\s+(\d{1,2})/.exec(text || '');
  const y = /(\d{4})\s*$/.exec(text || '');
  if (!m || !y) return null;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  if (month < 0) return null;
  return new Date(Date.UTC(+y[1], month, +m[2]));
}

// End of the same ranges: "November 14–18, 2026" -> Nov 18, "May 10 – June 02, 2027"
// -> Jun 2. Single dates end on their start.
function parseEnd(text) {
  const start = parseStart(text);
  if (!start) return null;
  const y = +/(\d{4})\s*$/.exec(text)[1];
  const range = /[–-]\s*(?:([A-Za-z]+)\s+)?(\d{1,2})\s*,/.exec(text);
  if (!range) return start;
  const month = range[1] ? MONTHS.indexOf(range[1].toLowerCase()) : start.getUTCMonth();
  return month < 0 ? start : new Date(Date.UTC(y, month, +range[2]));
}

// Status tag for an event: an admin override ("open" / "upcoming" / "closed"),
// otherwise from the dates: over -> closed; running or starting within
// OPEN_DAYS -> open; later -> upcoming. site.js repeats this in the browser so
// the tag stays right between deploys.
const OPEN_DAYS = 30;
const STATUSES = ['open', 'upcoming', 'closed'];
const STATUS_LABEL = {
  en: { open: 'Open', upcoming: 'Upcoming', closed: 'Closed' },
  hi: { open: 'खुला', upcoming: 'आगामी', closed: 'बंद' },
};
function dayStart(today) { return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()); }
function statusOf(dates, override, today = new Date()) {
  if (STATUSES.includes(override)) return override;
  const text = dates && dates.en;
  const start = parseStart(text); const end = parseEnd(text);
  if (!start) return 'upcoming';
  const now = dayStart(today);
  if (end.getTime() < now) return 'closed';
  return start.getTime() - now <= OPEN_DAYS * 86400000 ? 'open' : 'upcoming';
}
function statusTag(dates, override, lang) {
  const status = statusOf(dates, override);
  const labels = STATUS_LABEL[lang] || STATUS_LABEL.en;
  const auto = !STATUSES.includes(override) && parseStart(dates && dates.en);
  const data = auto
    ? ` data-cc-status data-start="${parseStart(dates.en).toISOString().slice(0, 10)}" data-end="${parseEnd(dates.en).toISOString().slice(0, 10)}" data-open-days="${OPEN_DAYS}" data-labels='${JSON.stringify(labels)}'`
    : '';
  return `<span class="cc-status cc-status--${status}"${data}>${labels[status]}</span>`;
}

function upcoming(siteData, today = new Date()) {
  const cutoff = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const items = [];
  (siteData.events || []).forEach((festival) => {
    (festival.years || []).forEach((edition) => {
      const start = parseStart(edition.dates && edition.dates.en);
      if (start && parseEnd(edition.dates.en).getTime() >= cutoff) {
        items.push({ kind: 'festival', id: festival.id, start, title: festival.name, dates: edition.dates, venue: edition.venue, theme: edition.theme, highlight: edition.highlight, statusTag: edition.statusTag });
      }
    });
  });
  const batch = siteData.workshops && siteData.workshops.upcomingBatch;
  if (batch) {
    const start = parseStart(batch.dates && batch.dates.en);
    if (start && parseEnd(batch.dates.en).getTime() >= cutoff) {
      items.push({ kind: 'camp', id: 'ullas', start, title: batch.title, dates: batch.dates, venue: batch.venue, theme: batch.ageGroup, status: batch.status, statusTag: batch.statusTag });
    }
  }
  return items.sort((a, b) => a.start - b.start);
}

function dateBadge(start, lang) {
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  return {
    day: String(start.getUTCDate()),
    month: new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(start),
    iso: start.toISOString().slice(0, 10),
  };
}

module.exports = { upcoming, parseStart, parseEnd, dateBadge, statusOf, statusTag };
