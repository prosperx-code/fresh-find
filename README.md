# FreshFind — Fresh All Along

A single-page, frontend-only farmers-market finder (TechWiz 7 / Aptech, theme "eGreen Basket").

**Keep the folder structure exactly as it is when you unzip this.**
`index.html` loads its files from `css/style.css`, the `js/` folder and the
`data/` folder by path — if those get flattened into one folder, the site
won't load.

## Run it locally

The app loads `data/*.json` with `fetch()`, which most browsers block over a bare
`file://` URL. Serve the folder instead of double-clicking `index.html`:

```bash
cd FreshFind
python3 -m http.server 8080
# then open http://localhost:8080
```

(Any static server works — VS Code's "Live Server" extension, `npx serve`, etc.)

This app calls out to a few public services at runtime (OpenStreetMap tiles,
Leaflet's CDN build, Unsplash's image host, Wikipedia's thumbnail API,
Google Fonts). It needs a normal internet connection to show the live map and
photos — see "Live map" and "Real photos" below for exactly what's called and
why.

## Structure

```
FreshFind/
├── index.html           ← the only HTML page. Hash routes (#/home, #/directory, …)
│                           swap the #app container's content — see js/router.js
├── css/style.css         ← design system
├── js/
│   ├── data.js             ← data access — the one file to change for backend hand-off
│   ├── geolocation.js       ← wraps navigator.geolocation for "near me" sorting
│   ├── router.js            ← hash router
│   ├── icons.js             ← inline SVG icon set (replaces every emoji in the UI)
│   ├── photos.js            ← real photo sourcing (see "Real photos" below)
│   ├── chatbot.js           ← Basket Buddy matching (whole-word, not substring)
│   └── app.js               ← view rendering, filters/sort, bookmarks, map init, search, boot
├── data/
│   ├── markets.json
│   ├── produce.json
│   └── chatbot.json
├── PHOTOS.md             ← full photo-by-photo sourcing reasoning
```

## Routes

- `#/home`
- `#/directory` — filterable market list
- `#/market/:id` — one market's schedule, live map and produce
- `#/produce` — produce guide
- `#/produce/:id`
- `#/bookmarks` — saved markets/produce
- `#/about`, `#/contact`

## Nav search

The header search bar (and its mobile-menu twin) does a live, client-side match
against market names/areas and produce names as you type, with a dropdown of
up to five markets and five produce items. Enter (or tapping a result) jumps
straight to that market/produce page; with no exact match it falls back to the
directory. It's pure client-side filtering over the already-loaded
`markets.json`/`produce.json` — no new endpoint.

## Live map (Leaflet + OpenStreetMap)

Market detail and Contact use a genuinely interactive map — pan, zoom, real
markers — via Leaflet (loaded from cdnjs) and OpenStreetMap tiles. No API key,
no quota. `js/app.js`'s `initLeafletMap()` is the one function that creates a
map; it's called once per market detail page (single marker) and once on
Contact (all 12 markets, plus a "Show my location" button that drops a
"you are here" marker using the existing `FFGeo` wrapper).

If Leaflet's script fails to load (offline, a restrictive network, an ad
blocker), `initLeafletMap()` detects `typeof L === 'undefined'` and swaps the
container for a plain "Live map unavailable — check your connection." message
instead of leaving a blank box or throwing an error.

## Real photos (Unsplash, hardcoded, plus Wikipedia as a live fallback)

`js/photos.js` shows a real photo for each market/produce card, picking
whichever source is verifiably the *exact* real thing for that item — see
`PHOTOS.md` for the full reasoning and a table of every single choice.
Some common produce (cassava, sweet potato, tomato) use a specific,
hand-verified Unsplash photo hardcoded directly in `js/photos.js`; the rest
of the produce fetches a live thumbnail from Wikipedia's public,
CORS-enabled REST API (`/api/rest_v1/page/summary/<article>`), since a
species-specific Wikipedia article turned out to be more reliably accurate
than general stock-photo tagging for several West African staples (a plain
Unsplash search for "yam", for instance, mostly returns sweet potatoes).
The 12 markets are all fictional/sample markets built for this project, so
none of them has a real photo of its own — each instead shows a genuine,
hand-picked, free-to-use Unsplash photo of a real African open-air market,
reused across a few markets by produce focus and clearly labelled as
representative (no Pexels hotlinks anymore — everything market-related is
Unsplash now). If a lookup fails or times out (offline, no image, a slow
network), the card simply keeps its plain gradient tile with a small
line-art icon — never a broken-image icon, half-loaded photo, or an orphan
credit chip with nothing behind it. See `js/icons.js` for the icon set. The
About page lists every photo's source, each linking straight to it for full
credit.

## No emoji anywhere in the UI

Every glyph that used to be an emoji — the basket brand mark, the chat icon,
the location pin, card thumbnails, category tags — is now a small inline SVG
from `js/icons.js`. The `emoji` fields still sitting in `data/markets.json`
and `data/produce.json` are unused leftovers from an earlier version; nothing
in the code reads them, so they're safe to delete whenever the data gets a
cleanup pass, or safe to ignore.

## Chatbot widget (Basket Buddy)

Collapsed, it's a small floating pill in the corner showing just the name
"Basket Buddy" with a gentle floating (bob) animation — not a large icon
sitting over page content. Clicking it expands the full chat panel anchored
above the pill; clicking again (or the close button, or Escape) collapses it
back down to the pill. The floating animation stops automatically for anyone
with `prefers-reduced-motion: reduce` set, and while the panel is open the pill
itself stops bobbing.

## A CSS bug worth knowing about

`.chat-panel` sets its own `display:flex`, which has the *exact same
specificity* as the browser's built-in `[hidden]{display:none}` rule — so
whichever one is declared later in the stylesheet wins, regardless of the
`hidden` attribute on the element. The fix, near the top of `style.css`:

```css
[hidden]{ display:none !important; }
```

This matters for anything that both toggles the `hidden` attribute *and* sets
its own `display` — the chat panel, the mobile nav, the search-result
dropdowns. Worth remembering for any future component built the same way.

## Navbar breakpoint (fixed)

The full desktop nav (brand + 6 links + search box + Log in/Sign up) needs
roughly 1150px of width to lay out on one line without crowding. The nav
used to switch to the hamburger menu at 840px, which left a wide "squeezed"
zone (roughly 840–1150px — a very common laptop/browser-window width) where
the links, search box and buttons no longer fit in the header and would
overlap or crush together. The breakpoint in `style.css` is now 1150px, and
the header's internal gaps/font-sizes were tightened slightly, so the full
row only ever shows once it genuinely has the room, and the hamburger menu
takes over cleanly below that.

## Storage: what persists vs. what's session-only

- **Bookmarks** (`localStorage`) — the saved list of markets and produce
  persists across visits, so a saved market is still there next time you
  open the site on the same device/browser.
- **Personal notes on a bookmark** (`sessionStorage`) — kept only for the
  current visit, as required by the SRS. Close the tab and the note is
  gone, even though the bookmark itself stays. Add a note on the Bookmarks
  page; it's included automatically when you use Export as list.
- Photo lookups (`sessionStorage`) — cached for the rest of the visit so the
  same market/produce card doesn't re-fetch its photo on every navigation.

All storage access is wrapped in try/catch — a blocked storage API (private
browsing, restrictive embeds) degrades gracefully instead of breaking the
page.

## Login / Sign up

These are placeholders per the SRS. Clicking either writes a message to a
`role="status"` line under the header instead of using `alert()` —
`alert()` is blocked in some sandboxed/embedded viewing contexts, so a
status line is both more reliable and less disruptive. The same status line
is reused for the "couldn't get your location" case on Home/Contact.

## Handing off the backend (SQL)

Every view calls `FFData.*` in `js/data.js` instead of touching JSON
directly. Swap each function's `fetch('data/....json')` for
`fetch('/api/...')` returning the same shape — nothing else changes.
Suggested tables are documented at the top of `js/data.js`.
