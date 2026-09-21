const fs = require('fs');

const m = JSON.parse(fs.readFileSync('audit-mobile.json', 'utf8'));

console.log('=== SEO AUDITS ===');
for (const auditRef of m.categories.seo.auditRefs) {
  const a = m.audits[auditRef.id];
  if (a && a.score !== 1) {
    console.log(`[${auditRef.id}] score: ${a.score} | title: ${a.title} | val: ${a.explanation || a.displayValue || ''}`);
  }
}

console.log('\n=== ERRORS IN CONSOLE ===');
if (m.audits['errors-in-console'] && m.audits['errors-in-console'].details) {
  console.log(JSON.stringify(m.audits['errors-in-console'].details.items, null, 2));
}

console.log('\n=== ACCESSIBILITY FAILED AUDITS ===');
for (const auditRef of m.categories.accessibility.auditRefs) {
  const a = m.audits[auditRef.id];
  if (a && a.score !== 1) {
    console.log(`[${auditRef.id}] score: ${a.score} | title: ${a.title}`);
  }
}
