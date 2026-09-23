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

function upcoming(siteData, today = new Date()) {
  const cutoff = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const items = [];
  (siteData.events || []).forEach((festival) => {
    (festival.years || []).forEach((edition) => {
      const start = parseStart(edition.dates && edition.dates.en);
      if (start && start.getTime() >= cutoff) {
        items.push({ kind: 'festival', id: festival.id, start, title: festival.name, dates: edition.dates, venue: edition.venue, theme: edition.theme, highlight: edition.highlight });
      }
    });
  });
  const batch = siteData.workshops && siteData.workshops.upcomingBatch;
  if (batch) {
    const start = parseStart(batch.dates && batch.dates.en);
    if (start && start.getTime() >= cutoff) {
      items.push({ kind: 'camp', id: 'ullas', start, title: batch.title, dates: batch.dates, venue: batch.venue, theme: batch.ageGroup, status: batch.status });
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

module.exports = { upcoming, parseStart, dateBadge };
