// Chhattisgadhiya Cloud - short forms (build time, Node).
// Every "contact us about X" call to action opens one of these dialogs instead
// of a generic contact page. Each form: name, phone/WhatsApp and 2-3 fields.
// Submission (src/site/site.js): POST to siteData.formsEndpoint when set,
// otherwise the request is handed to WhatsApp/email with a confirmation state.

const { esc, pick, icon } = require('./ui.js');

const t = (en, hi) => ({ en, hi });

const COMMON = {
  name: { type: 'text', label: t('Your name', 'आपका नाम'), autocomplete: 'name', required: true },
  phone: { type: 'tel', label: t('Phone / WhatsApp', 'फ़ोन / व्हाट्सएप'), autocomplete: 'tel', required: true, hint: t('10-digit mobile number', '10 अंकों का मोबाइल नंबर') },
};

// Options that depend on site data are filled in by buildForms().
function buildForms(siteData) {
  const plays = (siteData.productions || []).map((p) => ({ value: p.id, label: p.title }));
  const festivals = (siteData.events || []).map((e) => ({ value: e.id, label: e.name }));
  return {
    booking: {
      title: t('Book a play', 'नाटक बुक करें'),
      intro: t('Tell us where and when. We will reply with availability and costs.', 'कहां और कब, यह बताएं। हम उपलब्धता और खर्च की जानकारी भेजेंगे।'),
      fields: [
        { name: 'play', type: 'select', label: t('Play', 'नाटक'), options: [...plays, { value: 'any', label: t('Not sure yet', 'अभी तय नहीं') }] },
        { name: 'city', type: 'text', label: t('City and venue', 'शहर और स्थान'), required: true, autocomplete: 'address-level2' },
        { name: 'when', type: 'text', label: t('Preferred month or date', 'पसंदीदा महीना या तिथि') },
      ],
      submit: t('Send request', 'अनुरोध भेजें'),
    },
    troupe: {
      title: t('Apply to perform at Jashrang', 'जशरंग में प्रस्तुति हेतु आवेदन'),
      intro: t('Theatre groups, college drama clubs and solo performers can apply for the next edition.', 'नाट्य दल, कॉलेज ड्रामा क्लब और एकल कलाकार अगले संस्करण के लिए आवेदन कर सकते हैं।'),
      fields: [
        { name: 'group', type: 'text', label: t('Group name', 'दल का नाम'), required: true },
        { name: 'production', type: 'text', label: t('Play you want to bring', 'आप कौन सा नाटक लाना चाहते हैं'), required: true },
        { name: 'city', type: 'text', label: t('Based in (city)', 'शहर'), autocomplete: 'address-level2' },
      ],
      submit: t('Send application', 'आवेदन भेजें'),
    },
    pass: {
      title: t('Reserve free festival passes', 'निःशुल्क समारोह पास आरक्षित करें'),
      intro: t('Entry is free, but seats are limited. Reserve and we will confirm on WhatsApp.', 'प्रवेश निःशुल्क है, पर सीटें सीमित हैं। आरक्षण करें, हम व्हाट्सएप पर पुष्टि करेंगे।'),
      fields: [
        { name: 'festival', type: 'select', label: t('Festival', 'समारोह'), options: festivals },
        { name: 'count', type: 'select', label: t('Number of passes', 'पास की संख्या'), options: ['1', '2', '3', '4', '5'].map((n) => ({ value: n, label: t(n, n) })) },
      ],
      submit: t('Reserve passes', 'पास आरक्षित करें'),
    },
    poet: {
      title: t('Register as a poet', 'कवि के रूप में पंजीकरण'),
      intro: t('Poets and storytellers in any language of the region are welcome at Kavita Utsav.', 'कविता उत्सव में क्षेत्र की किसी भी भाषा के कवियों और कथाकारों का स्वागत है।'),
      fields: [
        { name: 'language', type: 'text', label: t('Language(s) you write in', 'आप किस भाषा में लिखते हैं'), required: true },
        { name: 'city', type: 'text', label: t('City or village', 'शहर या गांव'), autocomplete: 'address-level2' },
        { name: 'session', type: 'select', label: t('Session', 'सत्र'), options: [
          { value: 'recital', label: t('Poetry recital', 'काव्य पाठ') },
          { value: 'open-mic', label: t('Youth open mic', 'युवा खुला मंच') },
        ] },
      ],
      submit: t('Register', 'पंजीकरण करें'),
    },
    camp: {
      title: t('Register for Ullas Summer Camp', 'उल्लास समर कैम्प पंजीकरण'),
      intro: t('For parents and guardians. We will call to confirm the batch and share details.', 'अभिभावकों के लिए। बैच की पुष्टि और जानकारी के लिए हम फ़ोन करेंगे।'),
      nameLabel: t("Parent's name", 'अभिभावक का नाम'),
      fields: [
        { name: 'child', type: 'text', label: t("Child's name", 'बच्चे का नाम'), required: true },
        { name: 'age', type: 'select', label: t("Child's age", 'बच्चे की आयु'), required: true, options: Array.from({ length: 10 }, (_, i) => String(i + 7)).map((n) => ({ value: n, label: t(n, n) })) },
        { name: 'village', type: 'text', label: t('Village or town', 'गांव या शहर'), autocomplete: 'address-level2' },
      ],
      submit: t('Register child', 'पंजीकरण करें'),
    },
    volunteer: {
      title: t('Volunteer at our festivals', 'समारोह में स्वयंसेवक बनें'),
      intro: t('Help with the stage, audience, food or photography. Students are welcome.', 'मंच, दर्शक व्यवस्था, भोजन या फ़ोटोग्राफ़ी में मदद करें। विद्यार्थियों का स्वागत है।'),
      fields: [
        { name: 'festival', type: 'select', label: t('Festival', 'समारोह'), options: festivals },
        { name: 'help', type: 'select', label: t('How you can help', 'आप कैसे मदद कर सकते हैं'), options: [
          { value: 'stage', label: t('Stage and backstage', 'मंच और बैकस्टेज') },
          { value: 'audience', label: t('Audience and passes', 'दर्शक और पास') },
          { value: 'food', label: t('Food and stay', 'भोजन और ठहराव') },
          { value: 'media', label: t('Photos and social media', 'फ़ोटो और सोशल मीडिया') },
        ] },
      ],
      submit: t('Sign up', 'जुड़ें'),
    },
    partner: {
      title: t('Support or partner with us', 'सहयोग या साझेदारी'),
      intro: t('Sponsor a festival night, fund a camp scholarship, or partner on a project.', 'समारोह की एक संध्या प्रायोजित करें, शिविर छात्रवृत्ति दें, या किसी परियोजना में साझेदार बनें।'),
      fields: [
        { name: 'organisation', type: 'text', label: t('Organisation (optional)', 'संस्था (वैकल्पिक)'), autocomplete: 'organization' },
        { name: 'interest', type: 'select', label: t('Interested in', 'रुचि'), options: [
          { value: 'festival', label: t('Sponsoring a festival', 'समारोह प्रायोजन') },
          { value: 'camp', label: t('Camp scholarships', 'शिविर छात्रवृत्ति') },
          { value: 'csr', label: t('CSR or grant partnership', 'CSR या अनुदान साझेदारी') },
          { value: 'other', label: t('Something else', 'कुछ और') },
        ] },
        { name: 'email', type: 'email', label: t('Email (optional)', 'ईमेल (वैकल्पिक)'), autocomplete: 'email' },
      ],
      submit: t('Send', 'भेजें'),
    },
    press: {
      title: t('Press request', 'प्रेस अनुरोध'),
      intro: t('Interviews, photos, review seats or the full press kit.', 'साक्षात्कार, फ़ोटो, समीक्षा हेतु सीट या पूरी प्रेस किट।'),
      fields: [
        { name: 'outlet', type: 'text', label: t('Publication or channel', 'प्रकाशन या चैनल'), required: true },
        { name: 'request', type: 'select', label: t('You need', 'आपको चाहिए'), options: [
          { value: 'kit', label: t('Press kit and photos', 'प्रेस किट और फ़ोटो') },
          { value: 'interview', label: t('An interview', 'साक्षात्कार') },
          { value: 'seats', label: t('Review seats', 'समीक्षा हेतु सीट') },
        ] },
        { name: 'email', type: 'email', label: t('Email', 'ईमेल'), required: true, autocomplete: 'email' },
      ],
      submit: t('Send request', 'अनुरोध भेजें'),
    },
    contact: {
      title: t('Send us a message', 'हमें संदेश भेजें'),
      intro: t('We read every message and reply by phone or email.', 'हम हर संदेश पढ़ते हैं और फ़ोन या ईमेल से उत्तर देते हैं।'),
      fields: [
        { name: 'topic', type: 'select', label: t('About', 'विषय'), options: [
          { value: 'general', label: t('General question', 'सामान्य प्रश्न') },
          { value: 'magazine', label: t('Magazine', 'पत्रिका') },
          { value: 'workshops', label: t('Workshops', 'कार्यशालाएं') },
          { value: 'other', label: t('Something else', 'कुछ और') },
        ] },
        { name: 'message', type: 'textarea', label: t('Message', 'संदेश'), required: true },
      ],
      submit: t('Send message', 'संदेश भेजें'),
    },
  };
}

const UI = {
  en: {
    close: 'Close', required: 'Please fill in the fields marked required.', phoneInvalid: 'Please enter a valid 10-digit phone number.',
    optional: 'optional', sending: 'Sending…', failed: 'Something went wrong. Please try again or call us.',
    doneTitle: 'Thank you!', doneSent: "We've received your request and will contact you soon.",
    doneHandoff: 'One last step: send these details to us on WhatsApp or email so we can confirm.',
    whatsapp: 'Send on WhatsApp', email: 'Send by email', again: 'Done',
  },
  hi: {
    close: 'बंद करें', required: 'कृपया आवश्यक जानकारी भरें।', phoneInvalid: 'कृपया सही 10 अंकों का फ़ोन नंबर लिखें।',
    optional: 'वैकल्पिक', sending: 'भेजा जा रहा है…', failed: 'कुछ गड़बड़ हुई। कृपया फिर कोशिश करें या हमें फ़ोन करें।',
    doneTitle: 'धन्यवाद!', doneSent: 'आपका अनुरोध मिल गया है, हम जल्द संपर्क करेंगे।',
    doneHandoff: 'अंतिम चरण: पुष्टि के लिए ये विवरण हमें व्हाट्सएप या ईमेल पर भेजें।',
    whatsapp: 'व्हाट्सएप पर भेजें', email: 'ईमेल से भेजें', again: 'ठीक है',
  },
};

function renderField(field, lang, formId) {
  const id = `cc-${formId}-${field.name}`;
  const req = field.required ? ' required' : '';
  const ac = field.autocomplete ? ` autocomplete="${field.autocomplete}"` : '';
  const label = `<label for="${id}">${esc(pick(field.label, lang))}</label>`;
  const hint = field.hint ? `<span class="cc-hint" id="${id}-hint">${esc(pick(field.hint, lang))}</span>` : '';
  const describedBy = field.hint ? ` aria-describedby="${id}-hint"` : '';
  let control;
  if (field.type === 'select') {
    control = `<select class="cc-input" id="${id}" name="${field.name}"${req}>${field.options.map((o) => `<option value="${esc(o.value)}">${esc(pick(o.label, lang))}</option>`).join('')}</select>`;
  } else if (field.type === 'textarea') {
    control = `<textarea class="cc-input" id="${id}" name="${field.name}" rows="4"${req}></textarea>`;
  } else {
    const extra = field.type === 'tel' ? ' inputmode="tel" pattern="[0-9+ ]{10,15}"' : '';
    control = `<input class="cc-input" id="${id}" name="${field.name}" type="${field.type}"${ac}${extra}${req}${describedBy}>`;
  }
  return `<div class="cc-field">${label}${control}${hint}</div>`;
}

function renderFormBody(formId, form, lang) {
  const ui = UI[lang];
  const nameField = form.nameLabel ? { ...COMMON.name, label: form.nameLabel } : COMMON.name;
  return `
      <form class="cc-form" data-cc-form-id="${formId}" data-cc-form-title="${esc(pick(form.title, lang))}" novalidate>
        <div class="cc-field-row">
          ${renderField({ name: 'name', ...nameField }, lang, formId)}
          ${renderField({ name: 'phone', ...COMMON.phone }, lang, formId)}
        </div>
        ${form.fields.map((f) => renderField(f, lang, formId)).join('')}
        <p class="cc-form-error" role="alert" hidden data-required="${esc(ui.required)}" data-phone="${esc(ui.phoneInvalid)}" data-failed="${esc(ui.failed)}"></p>
        <div class="cc-dialog__foot">
          <button type="submit" class="cc-btn cc-btn--primary" data-sending="${esc(ui.sending)}">${esc(pick(form.submit, lang))}</button>
        </div>
      </form>
      <div class="cc-done" hidden>
        <span class="cc-done__icon">${icon('check')}</span>
        <h2 class="cc-h3">${ui.doneTitle}</h2>
        <p data-cc-done-text data-sent="${esc(ui.doneSent)}" data-handoff="${esc(ui.doneHandoff)}"></p>
        <pre class="cc-done__summary" data-cc-summary hidden></pre>
        <div class="cc-actions">
          <a class="cc-btn cc-btn--primary" data-cc-send="whatsapp" target="_blank" rel="noopener" hidden>${ui.whatsapp}</a>
          <a class="cc-btn cc-btn--secondary" data-cc-send="email" hidden>${ui.email}</a>
          <button type="button" class="cc-btn cc-btn--secondary" data-cc-dialog-close>${ui.again}</button>
        </div>
      </div>`;
}

// Dialogs for the forms referenced on a page (data-cc-form="…").
function renderFormDialogs(formIds, siteData, lang) {
  const forms = buildForms(siteData);
  const ui = UI[lang];
  return [...new Set(formIds)].filter((id) => forms[id]).map((id) => {
    const form = forms[id];
    return `
  <dialog class="cc-dialog" id="cc-form-${id}" aria-labelledby="cc-form-${id}-title">
    <button type="button" class="cc-icon-btn cc-dialog__close" data-cc-dialog-close aria-label="${ui.close}">${icon('close')}</button>
    <div class="cc-dialog__panel">
      <h2 class="cc-h2 cc-dialog__title" id="cc-form-${id}-title">${esc(pick(form.title, lang))}</h2>
      <p class="cc-dialog__intro">${esc(pick(form.intro, lang))}</p>
      ${renderFormBody(id, form, lang)}
    </div>
  </dialog>`;
  }).join('');
}

// An inline (non-dialog) form, e.g. on the contact page.
function renderInlineForm(id, siteData, lang) {
  const form = buildForms(siteData)[id];
  return `
    <section class="cc-card" id="form-${id}" aria-labelledby="cc-inline-${id}-title">
      <div class="cc-card__body" data-cc-inline-form>
        <h2 class="cc-h3" id="cc-inline-${id}-title">${esc(pick(form.title, lang))}</h2>
        <p class="cc-muted" style="margin-bottom:0.75rem">${esc(pick(form.intro, lang))}</p>
        ${renderFormBody(`${id}-inline`, form, lang)}
      </div>
    </section>`;
}

module.exports = { buildForms, renderFormDialogs, renderInlineForm };
