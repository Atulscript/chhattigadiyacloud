// Hybrid Magazine Reader: Flip-Book + Accessible Paginated View + Multi-Theme + Fluid Typography
// Self-contained, lightweight, zero third-party cloud trackers.

export class HybridMagazineReader {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    const isMobile = window.innerWidth <= 860;
    
    // Saved preferences from localStorage if available
    let savedTheme = 'sepia';
    let savedFontSize = isMobile ? 16 : 18;
    try {
      const storedTheme = localStorage.getItem('cgcloud_reader_theme');
      if (storedTheme && ['sepia', 'white', 'dark'].includes(storedTheme)) {
        savedTheme = storedTheme;
      }
      const storedSize = parseInt(localStorage.getItem('cgcloud_reader_fontsize'), 10);
      if (!isNaN(storedSize) && storedSize >= 14 && storedSize <= 26) {
        savedFontSize = storedSize;
      }
    } catch (_) {}

    this.options = {
      lang: options.lang || "en",
      mode: options.mode || (isMobile ? "paginated" : "flip"), // "flip" or "paginated"
      theme: options.theme || savedTheme, // "sepia", "white", "dark"
      fontSize: options.fontSize || savedFontSize,
      pages: options.pages || [],
      freePageLimit: options.freePageLimit !== undefined ? options.freePageLimit : 5,
      onPaywallTrigger: options.onPaywallTrigger || null,
      ...options
    };

    this.currentPage = 1;
    this.totalPages = this.options.pages.length || 1;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isFullscreen = false;

    if (this.isReducedMotion && this.options.mode === "flip") {
      this.options.mode = "paginated";
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
    if (!['sepia', 'white', 'dark'].includes(theme)) return;
    this.options.theme = theme;
    try {
      localStorage.setItem('cgcloud_reader_theme', theme);
    } catch (_) {}

    const shell = document.getElementById('reader-main-shell');
    if (shell) {
      shell.classList.remove('theme-sepia', 'theme-white', 'theme-dark');
      shell.classList.add(`theme-${theme}`);
    }

    const themeBtnText = document.getElementById('theme-btn-text');
    const themeBtnIcon = document.getElementById('theme-btn-icon');
    const themeMeta = this.getThemeMeta(theme);
    if (themeBtnText) themeBtnText.textContent = themeMeta.label;
    if (themeBtnIcon) themeBtnIcon.textContent = themeMeta.icon;
  }

  cycleTheme() {
    const cycle = { sepia: 'white', white: 'dark', dark: 'sepia' };
    const next = cycle[this.options.theme] || 'sepia';
    this.setTheme(next);
  }

  getThemeMeta(theme) {
    const isHi = this.options.lang === "hi";
    switch (theme) {
      case 'white':
        return { icon: '☀️', label: isHi ? 'श्वेत मोड' : 'Clean White' };
      case 'dark':
        return { icon: '🌙', label: isHi ? 'रात्रि मोड' : 'Night Mode' };
      case 'sepia':
      default:
        return { icon: '📜', label: isHi ? 'वार्म कागज़' : 'Warm Paper' };
    }
  }

  setFontSize(size) {
    const bounded = Math.max(14, Math.min(26, size));
    this.options.fontSize = bounded;
    try {
      localStorage.setItem('cgcloud_reader_fontsize', bounded.toString());
    } catch (_) {}

    const shell = document.getElementById('reader-main-shell');
    if (shell) {
      shell.style.setProperty('--reader-font-size', `${bounded}px`);
    }

    const indicator = document.getElementById('font-indicator');
    if (indicator) {
      indicator.textContent = `${bounded}px`;
    }
  }

  goToPage(pageNum) {
    // Intercept navigation if page exceeds freePageLimit
    if (pageNum > this.options.freePageLimit) {
      this.triggerPaywall(pageNum);
      return;
    }
    const target = Math.max(1, Math.min(this.totalPages, pageNum));
    if (target === this.currentPage) return;
    if (this.options.mode === 'flip') {
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
    const currentThemeMeta = this.getThemeMeta(this.options.theme);

    const t = {
      flipMode: isHi ? "📖 2-पृष्ठ पुस्तक दृश्य" : "📖 2-Page Spread",
      paginatedMode: isHi ? "📄 एकल आलेख दृश्य" : "📄 Single Page",
      converter: isHi ? "⚙️ PDF टूल" : "⚙️ PDF Tools",
      prev: isHi ? "‹ पिछला पृष्ठ" : "‹ Previous Page",
      next: isHi ? "अगला पृष्ठ ›" : "Next Page ›",
      page: isHi ? "पृष्ठ" : "Page",
      of: isHi ? "का" : "of",
      fontSmaller: "A−",
      fontLarger: "A+",
      download: isHi ? "PDF अंक" : "Download PDF",
      sampleDemo: isHi ? "⚡ नमूना PDF आलेख आज़माएं" : "⚡ Try Sample Issue PDF",
      fullscreen: isHi ? "⛶ पूर्ण स्क्रीन" : "⛶ Fullscreen",
      copyMd: isHi ? "📋 मार्कअप कॉपी करें" : "📋 Copy Markdown",
      copied: isHi ? "कॉपी हो गया! ✓" : "Copied! ✓"
    };

    // Build thumbnail navigation strip (with lock indicator for pages exceeding free limit)
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
      <div class="reader-shell theme-${this.options.theme}" id="reader-main-shell" role="region" aria-label="Magazine Reader" style="--reader-font-size: ${this.options.fontSize}px;">
        <!-- Floating Reader Toolbar -->
        <div class="reader-toolbar">
          <div class="reader-toolbar-left">
            <button class="reader-btn ${this.options.mode === 'flip' ? 'active' : ''}" id="btn-mode-flip" title="${t.flipMode}">
              ${t.flipMode}
            </button>
            <button class="reader-btn ${this.options.mode === 'paginated' ? 'active' : ''}" id="btn-mode-paginated" title="${t.paginatedMode}">
              ${t.paginatedMode}
            </button>
            <button class="reader-btn" id="btn-toggle-theme" title="Cycle Reading Theme">
              <span id="theme-btn-icon">${currentThemeMeta.icon}</span> 
              <span id="theme-btn-text">${currentThemeMeta.label}</span>
            </button>
          </div>

          <div class="reader-toolbar-right">
            <div class="reader-font-controls" title="Adjust text size">
              <button class="reader-btn-icon" id="btn-font-dec" title="Decrease font size" aria-label="Decrease font size">${t.fontSmaller}</button>
              <span class="reader-font-indicator" id="font-indicator">${this.options.fontSize}px</span>
              <button class="reader-btn-icon" id="btn-font-inc" title="Increase font size" aria-label="Increase font size">${t.fontLarger}</button>
            </div>
            <button class="reader-btn-icon" id="btn-toggle-fullscreen" title="${t.fullscreen}" aria-label="${t.fullscreen}">⛶</button>
            <a href="../../src/assets/images/mag-issue-14-cover.svg" target="_blank" class="reader-btn reader-btn-primary" id="btn-download-pdf">
              <span>📥</span> <span>${t.download}</span>
            </a>
          </div>
        </div>

        <!-- Conversion Panel (collapsible local tool) -->
        <div id="converter-panel" class="converter-panel hidden">
          <div class="converter-box">
            <div class="converter-header">
              <div>
                <h4 style="font-family:var(--font-serif); font-size:1.35rem; color:var(--g-text-primary); margin-bottom:0.25rem;">
                  ⚙️ ${isHi ? "स्थानीय PDF से मार्कडाउन रूपांतरण इंजन" : "Local PDF to Markdown Parsing Engine"}
                </h4>
                <p style="font-size:0.92rem; color:var(--g-text-secondary); margin:0;">
                  ${isHi 
                    ? "यह उपकरण बिना किसी बाहरी सर्वर के आपके ब्राउज़र में ही PDF का विश्लेषण कर स्वच्छ Markdown और HTML तैयार करता है।"
                    : "Extract structured headings, pull-quotes, and paragraphs locally without uploading files to external clouds."}
                </p>
              </div>
              <button type="button" class="btn-secondary" id="btn-sample-pdf" style="font-size:0.85rem; padding:0.5rem 1rem;">
                ${t.sampleDemo}
              </button>
            </div>

            <div class="converter-dropzone" id="pdf-dropzone">
              <input type="file" id="pdf-file-input" accept="application/pdf" style="display:none;" />
              <div id="dropzone-text">
                <span style="font-size:2rem; display:block; margin-bottom:0.5rem;">📂</span>
                <strong>${isHi ? "यहाँ PDF फाइल छोड़ें या ब्राउज़ करें" : "Drag & Drop Issue PDF here or click to browse"}</strong>
                <div style="font-size:0.82rem; color:var(--g-text-muted); margin-top:0.35rem;">Max 50MB • Client-side private parsing</div>
              </div>
            </div>

            <div id="converter-output-wrap" class="hidden" style="margin-top:1.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem; flex-wrap:wrap; gap:0.5rem;">
                <strong style="color:var(--g-text-primary); font-size:0.92rem;">
                  📝 ${isHi ? "तैयार मार्कअप (Markdown Output):" : "Generated Structured Markdown:"}
                </strong>
                <button type="button" class="reader-btn" id="btn-copy-markdown" style="font-size:0.85rem; padding:0.4rem 0.9rem;">
                  ${t.copyMd}
                </button>
              </div>
              <textarea id="converter-markdown-output" rows="9" class="converter-textarea" readonly></textarea>
            </div>
          </div>
        </div>

        <!-- Main Reading Stage -->
        <div class="reader-stage" id="reader-stage">
          ${this.options.mode === 'flip' ? this.renderFlipBookHtml() : this.renderPaginatedHtml()}
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
          <button class="reader-btn" id="btn-page-prev" ${this.currentPage <= 1 ? 'disabled' : ''}>
            ${t.prev}
          </button>
          
          <div class="reader-page-indicator" aria-live="polite">
            <span>📖</span> 
            <strong>${t.page} ${this.currentPage}</strong> 
            <span style="color:var(--g-text-muted);">${t.of} ${this.totalPages}</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="reader-btn" id="btn-mode-convert" style="font-size:0.78rem; padding:0.3rem 0.75rem;" title="${t.converter}">
              ${t.converter}
            </button>
            <button class="reader-btn" id="btn-page-next" ${this.currentPage >= this.totalPages ? 'disabled' : ''}>
              ${t.next}
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindDynamicElements();
  }

  renderFlipBookHtml() {
    const isHi = this.options.lang === "hi";
    const pages = this.options.pages;
    const pageIndex = this.currentPage - 1;
    const current = pages[pageIndex] || { title: "", author: "", excerpt: "", content: "" };

    // Extract quote to display cleanly on the Verso (Left) page
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
              <h3 class="book-article-title">${current.title || (isHi ? 'अंक शीर्षक' : 'Featured Monograph')}</h3>
              
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
              ${this.formatContent(cleanContent)}
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

  renderPaginatedHtml() {
    const isHi = this.options.lang === "hi";
    const pages = this.options.pages;
    const pageIndex = this.currentPage - 1;
    const current = pages[pageIndex] || { title: "", author: "", excerpt: "", content: "" };

    return `
      <div class="paginated-view-wrapper">
        <article class="magazine-clean-article">
          <header class="article-meta-header">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
              <span class="book-section-pill">✦ ${current.category || (isHi ? 'मासिक शोध लेख' : 'Monthly Research Paper')} ✦</span>
              <span style="font-size:0.85rem; color:var(--book-text-secondary); font-weight:600;">Issue 14 • Page ${this.currentPage} of ${this.totalPages}</span>
            </div>
            <h2 class="article-reader-title">${current.title || ""}</h2>
            ${current.author ? `
              <div class="article-author" style="margin-top:0.75rem; font-size:1.05rem; color:#1A73E8; font-weight:600; display:flex; align-items:center; gap:0.5rem;">
                <span>✍️</span> <span>${isHi ? 'लेखक' : 'Author'}: ${current.author}</span>
                ${current.date ? `<span style="color:var(--book-text-secondary); font-weight:normal;">• ${current.date}</span>` : ''}
              </div>
            ` : ''}
          </header>

          ${current.excerpt ? `
            <div class="book-abstract-box" style="margin: 1.75rem 0;">
              <div class="abstract-label">📌 ${isHi ? 'आलेख का मूल बिंदु' : 'Core Synopsis'}:</div>
              <p class="abstract-text">${current.excerpt}</p>
            </div>
          ` : ''}

          <div class="article-body-content" style="margin-top:1.5rem;">
            ${this.formatContent(current.content)}
          </div>
        </article>
      </div>
    `;
  }

  formatContent(text) {
    if (!text) return "<p class=\"reader-p\">No content available for this page.</p>";
    
    // Parse markdown into clean editorial markup
    let html = text
      .replace(/^### (.*$)/gim, '<h4 class="reader-subheading"><span style="color:var(--c-primary); margin-right:6px;">✦</span>$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="reader-subheading">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="reader-subheading">$1</h2>')
      .replace(/^\> (.*$)/gim, '<blockquote class="reader-pullquote"><p>“$1”</p></blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<div style="margin-bottom:0.5em; padding-left:1.25em; text-indent:-1.25em;">• $1</div>')
      .replace(/^\s*[\-\*]\s+(.*$)/gim, '<div style="margin-bottom:0.5em; padding-left:1.25em; text-indent:-1.25em;">✦ $1</div>')
      .replace(/\n\n/g, '</p><p class="reader-p">')
      .replace(/\n/g, '<br/>');

    return `<p class="reader-p">${html}</p>`;
  }

  bindGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      // Only handle arrows if not in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight') {
        this.nextPage();
      } else if (e.key === 'ArrowLeft') {
        this.prevPage();
      }
    });
  }

  bindDynamicElements() {
    const btnFlip = document.getElementById('btn-mode-flip');
    const btnPaginated = document.getElementById('btn-mode-paginated');
    const btnTheme = document.getElementById('btn-toggle-theme');
    const btnConvert = document.getElementById('btn-mode-convert');
    const converterPanel = document.getElementById('converter-panel');
    const btnFontInc = document.getElementById('btn-font-inc');
    const btnFontDec = document.getElementById('btn-font-dec');
    const btnPrev = document.getElementById('btn-page-prev');
    const btnNext = document.getElementById('btn-page-next');
    const bookClickPrev = document.getElementById('book-click-prev');
    const bookClickNext = document.getElementById('book-click-next');
    const btnFullscreen = document.getElementById('btn-toggle-fullscreen');
    const btnSamplePdf = document.getElementById('btn-sample-pdf');
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const btnCopy = document.getElementById('btn-copy-markdown');

    // Thumbnail buttons
    const thumbChips = this.container.querySelectorAll('[data-jump-page]');
    thumbChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const page = parseInt(chip.getAttribute('data-jump-page'), 10);
        if (!isNaN(page)) this.goToPage(page);
      });
    });

    if (btnFlip) {
      btnFlip.addEventListener('click', () => {
        this.options.mode = 'flip';
        this.render();
      });
    }

    if (btnPaginated) {
      btnPaginated.addEventListener('click', () => {
        this.options.mode = 'paginated';
        this.render();
      });
    }

    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        this.cycleTheme();
      });
    }

    if (btnConvert && converterPanel) {
      btnConvert.addEventListener('click', () => {
        converterPanel.classList.toggle('hidden');
        if (!converterPanel.classList.contains('hidden')) {
          converterPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

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

    if (btnPrev) btnPrev.addEventListener('click', () => this.prevPage());
    if (btnNext) btnNext.addEventListener('click', () => this.nextPage());
    if (bookClickPrev) bookClickPrev.addEventListener('click', () => this.prevPage());
    if (bookClickNext) bookClickNext.addEventListener('click', () => this.nextPage());

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }

    if (btnSamplePdf) {
      btnSamplePdf.addEventListener('click', () => this.loadSamplePdfDemo());
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
          await this.handlePdfConversion(e.target.files[0]);
        }
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const textarea = document.getElementById('converter-markdown-output');
        if (textarea) {
          textarea.select();
          navigator.clipboard.writeText(textarea.value);
          btnCopy.innerText = this.options.lang === 'hi' ? "कॉपी हो गया! ✓" : "Copied! ✓";
          setTimeout(() => {
            btnCopy.innerText = this.options.lang === 'hi' ? "📋 मार्कअप कॉपी करें" : "📋 Copy Markdown";
          }, 2500);
        }
      });
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

          // Check if horizontal swipe exceeds 45px and is predominantly horizontal
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= 45) {
            if (diffX < 0) {
              // Swiped left -> next page
              this.nextPage();
            } else {
              // Swiped right -> prev page
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
    } else {
      document.exitFullscreen?.().catch(() => {});
      shell.classList.remove('is-fullscreen');
    }
  }

  loadSamplePdfDemo() {
    const isHi = this.options.lang === 'hi';
    const outputWrap = document.getElementById('converter-output-wrap');
    const outputText = document.getElementById('converter-markdown-output');
    const dropzoneText = document.getElementById('dropzone-text');

    if (dropzoneText) {
      dropzoneText.innerHTML = `✅ <strong>${isHi ? "नमूना अंक १४ सफलतापूर्वक विश्लेषित हुआ!" : "Sample Issue 14 (Sept 2026) Parsed Successfully!"}</strong>`;
    }

    if (outputWrap && outputText) {
      outputWrap.classList.remove('hidden');
      outputText.value = isHi 
        ? `# छत्तीसगढ़िया क्लाउड मासिक पत्रिका • अंक १४ (सितंबर २०२६)\n\n## नाचा का पुनरुत्थान — डॉ. प्रभात मिश्रा\n\nनाचा मात्र मनोरंजन नहीं है, बल्कि ग्रामीण समाज का खुला न्याय-कक्ष है। जब कलाकार अखाड़े में कदम रखते हैं तो सामाजिक दीवारें ढह जाती हैं...\n\n> "नाचा में उत्पन्न हास्य यथार्थ से पलायन नहीं है; यह यथार्थ का सबसे निर्भीक सामना है।"\n\n1. माटी की बोली: मुहावरों की सहज शक्ति\n2. संगीत की धड़कन: ढोलक और मंजीरा\n3. तात्कालिकता: समकालीन प्रश्नों पर तीखा व्यंग्य`
        : `# Chhattisgadhiya Cloud Masik Patrika • Vol. IV • Issue 09 (Sept 2026)\n\n## The Revival of Nacha in Urban Spaces — Dr. Prabhat Mishra\n\nNacha has never been merely entertainment; it is the living courtroom of the village commoner. When the actors step into the circle, social barriers soften...\n\n> "The laughter generated in Nacha is not an escape from reality; it is a profound confrontation with reality itself."\n\n1. The Language of the Earth: Colloquial idioms\n2. Music as Pulse: Dholak and manjeera shaping crescendos\n3. Improvisation: Sharp satire on contemporary dilemmas`;
      outputText.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  async handlePdfConversion(file) {
    const isHi = this.options.lang === 'hi';
    const dropzoneText = document.getElementById('dropzone-text');
    if (dropzoneText) {
      dropzoneText.innerHTML = `⏳ <strong>${isHi ? `स्थानीय रूप से "${file.name}" का विश्लेषण जारी...` : `Parsing "${file.name}" locally in browser...`}</strong>`;
    }

    try {
      const { LocalPdfExtractor } = await import('./pdf-parser.js');
      const extractor = new LocalPdfExtractor();
      const result = await extractor.extractTextFromPdf(file);

      const outputWrap = document.getElementById('converter-output-wrap');
      const outputText = document.getElementById('converter-markdown-output');

      if (outputWrap && outputText) {
        outputWrap.classList.remove('hidden');
        outputText.value = result.markdown;
        if (dropzoneText) {
          dropzoneText.innerHTML = `✅ <strong>"${file.name}" ${isHi ? "सफलतापूर्वक मार्कडाउन में परिवर्तित!" : "converted to Markdown!"}</strong> (${result.pages.length} pages)`;
        }
      }
    } catch (err) {
      if (dropzoneText) {
        dropzoneText.innerHTML = `❌ Error: ${err.message}`;
      }
    }
  }

  nextPage() {
    if (this.currentPage >= this.options.freePageLimit) {
      this.triggerPaywall(this.currentPage + 1);
      return;
    }
    if (this.currentPage < this.totalPages) {
      if (this.options.mode === 'flip') {
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
      if (this.options.mode === 'flip') {
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

    // Intercept with direct UI modal hook
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
