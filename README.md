# Chhattisgadhiya Cloud

> **“Think Art Think Chhattisgadhiya Cloud”**  
> Official Website and Hybrid Magazine Reader

All code is strictly local and self-contained within this repository. No code has been or will be pushed to remote GitHub repositories.

---

## What is Included

1. **Brand & Rebus Tagline**:
   - Header compact lockup: `Think [Logo] Think Chhattisgadhiya Cloud`
   - Hero entrance animation respecting `prefers-reduced-motion`.

2. **Bilingual Support (English & Hindi)**:
   - Full toggle in header (`🌐 हिन्दी` / `🌐 English`).
   - Maintains active section and reader context.
   - Devanagari typography support via `Noto Sans Devanagari`.

3. **Hybrid Magazine Reader**:
   - **Flip-Book View**: Interactive page-turn reading simulation with keyboard arrows (`Left`/`Right`) and page controls.
   - **Paginated Clean View**: Accessible, high-contrast, distraction-free reading mode with font resizer (`A+` / `A-`).
   - **PDF to Markup Converter**: In-browser local PDF extractor that transforms any PDF issue into structured Markdown & HTML markup without any external cloud APIs.

4. **All Sections from Website Brief**:
   - **What's On**: Chronological list with designed empty state for launch.
   - **Productions**: 4 initial plays (*Kahani Vasu Ki*, *Vincent: A Flashback*, *Gabar Ghichor*, *Raja Ravi Verma*) with cast, duration, director, and booking enquiry.
   - **Events & Festivals**: Year-tile archive for *Jashrang National Theatre Festival* and *Jashpur Kavita Utsav*.
   - **Training & Workshops**: *Ullas Summer Camp* year archive and mobile-friendly zero-backend registration modal.
   - **Migrated Blog**: Blogspot migration archive with 301 redirect notices.
   - **About Us & Core Team**: Cultural mission, history, and artist profiles.
   - **Contact & Enquiries**: Segmented enquiries (general, booking, media kit).
   - **Newsletter**: High-conversion email capture.

---

## How to Run Locally

You can open `index.html` directly in any web browser, or run the local server:

```bash
node server.js
```
Then visit:
`http://localhost:3000` (or double click `index.html`).
