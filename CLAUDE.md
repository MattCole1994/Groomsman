# CLAUDE.md

Single-page groomsmen proposal site, hosted on GitHub Pages.

## Rules
- No bundlers, no npm build. Pure HTML (`index.html`), modern CSS (`style.css`), vanilla JS (`app.js`).
- Mobile-first, responsive. Test at 375px wide.
- All asset paths are relative (`./assets/...`, `./style.css`, `./app.js`) so the site works under a repo subpath.
- External libraries load from pinned CDN URLs only (canvas-confetti, Google Fonts).
- The passcode is never stored in plain text. `TARGET_HASH` in `app.js` is SHA-256 of the lowercased, trimmed passcode.
- Auth state lives in `sessionStorage` (key `inner-circle-unlocked`).
- Motion: the hero bridge draws itself on unlock; the envelope opens on tap. Respect `prefers-reduced-motion`.

## Editable content
Search `index.html` for `EDIT:` comments and `[bracketed]` placeholders.
