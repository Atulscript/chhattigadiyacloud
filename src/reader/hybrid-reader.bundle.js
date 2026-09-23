// Kindle-Style Hybrid Magazine Reader
// High-comfort e-reader typography, Bookerly/Ember fonts, Paperwhite/Sepia/Dark themes,
// "Aa" appearance settings popover, tap-zones, and reading progress bar.
// Zero third-party trackers, 100% client-side.

class HybridMagazineReader {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    const isMobile = window.innerWidth <= 860;
    
    // Retrieve stored reader preferences
    let savedTheme = 'paperwhite';
    let savedFontFamily = 'serif';
    let savedFontSize = isMobile ? 16 : 18;
    let savedLineSpacing = 'normal';
    let savedMarginWidth = 'normal';
    let savedMode = 'kindle'; // default to Kindle focus reading mode

    try {
      const storedTheme = localStorage.getItem('cgcloud_kindle_theme');
      if (storedTheme && ['paperwhite', 'white', 'sepia', 'dark'].includes(storedTheme)) {
        savedTheme = storedTheme;
      }
      const storedFont = localStorage.getItem('cgcloud_kindle_font');
      if (storedFont && ['serif', 'sans'].includes(storedFont)) {
        savedFontFamily = storedFont;
      }
      const storedSize = parseInt(localStorage.getItem('cgcloud_kindle_fontsize'), 10);
      if (!isNaN(storedSize) && storedSize >= 14 && storedSize <= 26) {
        savedFontSize = storedSize;
      }
      const storedSpacing = localStorage.getItem('cgcloud_kindle_spacing');
      if (storedSpacing && ['compact', 'normal', 'relaxed'].includes(storedSpacing)) {
        savedLineSpacing = storedSpacing;
      }
      const storedMargin = localStorage.getItem('cgcloud_kindle_margin');
      if (storedMargin && ['narrow', 'normal', 'wide'].includes(storedMargin)) {
        savedMarginWidth = storedMargin;
      }
      const storedMode = localStorage.getItem('cgcloud_kindle_mode');
      if (storedMode && ['kindle', 'spread'].includes(storedMode)) {
        savedMode = storedMode;
      }
    } catch (_) {}

    this.options = {
      lang: options.lang || "en",
      mode: options.mode || savedMode, // "kindle" (single page focus) or "spread" (2-page book spread)
      theme: options.theme || savedTheme,
      fontFamily: options.fontFamily || savedFontFamily,
      fontSize: options.fontSize || savedFontSize,
      lineSpacing: options.lineSpacing || savedLineSpacing,
      marginWidth: options.marginWidth || savedMarginWidth,
      pages: options.pages || [],
      freePageLimit: options.freePageLimit !== undefined ? options.freePageLimit : 5,
      onPaywallTrigger: options.onPaywallTrigger || null,
      ...options
    };

    this.currentPage = 1;
    this.totalPages = this.options.pages.length || 1;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isAaMenuOpen = false;

    if (this.isReducedMotion && this.options.mode === "spread") {
      this.options.mode = "kindle";
    }

    this.init();
  }

  init() {
    this.render();
    this.bindGlobalEvents();
  }

  setLanguage(lang) {
    this.options.lang = lang;
    this.render();
  }

  setPages(pages) {
    this.options.pages = pages;
    this.totalPages = pages.length;
    this.currentPage = 1;
    this.render();
  }

  setTheme(theme) {
    if (!['paperwhite', 'white', 'sepia', 'dark'].includes(theme)) return;
    this.options.theme = theme;
    try { localStorage.setItem('cgcloud_kindle_theme', theme); } catch (_) {}
    this.applyShellClasses();
  }

  setFontFamily(font) {
    if (!['serif', 'sans'].includes(font)) return;
    this.options.fontFamily = font;
    try { localStorage.setItem('cgcloud_kindle_font', font); } catch (_) {}
    this.applyShellClasses();
  }

  setLineSpacing(spacing) {
    if (!['compact', 'normal', 'relaxed'].includes(spacing)) return;
    this.options.lineSpacing = spacing;
    try { localStorage.setItem('cgcloud_kindle_spacing', spacing); } catch (_) {}
    this.applyShellClasses();
  }

  setMarginWidth(margin) {
    if (!['narrow', 'normal', 'wide'].includes(margin)) return;
    this.options.marginWidth = margin;
    try { localStorage.setItem('cgcloud_kindle_margin', margin); } catch (_) {}
    this.applyShellClasses();
  }

  setFontSize(size) {
    const bounded = Math.max(14, Math.min(26, size));
    this.options.fontSize = bounded;
    try { localStorage.setItem('cgcloud_kindle_fontsize', bounded.toString()); } catch (_) {}
    const shell = document.getElementById('reader-main-shell');
    if (shell) {
      shell.style.setProperty('--reader-font-size', `${bounded}px`);
    }
    const indicator = document.getElementById('font-indicator');
    if (indicator) {
      indicator.textContent = `${bounded}px`;
    }
  }

  applyShellClasses() {
    const shell = document.getElementById('reader-main-shell');
    if (!shell) return;
    
    // Clean existing state classes
    shell.className = `reader-shell theme-${this.options.theme} font-${this.options.fontFamily} spacing-${this.options.lineSpacing} margin-${this.options.marginWidth}`;
    if (this.isFullscreen) shell.classList.add('is-fullscreen');

    // Update active states in Aa menu buttons
    this.container.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-theme') === this.options.theme);
    });
    this.container.querySelectorAll('[data-set-font]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-font') === this.options.fontFamily);
    });
    this.container.querySelectorAll('[data-set-spacing]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-spacing') === this.options.lineSpacing);
    });
    this.container.querySelectorAll('[data-set-margin]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-margin') === this.options.marginWidth);
    });
  }

  goToPage(pageNum) {
    if (pageNum > this.options.freePageLimit) {
      this.triggerPaywall(pageNum);
      return;
    }
    const target = Math.max(1, Math.min(this.totalPages, pageNum));
    if (target === this.currentPage) return;
    
    if (this.options.mode === 'spread') {
      this.triggerFlipEffect(() => {
        this.currentPage = target;
        this.render();
      });
    } else {
      this.currentPage = target;
      this.render();
    }
  }

  render() {
    if (!this.container) return;

    const isHi = this.options.lang === "hi";
    const pages = this.options.pages;
    const pageIndex = this.currentPage - 1;
    const current = pages[pageIndex] || { title: "", author: "", excerpt: "", content: "" };

    const t = {
      kindleMode: isHi ? "📱 किंडल फोकस व्यू" : "📱 Kindle View",
      spreadMode: isHi ? "📖 2-पृष्ठ पुस्तक" : "📖 2-Page Spread",
      converter: isHi ? "⚙️ PDF टूल" : "⚙️ PDF Tools",
      prev: isHi ? "‹ पिछला पृष्ठ" : "‹ Previous Page",
      next: isHi ? "अगला पृष्ठ ›" : "Next Page ›",
      page: isHi ? "पृष्ठ" : "Page",
      of: isHi ? "का" : "of",
      download: isHi ? "PDF अंक" : "PDF Issue",
      fullscreen: isHi ? "⛶ पूर्ण स्क्रीन" : "⛶ Fullscreen",
      aaTitle: isHi ? "पठन शैली (Aa)" : "Reading Appearance (Aa)"
    };

    // Calculate reading stats for Kindle progress bar
    const progressPercent = Math.round((this.currentPage / this.totalPages) * 100);
    const pagesRemaining = this.totalPages - this.currentPage;
    const minsRemaining = Math.max(1, pagesRemaining * 2);

    // Build thumbnail navigation strip
    const thumbnailsHtml = this.options.pages.map((p, idx) => {
      const pNum = idx + 1;
      const isActive = pNum === this.currentPage;
      const isLocked = pNum > this.options.freePageLimit;
      const shortTitle = p.title ? p.title.split(':')[0] : `${t.page} ${pNum}`;
      const titleAttr = isLocked 
        ? (isHi ? `🔒 पृष्ठ ${pNum} अनलॉक करने हेतु ₹99 में सदस्यता लें` : `🔒 Page ${pNum} requires ₹99 subscription`)
        : (p.title || '');
      return `
        <button type="button" class="reader-thumb-chip ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-jump-page="${pNum}" title="${titleAttr}">
          <span class="thumb-chip-num">${isLocked ? '🔒 ' + pNum : pNum}</span>
          <span class="thumb-chip-title">${shortTitle}${isLocked ? ' (₹99)' : ''}</span>
        </button>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="reader-shell theme-${this.options.theme} font-${this.options.fontFamily} spacing-${this.options.lineSpacing} margin-${this.options.marginWidth}" 
           id="reader-main-shell" 
           role="region" 
           aria-label="Kindle Magazine Reader" 
           style="--reader-font-size: ${this.options.fontSize}px;">

        <!-- Kindle Top Header Bar -->
        <header class="kindle-header-bar">
          <div class="kindle-header-left">
            <button type="button" class="kindle-icon-btn ${this.options.mode === 'kindle' ? 'active' : ''}" id="btn-mode-kindle" title="${t.kindleMode}">
              ${t.kindleMode}
            </button>
            <button type="button" class="kindle-icon-btn ${this.options.mode === 'spread' ? 'active' : ''}" id="btn-mode-spread" title="${t.spreadMode}">
              ${t.spreadMode}
            </button>
          </div>

          <div class="kindle-header-center">
            <span class="kindle-book-title">Chhattisgadhiya Cloud Masik Patrika</span>
            <span class="kindle-chapter-title">${current.title ? current.title.split(':')[0] : ''}</span>
          </div>

          <div class="kindle-header-right">
            <!-- Iconic Kindle "Aa" Menu Toggle -->
            <button type="button" class="kindle-icon-btn kindle-aa-btn ${this.isAaMenuOpen ? 'active' : ''}" id="btn-kindle-aa" title="${t.aaTitle}" aria-label="${t.aaTitle}">
              <span class="kindle-aa-mark">Aa</span>
            </button>
            <button type="button" class="kindle-icon-btn" id="btn-toggle-fullscreen" title="${t.fullscreen}" aria-label="${t.fullscreen}">⛶</button>
            <a href="../../src/assets/images/mag-issue-14-cover.svg" target="_blank" class="kindle-icon-btn" title="${t.download}">
              <span>📥</span> <span style="font-size:0.75rem;">PDF</span>
            </a>
          </div>
        </header>

        <!-- The Iconic Kindle "Aa" Popover Dialog -->
        <div class="kindle-aa-popover ${this.isAaMenuOpen ? '' : 'hidden'}" id="kindle-aa-panel" role="dialog" aria-label="Reading Appearance Settings">
          <!-- 1. Theme (Paperwhite, White, Sepia, Dark) -->
          <div class="kindle-aa-section">
            <div class="kindle-aa-label">${isHi ? 'कागज़ रंग (Paper Theme)' : 'Paper Theme'}</div>
            <div class="kindle-theme-chips">
              <button type="button" class="kindle-theme-chip theme-chip-paperwhite ${this.options.theme === 'paperwhite' ? 'active' : ''}" data-set-theme="paperwhite" title="Kindle Paperwhite Warm">
                <span class="theme-sample"></span>
                <span>Warm</span>
              </button>
              <button type="button" class="kindle-theme-chip theme-chip-white ${this.options.theme === 'white' ? 'active' : ''}" data-set-theme="white" title="Clean White">
                <span class="theme-sample"></span>
                <span>White</span>
              </button>
              <button type="button" class="kindle-theme-chip theme-chip-sepia ${this.options.theme === 'sepia' ? 'active' : ''}" data-set-theme="sepia" title="Classic Sepia">
                <span class="theme-sample"></span>
                <span>Sepia</span>
              </button>
              <button type="button" class="kindle-theme-chip theme-chip-dark ${this.options.theme === 'dark' ? 'active' : ''}" data-set-theme="dark" title="Night Mode">
                <span class="theme-sample"></span>
                <span>Dark</span>
              </button>
            </div>
          </div>

          <!-- 2. Font Family (Bookerly/Serif vs Ember/Sans) -->
          <div class="kindle-aa-section">
            <div class="kindle-aa-label">${isHi ? 'फ़ॉन्ट शैली (Font Family)' : 'Font Family'}</div>
            <div class="kindle-toggle-group">
              <button type="button" class="kindle-pill-btn ${this.options.fontFamily === 'serif' ? 'active' : ''}" data-set-font="serif" style="font-family:serif;">
                Bookerly (Serif)
              </button>
              <button type="button" class="kindle-pill-btn ${this.options.fontFamily === 'sans' ? 'active' : ''}" data-set-font="sans" style="font-family:sans-serif;">
                Ember (Sans)
              </button>
            </div>
          </div>

          <!-- 3. Font Size Stepper -->
          <div class="kindle-aa-section">
            <div class="kindle-aa-label">${isHi ? 'फ़ॉन्ट आकार (Font Size)' : 'Font Size'}</div>
            <div class="kindle-size-slider-row">
              <span style="font-size:0.75rem; font-weight:800; color:#9AA0A6;">A</span>
              <button type="button" class="kindle-step-btn" id="btn-kindle-font-dec" title="Decrease font size">−</button>
              <span class="kindle-size-val" id="font-indicator">${this.options.fontSize}px</span>
              <button type="button" class="kindle-step-btn" id="btn-kindle-font-inc" title="Increase font size">+</button>
              <span style="font-size:1.15rem; font-weight:800; color:#FFFFFF;">A</span>
            </div>
          </div>

          <!-- 4. Line Spacing -->
          <div class="kindle-aa-section">
            <div class="kindle-aa-label">${isHi ? 'पंक्ति अंतर (Line Spacing)' : 'Line Spacing'}</div>
            <div class="kindle-toggle-group">
              <button type="button" class="kindle-pill-btn ${this.options.lineSpacing === 'compact' ? 'active' : ''}" data-set-spacing="compact">
                ${isHi ? 'संक्षिप्त' : 'Compact'}
              </button>
              <button type="button" class="kindle-pill-btn ${this.options.lineSpacing === 'normal' ? 'active' : ''}" data-set-spacing="normal">
                ${isHi ? 'सामान्य' : 'Normal'}
              </button>
              <button type="button" class="kindle-pill-btn ${this.options.lineSpacing === 'relaxed' ? 'active' : ''}" data-set-spacing="relaxed">
                ${isHi ? 'विस्तृत' : 'Relaxed'}
              </button>
            </div>
          </div>

          <!-- 5. Reading Column Margins -->
          <div class="kindle-aa-section">
            <div class="kindle-aa-label">${isHi ? 'पृष्ठ चौड़ाई (Margins)' : 'Page Width / Margins'}</div>
            <div class="kindle-toggle-group">
              <button type="button" class="kindle-pill-btn ${this.options.marginWidth === 'narrow' ? 'active' : ''}" data-set-margin="narrow">
                ${isHi ? 'संकीर्ण' : 'Narrow'}
              </button>
              <button type="button" class="kindle-pill-btn ${this.options.marginWidth === 'normal' ? 'active' : ''}" data-set-margin="normal">
                ${isHi ? 'मानक' : 'Standard'}
              </button>
              <button type="button" class="kindle-pill-btn ${this.options.marginWidth === 'wide' ? 'active' : ''}" data-set-margin="wide">
                ${isHi ? 'चौड़ा' : 'Wide'}
              </button>
            </div>
          </div>
        </div>

        <!-- Main Reading Stage -->
        <main class="reader-stage" id="reader-stage">
          ${this.options.mode === 'spread' ? this.renderFlipBookHtml() : this.renderKindleHtml()}
        </main>

        <!-- Kindle Reading Progress Bar & Status -->
        <div class="kindle-reading-bar">
          <div class="kindle-reading-progress">
            <div class="kindle-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="kindle-status-row">
            <span class="kindle-loc">
              📖 ${isHi ? `पृष्ठ ${this.currentPage} का ${this.totalPages}` : `Page ${this.currentPage} of ${this.totalPages}`}
            </span>
            <span class="kindle-time-left">
              ⏱️ ${isHi ? `अंक में लगभग ${minsRemaining} मिनट शेष` : `~${minsRemaining} mins left in issue`}
            </span>
            <span class="kindle-pct">${progressPercent}%</span>
          </div>
        </div>

        <!-- Quick Page Thumbnail Jump Strip -->
        <div class="reader-thumbnails-bar" aria-label="Page Selection Strip">
          <span class="reader-thumb-label">📑 ${isHi ? 'अंक पृष्ठ सूची:' : 'Pages in Issue:'}</span>
          <div class="reader-thumb-list">
            ${thumbnailsHtml}
          </div>
        </div>

        <!-- Reader Navigation Footer Bar -->
        <div class="reader-pagination-bar">
          <button type="button" class="kindle-icon-btn" id="btn-page-prev" ${this.currentPage <= 1 ? 'disabled' : ''}>
            ${t.prev}
          </button>
          
          <div class="reader-page-indicator" aria-live="polite">
            <strong>${this.currentPage} / ${this.totalPages}</strong>
          </div>

          <button type="button" class="kindle-icon-btn" id="btn-page-next" ${this.currentPage >= this.totalPages ? 'disabled' : ''}>
            ${t.next}
          </button>
        </div>
      </div>
    `;

    this.bindDynamicElements();
  }

  renderKindleHtml() {
    const isHi = this.options.lang === "hi";
    const pages = this.options.pages;
    const pageIndex = this.currentPage - 1;
    const current = pages[pageIndex] || { title: "", author: "", excerpt: "", content: "" };

    // Format content with elegant dropcap on first character
    let formattedContent = this.formatContent(current.content, true);

    return `
      <div class="kindle-viewport" id="kindle-reading-viewport">
        <!-- Invisible Kindle Edge Tap Zones -->
        <div class="kindle-tap-zone kindle-tap-left" id="kindle-tap-prev" title="${isHi ? 'पिछला पृष्ठ (टैप करें)' : 'Previous Page (Tap Left)'}">
          <span class="kindle-turn-hint">‹</span>
        </div>
        <div class="kindle-tap-zone kindle-tap-right" id="kindle-tap-next" title="${isHi ? 'अगला पृष्ठ (टैप करें)' : 'Next Page (Tap Right)'}">
          <span class="kindle-turn-hint">›</span>
        </div>

        <article class="kindle-page-article">
          <div class="kindle-article-meta">
            <span class="book-section-pill">✦ ${current.category || (isHi ? 'मासिक शोध स्तंभ' : 'Curated Research Monograph')} ✦</span>
            <span style="font-size:0.8rem; color:var(--book-text-secondary); font-weight:600;">Issue 14 • Vol. IV</span>
          </div>

          <h1 class="kindle-article-title">${current.title || ""}</h1>

          <div class="kindle-author-row">
            ${current.author ? `
              <span>✍️ <strong>${isHi ? 'लेखक' : 'By'}:</strong> ${current.author}</span>
            ` : ''}
            ${current.date ? `
              <span>📅 ${current.date}</span>
            ` : ''}
            <span class="kindle-reading-time">⏱️ 3 min read</span>
          </div>

          ${current.excerpt ? `
            <div class="book-abstract-box" style="margin-bottom:2rem;">
              <div class="abstract-label">📌 ${isHi ? 'संपादकीय सारांश' : 'Curator\'s Synopsis'}:</div>
              <p class="abstract-text">${current.excerpt}</p>
            </div>
          ` : ''}

          <div class="kindle-body-content">
            ${formattedContent}
          </div>
        </article>
      </div>
    `;
  }

  renderFlipBookHtml() {
    const isHi = this.options.lang === "hi";
    const pages = this.options.pages;
    const pageIndex = this.currentPage - 1;
    const current = pages[pageIndex] || { title: "", author: "", excerpt: "", content: "" };

    let featuredQuote = "";
    let cleanContent = current.content || "";
    const quoteMatch = cleanContent.match(/^\>\s*["“']?(.*?)["”']?\s*$/m);
    if (quoteMatch) {
      featuredQuote = quoteMatch[1];
      cleanContent = cleanContent.replace(/^\>\s*.*$\n?/m, '').trim();
    }

    return `
      <div class="flipbook-wrapper" id="flipbook-viewport">
        <!-- 3D Open Book Spread Container -->
        <div class="flip-book-spread">
          <!-- Page Flip Turn Triggers (Left & Right) -->
          <button type="button" class="book-turn-arrow book-turn-prev" id="book-click-prev" title="Turn to Previous Page" aria-label="Previous Page" ${this.currentPage <= 1 ? 'disabled' : ''}>
            ‹
          </button>
          <button type="button" class="book-turn-arrow book-turn-next" id="book-click-next" title="Turn to Next Page" aria-label="Next Page" ${this.currentPage >= this.totalPages ? 'disabled' : ''}>
            ›
          </button>

          <!-- Left Page (Verso) -->
          <div class="book-page book-page-left">
            <div class="book-page-header">
              <span class="book-journal-title">Chhattisgadhiya Cloud Masik Patrika</span>
              <span class="book-issue-stamp">Vol. IV • Issue 09</span>
            </div>

            <div class="book-page-body book-page-verso-body">
              <span class="book-section-pill">✦ ${current.category || (isHi ? 'विशेष संपादकीय' : 'Monograph Folio')} ✦</span>
              <h2 class="book-article-title">${current.title || (isHi ? 'अंक शीर्षक' : 'Featured Monograph')}</h2>
              
              ${current.author ? `
                <div class="book-author-line">
                  <span>✍️</span> <strong>${isHi ? 'लेखक' : 'By'}:</strong> <span>${current.author}</span>
                  ${current.date ? `<span class="book-author-date">• ${current.date}</span>` : ''}
                </div>
              ` : ''}

              ${current.excerpt ? `
                <div class="book-abstract-box">
                  <div class="abstract-label">📌 ${isHi ? 'संक्षिप्त सारांश (Abstract)' : 'Curator\'s Abstract'}:</div>
                  <p class="abstract-text">${current.excerpt}</p>
                </div>
              ` : ''}

              ${featuredQuote ? `
                <div class="book-verso-callout">
                  <div class="callout-symbol">“</div>
                  <p class="callout-quote">${featuredQuote}</p>
                  <span class="callout-source">— Chhattisgadhiya Cloud Critical Journal</span>
                </div>
              ` : `
                <div class="book-verso-editorial-note">
                  <div class="editorial-note-eyebrow">✦ ${isHi ? 'अभिलेखागार टिप्पणी' : 'Editorial Inscription'} ✦</div>
                  <p>${isHi ? 'माटी, लोक-जीवन और जन-संस्कृति का समकालीन दस्तावेजीकरण।' : 'Contemporary documentation of grassroots folk wisdom and living theatre traditions.'}</p>
                </div>
              `}

              <div class="book-verso-watermark">
                <div class="watermark-emblem">CC</div>
                <div class="watermark-caption">Tribal Folk & Theatre Research Guild • Jashpur</div>
              </div>
            </div>

            <div class="book-page-footer">
              <span class="book-page-num">${(this.currentPage * 2) - 1}</span>
              <span class="book-footer-motto">Think Art Think Chhattisgadhiya Cloud</span>
            </div>
          </div>

          <!-- Realistic Book Center Spine Crease -->
          <div class="book-spine-crease" aria-hidden="true"></div>

          <!-- Right Page (Recto) -->
          <div class="book-page book-page-right">
            <div class="book-page-header">
              <span class="book-folio-running">${isHi ? 'सितंबर 2026 विशेषांक' : 'September 2026 Edition'}</span>
              <span class="book-issn-badge">ISSN 2709-4112</span>
            </div>

            <div class="book-page-body book-reading-column">
              ${this.formatContent(cleanContent, false)}
            </div>

            <div class="book-page-footer">
              <span class="book-footer-motto">Open Cultural Archive</span>
              <span class="book-page-num">${this.currentPage * 2}</span>
            </div>
          </div>
        </div>

        <div class="flipbook-hint">
          <span>💡 ${isHi ? 'पृष्ठ पलटने हेतु कीबोर्ड एरो (← / →), किनारों के बाण या नीचे की अंक-पट्टी पर क्लिक करें' : 'Tip: Use keyboard arrows (← / →), side arrows, or the thumbnail strip below to flip pages'}</span>
        </div>
      </div>
    `;
  }

  formatContent(text, addDropcap = false) {
    if (!text) return "<p class=\"reader-p\">No content available for this page.</p>";
    
    // Parse markdown into clean editorial markup
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="reader-subheading"><span style="color:var(--c-primary); margin-right:6px;">✦</span>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="reader-subheading">$1</h2>')
      .replace(/^# (.*$)/gim, '<h2 class="reader-subheading">$1</h2>')
      .replace(/^\> (.*$)/gim, '<blockquote class="reader-pullquote"><p>“$1”</p></blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<div style="margin-bottom:0.5em; padding-left:1.35em; text-indent:-1.35em;">• $1</div>')
      .replace(/^\s*[\-\*]\s+(.*$)/gim, '<div style="margin-bottom:0.5em; padding-left:1.35em; text-indent:-1.35em;">✦ $1</div>')
      .replace(/\n\n/g, '</p><p class="reader-p">')
      .replace(/\n/g, '<br/>');

    // Add Kindle Drop-Cap to opening paragraph if requested
    if (addDropcap) {
      // Find first character of first paragraph that isn't a heading
      const cleanMatch = html.match(/^([^<][\s\S]*?)([\s\S]*)$/);
      if (cleanMatch) {
        const firstChar = cleanMatch[1].charAt(0);
        const rest = cleanMatch[1].slice(1) + cleanMatch[2];
        html = `<span class="kindle-dropcap">${firstChar}</span>${rest}`;
      }
    }

    return `<p class="reader-p">${html}</p>`;
  }

  bindGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight') {
        this.nextPage();
      } else if (e.key === 'ArrowLeft') {
        this.prevPage();
      }
    });

    // Close Aa popover when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('kindle-aa-panel');
      const aaBtn = document.getElementById('btn-kindle-aa');
      if (this.isAaMenuOpen && panel && !panel.contains(e.target) && !aaBtn?.contains(e.target)) {
        this.isAaMenuOpen = false;
        panel.classList.add('hidden');
        if (aaBtn) aaBtn.classList.remove('active');
      }
    });
  }

  bindDynamicElements() {
    const btnKindle = document.getElementById('btn-mode-kindle');
    const btnSpread = document.getElementById('btn-mode-spread');
    const btnAa = document.getElementById('btn-kindle-aa');
    const panelAa = document.getElementById('kindle-aa-panel');
    const btnFontInc = document.getElementById('btn-kindle-font-inc');
    const btnFontDec = document.getElementById('btn-kindle-font-dec');
    const btnPrev = document.getElementById('btn-page-prev');
    const btnNext = document.getElementById('btn-page-next');
    const tapPrev = document.getElementById('kindle-tap-prev');
    const tapNext = document.getElementById('kindle-tap-next');
    const bookClickPrev = document.getElementById('book-click-prev');
    const bookClickNext = document.getElementById('book-click-next');
    const btnFullscreen = document.getElementById('btn-toggle-fullscreen');

    // Thumbnail navigation buttons
    const thumbChips = this.container.querySelectorAll('[data-jump-page]');
    thumbChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const page = parseInt(chip.getAttribute('data-jump-page'), 10);
        if (!isNaN(page)) this.goToPage(page);
      });
    });

    if (btnKindle) {
      btnKindle.addEventListener('click', () => {
        this.options.mode = 'kindle';
        try { localStorage.setItem('cgcloud_kindle_mode', 'kindle'); } catch (_) {}
        this.render();
      });
    }

    if (btnSpread) {
      btnSpread.addEventListener('click', () => {
        this.options.mode = 'spread';
        try { localStorage.setItem('cgcloud_kindle_mode', 'spread'); } catch (_) {}
        this.render();
      });
    }

    // Toggle Kindle "Aa" Popover
    if (btnAa && panelAa) {
      btnAa.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isAaMenuOpen = !this.isAaMenuOpen;
        panelAa.classList.toggle('hidden', !this.isAaMenuOpen);
        btnAa.classList.toggle('active', this.isAaMenuOpen);
      });
    }

    // Theme selector chips in Aa menu
    this.container.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-set-theme');
        if (theme) this.setTheme(theme);
      });
    });

    // Font family buttons in Aa menu
    this.container.querySelectorAll('[data-set-font]').forEach(btn => {
      btn.addEventListener('click', () => {
        const font = btn.getAttribute('data-set-font');
        if (font) this.setFontFamily(font);
      });
    });

    // Line spacing buttons in Aa menu
    this.container.querySelectorAll('[data-set-spacing]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spacing = btn.getAttribute('data-set-spacing');
        if (spacing) this.setLineSpacing(spacing);
      });
    });

    // Margin width buttons in Aa menu
    this.container.querySelectorAll('[data-set-margin]').forEach(btn => {
      btn.addEventListener('click', () => {
        const margin = btn.getAttribute('data-set-margin');
        if (margin) this.setMarginWidth(margin);
      });
    });

    // Font size controls
    if (btnFontInc) {
      btnFontInc.addEventListener('click', () => {
        this.setFontSize(this.options.fontSize + 2);
      });
    }

    if (btnFontDec) {
      btnFontDec.addEventListener('click', () => {
        this.setFontSize(this.options.fontSize - 2);
      });
    }

    // Page turns
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevPage());
    if (btnNext) btnNext.addEventListener('click', () => this.nextPage());
    if (tapPrev) tapPrev.addEventListener('click', () => this.prevPage());
    if (tapNext) tapNext.addEventListener('click', () => this.nextPage());
    if (bookClickPrev) bookClickPrev.addEventListener('click', () => this.prevPage());
    if (bookClickNext) bookClickNext.addEventListener('click', () => this.nextPage());

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }

    // Touch Swipe Gestures for Mobile devices
    const stage = document.getElementById('reader-stage');
    if (stage) {
      let touchStartX = 0;
      let touchStartY = 0;

      stage.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;

          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= 45) {
            if (diffX < 0) {
              this.nextPage();
            } else {
              this.prevPage();
            }
          }
        }
      }, { passive: true });
    }
  }

  toggleFullscreen() {
    const shell = document.getElementById('reader-main-shell');
    if (!shell) return;
    if (!document.fullscreenElement) {
      shell.requestFullscreen?.().catch(() => {});
      shell.classList.add('is-fullscreen');
      this.isFullscreen = true;
    } else {
      document.exitFullscreen?.().catch(() => {});
      shell.classList.remove('is-fullscreen');
      this.isFullscreen = false;
    }
  }

  nextPage() {
    if (this.currentPage >= this.options.freePageLimit) {
      this.triggerPaywall(this.currentPage + 1);
      return;
    }
    if (this.currentPage < this.totalPages) {
      if (this.options.mode === 'spread') {
        this.triggerFlipEffect(() => {
          this.currentPage++;
          this.render();
        });
      } else {
        this.currentPage++;
        this.render();
      }
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      if (this.options.mode === 'spread') {
        this.triggerFlipEffect(() => {
          this.currentPage--;
          this.render();
        });
      } else {
        this.currentPage--;
        this.render();
      }
    }
  }

  triggerPaywall(attemptedPage = 6) {
    if (typeof this.options.onPaywallTrigger === 'function') {
      this.options.onPaywallTrigger(attemptedPage);
    }
    window.dispatchEvent(new CustomEvent('magazine:paywall', { detail: { page: attemptedPage } }));

    const modal = document.getElementById('subscribe-modal');
    if (modal) {
      const titleEl = document.getElementById('sub-modal-title');
      if (titleEl) {
        titleEl.innerHTML = this.options.lang === 'hi'
          ? '🔐 पूर्ण अंक पढ़ने हेतु ₹99 में सदस्यता लें'
          : '🔐 Subscribe ₹99 to read full issue';
      }
      const descEl = document.getElementById('sub-modal-desc') || modal.querySelector('.modal-header p');
      if (descEl) {
        descEl.innerHTML = this.options.lang === 'hi'
          ? `आप पृष्ठ ${attemptedPage} पढ़ने का प्रयास कर रहे हैं। प्रथम 5 पृष्ठ निःशुल्क हैं। शेष समस्त पृष्ठ एवं विशेषांक तुरंत अनलॉक करने हेतु मात्र <strong>₹99</strong> में सदस्यता लें।`
          : `You have reached the free preview limit (Pages 1–5). Subscribe for only <strong>₹99</strong> to immediately unlock Page ${attemptedPage} and the complete magazine archive.`;
      }
      modal.classList.add('active');
      const nameInput = document.getElementById('sub-name');
      if (nameInput) setTimeout(() => nameInput.focus(), 120);
    }
  }

  triggerFlipEffect(callback) {
    this.isFlipping = true;
    const stage = document.getElementById('reader-stage');
    if (stage) stage.classList.add('page-turning');
    setTimeout(() => {
      this.isFlipping = false;
      callback();
    }, 240);
  }
}

if (typeof window !== "undefined") { window.HybridMagazineReader = HybridMagazineReader; }
