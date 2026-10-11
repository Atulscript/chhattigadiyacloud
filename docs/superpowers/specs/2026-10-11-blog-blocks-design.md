# Blog: block-based posts, real post pages, sharing

Date: 2026-10-11
Status: awaiting review

## Context

Blog posts today are entries in `blog.posts[]` in `src/data/site-content.json` with a
single plain-text `content` string per language. `src/pages/blog.js:36` splits that
string on blank lines, HTML-escapes each paragraph and renders it **inline on the blog
index**. Consequences:

- Headings, images and any formatting are impossible — escaping strips markup by design.
- Posts have **no URL of their own**: `en/blog/` contains only `index.html`. Nothing can
  be linked to or shared.

Goal: posts that read and behave like a real blog — subheadings, images anywhere in the
body, their own pages, and a share control — authored by non-technical editors.

## Decisions (locked with the user)

| Decision | Choice |
| --- | --- |
| Content model | Ordered **blocks** (Gutenberg-style), not Markdown or raw HTML |
| Images | **Uploaded from the admin to ImageKit**, signed by a small Cloudflare Worker |
| Bilingual | **Both languages required**; a post cannot publish until EN and HI are filled |
| Post pages | Each post gets `/{lang}/blog/{slug}/` |

## Data model

`blog.posts[]` gains `blocks` and keeps its existing fields (`id`, `slug`, `oldUrl`,
`date`, `author`, `category`, `title`, `excerpt`, `coverImage`).

```json
"blocks": [
  { "type": "heading",   "level": 2, "text": { "en": "", "hi": "" } },
  { "type": "paragraph", "text": { "en": "", "hi": "" } },
  { "type": "image",     "src": "https://ik.imagekit.io/txkrlazpm/...",
                         "alt": { "en": "", "hi": "" },
                         "caption": { "en": "", "hi": "" } },
  { "type": "quote",     "text": { "en": "", "hi": "" }, "cite": { "en": "", "hi": "" } },
  { "type": "list",      "ordered": false,
                         "items": [ { "en": "", "hi": "" } ] }
]
```

Rules:

- A post may contain **any number of heading blocks**. `heading.level` is the heading's
  *depth*, not a quota: `2`, `3` or `4`, rendered as `h2`/`h3`/`h4`.
- Depth starts at `h2` because the post title is the page's only `h1`; a second `h1`
  would break both the document outline for screen readers and the page's SEO structure.
  `h5`/`h6` are omitted as they have no practical use in an article of this kind — adding
  them later is a one-line change to the allowed set.
- The editor warns (but does not block) when a level is skipped, e.g. an `h4` with no
  `h3` above it, since skipped levels are an accessibility fault.
- Text fields are plain text and are **always escaped** at render. No HTML is accepted
  from the editor, which keeps the public repo free of an XSS vector.
- `content` (the old string) is retained on migrated posts and used as a fallback when
  `blocks` is absent, so a half-finished migration never blanks a post.

## Rendering: one module, two consumers

New `src/blog/blocks.js` exports `renderBlocks(blocks, lang, helpers)` returning HTML.
It is loaded by **both**:

- the Node build (`require`), and
- the admin's live preview (plain `<script>`; the file assigns to `module.exports` when
  present, else to `window.CCBlocks`).

This is non-negotiable for trust: a preview rendered by different code than the build is
a preview that lies. Reuses `esc`, `pick` and `photo` from `src/site/ui.js` — `photo()`
already emits ImageKit `srcset`, so image blocks get responsive sizes for free.

## Page generation

`generate-pages.js` gains a post loop after the existing `PAGES` loop, writing
`{lang}/blog/{slug}/index.html` through the existing `renderHtmlDocument`, so posts
inherit the header lockup, countdown, footer, share rail, theme and PWA automatically.

Each post page carries:

- cover image, title, author, date, category, estimated read time
- the rendered blocks
- previous/next links and a "Back to all posts" link
- `canonical`, `hreflang` en/hi/x-default, `og:image` from `coverImage`
- JSON-LD `BlogPosting` (headline, datePublished, author, image, inLanguage)

Sitemap: `pwa.sitemap()` already builds `${siteUrl}/${lang}/${slug}/` from a slug list,
so post URLs are added by passing `blog/{slug}` into `SLUGS`. No change to `pwa.js`.

## Blog index

`src/pages/blog.js` stops expanding post bodies inline. Each card becomes a link to the
post page, showing cover image, title, excerpt, author, date, category and read time.

## Sharing

A share row on each post page: WhatsApp, Facebook, X, and Copy link, plus
`navigator.share` on devices that support it. It reuses the brand icon paths already in
`src/site/layout.js` (`SOCIAL`, `WHATSAPP_PATH`) and targets the post's own canonical
URL — only possible now that posts have URLs.

## Admin editor

The blog section of `admin/admin.js` is replaced with a block editor:

- A vertical list of block cards. Each card shows its type, an EN field and an HI field,
  and controls: move up, move down, duplicate, delete.
- "Add block" offers Heading, Paragraph, Image, Quote, List. Headings carry a depth
  selector (H2/H3/H4), and any number of them may be added to a post.
- Image blocks show a thumbnail, an Upload button, and alt/caption fields in both
  languages.
- A live preview pane rendered by `src/blog/blocks.js`.
- Post meta (slug, date, author, category, cover) stays as today.

Slugs are generated from the English title, lowercased and hyphenated, and are
**immutable once published** — changing one would break every shared link. The editor
shows the slug read-only after first publish.

## Image pipeline

1. Editor picks a file.
2. The admin downscales it in-browser to max 1600px on the long edge via `<canvas>` and
   encodes WebP at ~0.82 quality. This caps upload size and page weight.
3. The admin requests `{ signature, token, expire }` from the Worker.
4. The admin POSTs the file directly to `https://upload.imagekit.io/api/v1/files/upload`
   with `publicKey` plus those parameters, into folder `/blog/{slug}/`.
5. The returned URL is stored in the block.

**Worker** (`workers/imagekit-auth/`, ~20 lines, Cloudflare free tier): holds
`IMAGEKIT_PRIVATE_KEY` as a secret and returns an HMAC-SHA1 signature over
`token + expire`. Verified against the live API: ImageKit rejects uploads carrying only a
public key — `"Your request is missing authorization parameters."` — so this endpoint is
required, not optional.

Hardening: an `Origin` allowlist (the Pages origin and `localhost:3000`), a shared secret
header, and a short `expire` (10 minutes). This limits abuse; it is **not** real
authorisation, because `/admin` has no real authentication yet (see below).

## Validation

Publish is blocked, with the offending block highlighted, when:

- any text field is empty in either language (the "fully bilingual" rule);
- an image block has no `src`, or no `alt` in both languages;
- the post has no title, excerpt or date.

`coverImage` is **optional**: neither existing post has one, so requiring it would make
both unpublishable the moment they are migrated. A post without a cover renders a
typographic header instead, and its index card falls back to the folk divider already
used elsewhere. `og:image` falls back to the site-wide image, matching `ogImage()` in
`generate-pages.js`.

## Migration

`scripts/migrate-blog-blocks.cjs`, run once: for each post lacking `blocks`, split
`content` per language on blank lines and emit paired `paragraph` blocks. Both existing posts hold their body as a **single** paragraph in each language, so
migration yields one paragraph block per language, which editors can then split in the
new editor. The paragraph-count check still matters for any post written before this
ships: if the two languages disagree, the script reports it and skips that post rather
than guessing the pairing.

## Security note (carried forward, not solved here)

`/admin` has no real authentication: the login compares a SHA-256 hash shipped to every
visitor, and publishing rights come from a GitHub PAT in `localStorage`. This work does
not change that, and the Worker inherits the same exposure. Worth scheduling separately;
the same Worker can later host a GitHub OAuth broker.

## Phasing

| Phase | Scope |
| --- | --- |
| 1 | Schema, `blocks.js`, post pages, index rework, share row, migration. Image blocks accept pasted URLs. |
| 2 | Admin block editor with bilingual validation and live preview. |
| 3 | Worker plus in-admin upload with client-side downscaling. |

Each phase leaves the site releasable.

## Testing

- Build check: every post produces both language pages; no post page is missing a block.
- A fixture post exercising all five block types renders identically in build output and
  admin preview.
- Accessibility: exactly one `h1`; no heading-level skips; every image has `alt`.
- Overflow: post pages show no horizontal scroll at 360/390/768/1280.
- Links: every index card resolves; prev/next and back links resolve.
- Migration is idempotent — running it twice changes nothing.

## Out of scope

Comments, tags/archives, RSS, drafts/scheduling, post search, and real admin
authentication.
