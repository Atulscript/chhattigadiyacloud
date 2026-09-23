// Chhattisgadhiya Cloud Application Core
// Implements router, bilingual toggle, breadcrumbs, detail views & hybrid reader

import { siteData } from './data/content.js';
import { HybridMagazineReader } from './reader/hybrid-reader.js';

class ChhattisgadhiyaCloudApp {
  constructor() {
    this.currentLang = localStorage.getItem('cc_lang') || 'en';
    this.activeRoute = this.getRouteFromHash() || 'home';
    this.reader = null;
    this.init();
  }

  init() {
    this.setupRouting();
    this.renderHeaderNav();
    this.renderCurrentView();
    this.initMagazineReader();
    this.bindGlobalEvents();
  }

  getRouteFromHash() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const validRoutes = [
      'home', 'whatson', 'productions', 'events', 'workshops', 
      'magazine', 'blog', 'about', 'contact', 'press', 'support', 'gallery'
    ];
    return validRoutes.includes(hash) ? hash : 'home';
  }

  setupRouting() {
    window.addEventListener('hashchange', () => {
      this.activeRoute = this.getRouteFromHash();
      this.renderCurrentView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('cc_lang', lang);
    document.documentElement.lang = lang;

    const langLabel = document.getElementById('lang-label');
    if (langLabel) {
      langLabel.innerText = lang === 'en' ? 'हिन्दी' : 'English';
    }

    this.renderHeaderNav();
    this.renderCurrentView();

    // Re-sync reader
    if (this.reader) {
      this.reader.setLanguage(lang);
      const articles = siteData.magazine.currentIssue.articles.map((art, idx) => ({
        pageNumber: idx + 1,
        title: art.title[lang],
        author: art.author[lang],
        content: art.content[lang]
      }));
      this.reader.setPages(articles);
    }
  }

  renderHeaderNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    nav.innerHTML = siteData.nav.map(item => `
      <a href="#${item.id}" class="nav-link ${this.activeRoute === item.id ? 'active' : ''}" data-route="${item.id}">
        ${item.label[this.currentLang]}
      </a>
    `).join('');
  }

  renderCurrentView() {
    const l = this.currentLang;
    const isHi = l === 'hi';

    // Update active class on view divs
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeViewEl = document.getElementById(`view-${this.activeRoute}`);
    if (activeViewEl) {
      activeViewEl.classList.add('active');
    }

    // Update nav active state
    this.renderHeaderNav();

    // Render breadcrumb if not home
    this.renderBreadcrumbs();

    // Update brand titles and headers
    const brandTitle = document.getElementById('header-brand-title');
    if (brandTitle) brandTitle.innerText = siteData.orgName[l];
    const footerTitle = document.getElementById('footer-brand-title');
    if (footerTitle) footerTitle.innerText = siteData.orgName[l];

    // Render respective view content
    switch (this.activeRoute) {
      case 'home':
        this.renderHomeView(isHi);
        break;
      case 'whatson':
        this.renderWhatsOnView(isHi);
        break;
      case 'productions':
        this.renderProductionsView(isHi);
        break;
      case 'events':
        this.renderEventsView(isHi);
        break;
      case 'workshops':
        this.renderWorkshopsView(isHi);
        break;
      case 'blog':
        this.renderBlogView(isHi);
        break;
      case 'about':
        this.renderAboutView(isHi);
        break;
      case 'press':
        this.renderPressView(isHi);
        break;
      case 'support':
        this.renderSupportView(isHi);
        break;
    }
  }

  renderBreadcrumbs() {
    const container = document.getElementById('breadcrumb-container');
    const trail = document.getElementById('breadcrumbs');
    if (!container || !trail) return;

    if (this.activeRoute === 'home') {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    const activeNavItem = siteData.nav.find(n => n.id === this.activeRoute) ||
      siteData.footerLinks.find(f => f.id === this.activeRoute) ||
      { label: { en: this.activeRoute, hi: this.activeRoute } };

    trail.innerHTML = `
      <a href="#home">Home</a>
      <span>/</span>
      <span class="current">${activeNavItem.label[this.currentLang]}</span>
    `;
  }

  renderHomeView(isHi) {
    const l = this.currentLang;
    this.setText('hero-think-1', isHi ? "थिंक" : "Think");
    this.setText('hero-think-2', isHi ? "थिंक छत्तीसगढ़िया क्लाउड" : "Think Chhattisgadhiya Cloud");
    this.setText('hero-statement', isHi
      ? "छत्तीसगढ़िया क्लाउड — रंगमंच, राष्ट्रीय समारोहों, बाल कार्यशालाओं और वैचारिक पत्रिकाओं का सृजन करने वाला एक सांस्कृतिक संस्थान, जो माटी की जीवंत धरोहर को प्रतिष्ठित मंचों तक पहुँचाता है।"
      : "A Chhattisgarhi art and culture organisation producing theatre, festivals, workshops and publications — bringing the living spirit of our soil to national and global stages.");

    this.setText('home-whatson-title', isHi ? "आगामी कार्यक्रम (लॉन्च संस्करण)" : "What's On at Launch");
    this.setText('empty-state-home-title', isHi ? "हमारा आगामी रंग-सत्र जल्द घोषित होगा" : "The Next Programme Will Be Announced Soon");
    this.setText('empty-state-home-desc', isHi
      ? "लॉन्च के समय कोई सार्वजनिक कार्यक्रम निर्धारित नहीं है क्योंकि हमारे नाट्य दल नए दौरे और समारोहों की तैयारी कर रहे हैं। अग्रिम आरक्षण सूचना हेतु न्यूज़लेटर से जुड़ें।"
      : "No public events are scheduled for this launch date as our theatre troupes and festival committees prepare the upcoming season. Sign up for our newsletter to receive advance ticket reservations.");
  }

  renderWhatsOnView(isHi) {
    this.setText('page-title-whatson', isHi ? "आगामी कार्यक्रम" : "What's On");
    this.setText('page-desc-whatson', isHi
      ? "एक ऐसा स्थान जहाँ आगामी नाटकों, अगले महोत्सव संस्करण, खुली कार्यशालाओं और पंजीकरण की अंतिम तिथियों की पूरी सूची उपलब्ध है।"
      : "A single destination listing upcoming performances, the next festival edition, open workshop batches, and registration deadlines.");
    this.setText('whatson-full-empty-title', isHi ? "आगामी रंग-सत्र की तैयारियां जारी" : "Season Repertoire in Preparation");
    this.setText('whatson-full-empty-desc', isHi
      ? "वर्तमान में कोई सार्वजनिक कार्यक्रम निर्धारित नहीं है। गबरघिचोर के आगामी दौरे की तिथियां, जशरंग 2026 समारोह का कार्यक्रम और उल्लास 2027 के शिविर का विवरण तिथिवार यहाँ प्रकाशित किया जाएगा।"
      : "No public events are currently active for bookings. Our upcoming tour dates for Gabar Ghichor, the Jashrang 2026 festival schedule, and Ullas 2027 summer registrations will appear here chronologically once finalized.");
  }

  renderProductionsView(isHi) {
    const l = this.currentLang;
    const grid = document.getElementById('productions-list-grid');
    if (!grid) return;

    this.setText('page-title-productions', isHi ? "नाट्य प्रस्तुतियां" : "Stage Productions");
    this.setText('page-desc-productions', isHi
      ? "छत्तीसगढ़िया क्लाउड द्वारा निर्मित मौलिक नाटक — जो नाट्य महोत्सवों के आमंत्रण एवं भ्रमणशील मंचनों हेतु उपलब्ध हैं।"
      : "Original plays produced by Chhattisgadhiya Cloud, available for festival invitations and touring venue bookings.");

    grid.innerHTML = siteData.productions.map(prod => `
      <div class="production-card" onclick="window.app.openProductionDetail('${prod.id}')">
        <div class="poster-canvas" style="background:${prod.gradient}">
          <div class="poster-top">
            <span class="badge-genre">${prod.genre[l]}</span>
            <span class="badge-year">${prod.year}</span>
          </div>
          <div style="font-size:0.8rem; color:rgba(255,255,255,0.85); font-weight:600;">
            ✦ ${prod.artAesthetic}
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${prod.title[l]}</h3>
          <div class="card-subtitle">${prod.subtitle[l]}</div>
          <p class="card-synopsis">${prod.synopsis[l]}</p>
          <div class="card-meta-row">
            <div><strong>${isHi ? "निर्देशक:" : "Director:"}</strong> ${prod.director}</div>
            <div><strong>${isHi ? "अवधि व भाषा:" : "Duration & Language:"}</strong> ${prod.duration} • ${prod.language}</div>
            <div><strong>${isHi ? "उपयुक्तता:" : "Suitability:"}</strong> ${prod.ageSuitability}</div>
          </div>
          <button class="btn-secondary" style="width:100%; text-align:center; padding:0.65rem;">
            ${isHi ? "विवरण व बुकिंग देखें →" : "View Details & Booking →"}
          </button>
        </div>
      </div>
    `).join('');
  }

  openProductionDetail(id) {
    const prod = siteData.productions.find(p => p.id === id);
    if (!prod) return;

    const l = this.currentLang;
    const isHi = l === 'hi';

    const historyHtml = prod.performanceHistory.map(h => `
      <li style="margin-bottom:0.4rem;"><strong>${h.date}</strong> — ${h.venue}</li>
    `).join('');

    const reviewsHtml = prod.reviews.map(r => `
      <blockquote style="border-left:3px solid var(--c-gold); padding-left:1rem; margin:1rem 0; font-style:italic; color:var(--c-gold-light);">
        "${r.quote}" <br><small style="color:var(--c-text-muted); font-style:normal;">— ${r.critic}</small>
      </blockquote>
    `).join('');

    const modalBody = document.getElementById('modal-body-content');
    if (modalBody) {
      modalBody.innerHTML = `
        <span class="page-eyebrow">${prod.genre[l]} • ${prod.year}</span>
        <h2 style="font-family:var(--font-serif); font-size:2.2rem; color:#fff; margin-bottom:0.3rem;">${prod.title[l]}</h2>
        <div style="color:var(--c-gold); font-weight:600; font-size:1.05rem; margin-bottom:1.5rem;">${prod.subtitle[l]}</div>
        
        <div style="margin-bottom:1.5rem;">
          <h4 style="color:#fff; font-size:1.1rem; margin-bottom:0.4rem;">${isHi ? "कथा-सार (Synopsis)" : "Synopsis"}</h4>
          <p style="color:var(--c-text-secondary); line-height:1.8;">${prod.synopsis[l]}</p>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); padding:1.25rem; border-radius:10px; margin-bottom:1.5rem; font-size:0.92rem; color:var(--c-text-secondary);">
          <div><strong>${isHi ? "निर्देशक:" : "Director:"}</strong> ${prod.director}</div>
          <div style="margin-top:0.35rem;"><strong>${isHi ? "प्रमुख कलाकार:" : "Cast & Crew:"}</strong> ${prod.cast.join(', ')}</div>
          <div style="margin-top:0.35rem;"><strong>${isHi ? "अवधि, भाषा व आयु:" : "Duration, Language & Age:"}</strong> ${prod.duration} • ${prod.language} • ${prod.ageSuitability}</div>
        </div>

        <div style="margin-bottom:1.5rem;">
          <h4 style="color:#fff; font-size:1.1rem; margin-bottom:0.5rem;">${isHi ? "मंचन इतिहास (Performance History)" : "Performance History"}</h4>
          <ul style="padding-left:1.25rem; color:var(--c-text-secondary); font-size:0.92rem;">
            ${historyHtml}
          </ul>
        </div>

        ${reviewsHtml}

        <div style="border-top:1px solid var(--border-glass); padding-top:1.5rem; margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <span style="color:#22c55e; font-weight:700;">✓ Available for Festival Invitations & Touring</span>
          </div>
          <a href="#contact" class="btn-primary" onclick="document.getElementById('detail-modal').classList.add('hidden');">
            ${isHi ? "मंचन आमंत्रण हेतु संपर्क करें" : "Enquire for Booking / Invitation"}
          </a>
        </div>
      `;
      document.getElementById('detail-modal').classList.remove('hidden');
    }
  }

  renderEventsView(isHi) {
    const l = this.currentLang;
    const jashrangGrid = document.getElementById('jashrang-year-tiles');
    const kavitaGrid = document.getElementById('kavita-year-tiles');

    if (jashrangGrid) {
      jashrangGrid.innerHTML = siteData.events[0].years.map(y => `
        <div class="year-tile" onclick="window.app.openEventYearDetail('jashrang', '${y.year}')">
          <div class="year-num">${y.year}</div>
          <div class="year-theme">${y.theme[l]}</div>
          <div class="year-meta">${y.dates[l]} • ${y.venue[l]}</div>
          <div class="year-desc">${y.highlight[l]}</div>
          <div style="margin-top:1rem; color:var(--c-gold); font-size:0.85rem; font-weight:700;">
            ${isHi ? "पूर्ण कार्यक्रम व विवरण देखें →" : "View Programme & Details →"}
          </div>
        </div>
      `).join('');
    }

    if (kavitaGrid) {
      kavitaGrid.innerHTML = siteData.events[1].years.map(y => `
        <div class="year-tile" onclick="window.app.openEventYearDetail('kavita', '${y.year}')">
          <div class="year-num">${y.year}</div>
          <div class="year-theme">${y.theme[l]}</div>
          <div class="year-meta">${y.dates[l]} • ${y.venue[l]}</div>
          <div class="year-desc">${y.highlight[l]}</div>
          <div style="margin-top:1rem; color:var(--c-gold); font-size:0.85rem; font-weight:700;">
            ${isHi ? "पूर्ण कार्यक्रम व विवरण देखें →" : "View Programme & Details →"}
          </div>
        </div>
      `).join('');
    }
  }

  openEventYearDetail(eventId, year) {
    const event = siteData.events.find(e => e.id === eventId || (eventId === 'kavita' && e.id === 'jashpur-kavita-utsav'));
    if (!event) return;
    const edition = event.years.find(y => y.year === year);
    if (!edition) return;

    const l = this.currentLang;
    const isHi = l === 'hi';

    const scheduleHtml = (edition.schedule || []).map(s => `
      <div style="border-bottom:1px solid var(--border-glass); padding:0.6rem 0; display:flex; justify-content:space-between; font-size:0.9rem;">
        <div><strong>${s.day} (${s.time}):</strong> ${s.event}</div>
        <div style="color:var(--c-gold);">${s.group}</div>
      </div>
    `).join('');

    const modalBody = document.getElementById('modal-body-content');
    if (modalBody) {
      modalBody.innerHTML = `
        <span class="page-eyebrow">${event.name[l]} • Year Archive (Pattern A)</span>
        <h2 style="font-family:var(--font-serif); font-size:2.2rem; color:#fff; margin-bottom:0.25rem;">
          ${year} Edition: ${edition.theme[l]}
        </h2>
        <div style="color:var(--c-gold); font-weight:600; margin-bottom:1.5rem;">
          📅 ${edition.dates[l]} • 📍 ${edition.venue[l]}
        </div>

        <p style="color:var(--c-text-secondary); line-height:1.8; margin-bottom:1.5rem;">
          ${edition.highlight[l]}
        </p>

        <h4 style="color:#fff; font-size:1.15rem; margin-bottom:0.75rem;">
          ${isHi ? "समारोह समय-सारिणी (Programme Schedule)" : "Festival Schedule & Performances"}
        </h4>
        <div style="background:rgba(255,255,255,0.03); padding:1rem 1.25rem; border-radius:10px; margin-bottom:1.5rem;">
          ${scheduleHtml || "<p>Schedule details recorded in festival archives.</p>"}
        </div>

        <div style="border-top:1px solid var(--border-glass); padding-top:1rem; font-size:0.85rem; color:var(--c-text-muted);">
          <strong>${isHi ? "सहयोगी एवं संरक्षक:" : "Sponsors & Partners:"}</strong> ${(edition.sponsors || []).join(', ')}
        </div>
      `;
      document.getElementById('detail-modal').classList.remove('hidden');
    }
  }

  renderWorkshopsView(isHi) {
    const l = this.currentLang;
    const grid = document.getElementById('ullas-year-tiles');
    if (!grid) return;

    grid.innerHTML = siteData.workshops.years.map(y => `
      <div class="year-tile">
        <div class="year-num">${y.year}</div>
        <div class="year-theme">${y.theme[l]}</div>
        <div class="year-meta">👥 ${y.participants} • 📅 ${y.dates ? y.dates[l] : ''}</div>
        <div class="year-desc"><strong>${isHi ? "प्रशिक्षक:" : "Facilitators:"}</strong> ${y.facilitators}</div>
        <div class="year-desc" style="margin-top:0.4rem;"><strong>${isHi ? "उपलब्धि:" : "Outcome:"}</strong> ${y.outcome[l]}</div>
      </div>
    `).join('');
  }

  renderBlogView(isHi) {
    const l = this.currentLang;
    const grid = document.getElementById('blog-list-grid');
    if (!grid) return;

    grid.innerHTML = siteData.blog.posts.map(p => `
      <div class="production-card" style="padding:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--c-gold); text-transform:uppercase; letter-spacing:0.08em;">${p.category}</span>
          <span style="font-size:0.82rem; color:var(--c-text-muted);">${p.date}</span>
        </div>
        <h3 class="card-title" style="font-size:1.45rem; margin-bottom:0.75rem;">${p.title[l]}</h3>
        <p class="card-synopsis">${p.excerpt[l]}</p>
        <div style="font-size:0.85rem; color:var(--c-text-muted); margin-bottom:1.25rem;">
          By <strong>${p.author}</strong> • <em>301 redirect active from Blogspot</em>
        </div>
        <div style="background:rgba(255,255,255,0.03); padding:1rem; border-radius:8px; font-size:0.9rem; color:var(--c-text-secondary); line-height:1.7;">
          ${p.content[l]}
        </div>
      </div>
    `).join('');
  }

  renderAboutView(isHi) {
    const l = this.currentLang;
    this.setText('about-mission-text', siteData.about.mission[l]);
    this.setText('about-vision-text', siteData.about.vision[l]);
    this.setText('about-cultural-text', siteData.about.culturalConnection[l]);

    const teamContainer = document.getElementById('about-team-list');
    if (teamContainer) {
      teamContainer.innerHTML = siteData.about.team.map(m => `
        <div class="production-card" style="padding:2rem;">
          <div style="width:50px; height:50px; border-radius:50%; background:rgba(212,175,55,0.15); border:1.5px solid var(--c-gold); display:flex; align-items:center; justify-content:center; color:var(--c-gold); font-size:1.4rem; margin-bottom:1rem;">
            🎭
          </div>
          <h4 style="font-family:var(--font-serif); font-size:1.45rem; font-weight:700; color:#fff; margin-bottom:0.25rem;">${m.name}</h4>
          <div style="font-size:0.88rem; font-weight:600; color:var(--c-gold); margin-bottom:0.85rem;">${m.role[l]}</div>
          <p style="font-size:0.92rem; color:var(--c-text-secondary); line-height:1.75;">${m.bio[l]}</p>
        </div>
      `).join('');
    }
  }

  renderPressView(isHi) {
    const l = this.currentLang;
    this.setText('press-short-desc', siteData.pressKit.boilerplateShort[l]);
    this.setText('press-contact-info', siteData.pressKit.contactPerson);
  }

  renderSupportView(isHi) {
    const l = this.currentLang;
    const grid = document.getElementById('partners-list-grid');
    if (grid) {
      grid.innerHTML = siteData.partners.map(p => `
        <div class="production-card" style="padding:1.75rem; text-align:center;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🏛️</div>
          <h4 style="font-family:var(--font-serif); font-size:1.25rem; color:#fff; margin-bottom:0.35rem;">${p.name}</h4>
          <span style="font-size:0.82rem; color:var(--c-gold); font-weight:600; text-transform:uppercase;">${p.category[l]}</span>
        </div>
      `).join('');
    }
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }

  initMagazineReader() {
    const l = this.currentLang;
    const articles = siteData.magazine.currentIssue.articles.map((art, idx) => ({
      pageNumber: idx + 1,
      title: art.title[l],
      author: art.author[l],
      content: art.content[l]
    }));

    this.reader = new HybridMagazineReader('magazine-reader-mount', {
      lang: this.currentLang,
      mode: 'flip',
      pages: articles
    });
  }

  bindGlobalEvents() {
    // Language Toggle
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const nextLang = this.currentLang === 'en' ? 'hi' : 'en';
        this.setLanguage(nextLang);
      });
    }

    // Route links click interceptor
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.route-link');
      if (link && link.getAttribute('data-route')) {
        const targetRoute = link.getAttribute('data-route');
        window.location.hash = targetRoute;
      }
    });

    // Modal close buttons
    const closeDetail = document.getElementById('btn-close-detail-modal');
    const detailModal = document.getElementById('detail-modal');
    if (closeDetail && detailModal) {
      closeDetail.addEventListener('click', () => detailModal.classList.add('hidden'));
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) detailModal.classList.add('hidden');
      });
    }

    const openEnrol = document.getElementById('btn-open-enrol-modal');
    const closeEnrol = document.getElementById('btn-close-enrol-modal');
    const enrolModal = document.getElementById('enrol-modal');
    if (openEnrol && enrolModal) {
      openEnrol.addEventListener('click', () => enrolModal.classList.remove('hidden'));
    }
    if (closeEnrol && enrolModal) {
      closeEnrol.addEventListener('click', () => enrolModal.classList.add('hidden'));
      enrolModal.addEventListener('click', (e) => {
        if (e.target === enrolModal) enrolModal.classList.add('hidden');
      });
    }
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChhattisgadhiyaCloudApp();
});
