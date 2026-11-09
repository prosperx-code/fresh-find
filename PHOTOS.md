## Local images (fixed build)

All photos now live under images/ and are loaded from disk — no external image hosts required at runtime. See the table below for original sourcing notes.

# Photos for FreshFind

## Two sources, chosen per item — not one rule for everything

Earlier drafts tried local `.webp` files, then exact Wikimedia Commons
filenames, then a single live-Wikipedia-fetch mechanism for every card
(original plans kept at the bottom of this file for history). The current
build (`js/photos.js`) instead picks whichever real source is verifiably
**exact** for that specific item, on a per-item basis:

1. **Hardcoded, hand-picked Unsplash photo.** For items where a stock-photo
   search reliably surfaces the real, correct thing, we picked one specific
   photo, opened its page to confirm it's genuinely what it claims to be,
   and baked its direct image URL straight into `js/photos.js`. This loads
   instantly and never depends on a network call succeeding at the moment
   someone visits the site.
2. **Live Wikipedia fetch** (`js/photos.js`'s original mechanism, kept for
   the rest). Wikipedia's own species-specific articles are more reliable
   than general stock-photo tagging for several West African staples —
   see "Why not Unsplash for everything?" below. We ask Wikipedia's public,
   CORS-enabled REST API (`/api/rest_v1/page/summary/<article>`) for that
   article's current infobox thumbnail at render time. If a lookup fails
   (offline, no image, blocked network), the card keeps its plain gradient
   tile with the line-art icon from `js/icons.js` — never a broken-image
   icon, never an emoji.

## Why not Unsplash for everything?

We tried. Searching Unsplash for **"yam"** returns almost no real West
African yam (*Dioscorea*) — mostly sweet potatoes (the American/British
naming overlap) and unrelated photos entirely, because "yam" isn't a
precise tag on a general Western stock-photo site. Wikipedia's dedicated
`Yam (vegetable)` article, by contrast, has a real photo of actual yam
tubers ("Yams at Brixton market") because the article is specifically
about that plant — Wikipedia's infobox convention (photograph the part
that's eaten) turned out to be the more exact match, and cannot mix up
species the way a keyword search can. So: Unsplash where it's demonstrably
exact, Wikipedia where its precision wins.

## Produce — the full list, with reasoning

| Produce | Source | Detail |
|---|---|---|
| Cassava | **Unsplash (hardcoded)** | "Pile of raw cassava roots" — Daniel Dan. Confirmed real cassava roots, not the leaf. |
| Sweet potato | **Unsplash (hardcoded)** | "A pile of pink and yellow sweet potatoes" — Glen Hayoge. |
| Tomato | **Unsplash (hardcoded)** | "Bunch of red tomatoes" — Andrea Riezzo. |
| Yam | Wikipedia, live — `Yam (vegetable)` | Infobox photo is real yam tubers at a market; Unsplash's "yam" results were unreliable (see above). |
| Cocoyam | Wikipedia, live — `Colocasia esculenta` | Cocoyam's botanical species article (same genus as taro). |
| Irish potato | Wikipedia, live — `Potato` | Unambiguous — this is literally the potato. |
| Pepper | Wikipedia, live — `Chili pepper` | |
| Okra | Wikipedia, live — `Okra` | |
| Cucumber | Wikipedia, live — `Cucumber` | |
| Carrot | Wikipedia, live — `Carrot` | |
| Onion | Wikipedia, live — `Onion` | |
| Plantain | Wikipedia, live — `Cooking banana` | |
| Pineapple | Wikipedia, live — `Pineapple` | |
| Orange | Wikipedia, live — `Orange (fruit)` | |
| Watermelon | Wikipedia, live — `Watermelon` | |
| Pawpaw (papaya) | Wikipedia, live — `Papaya` | |
| Banana | Wikipedia, live — `Banana` | |
| Mango | Wikipedia, live — `Mango` | |
| Avocado | Wikipedia, live — `Avocado` | |
| Garden egg | Wikipedia, live — `Solanum aethiopicum` | The African garden egg species specifically, not the larger purple Western eggplant Unsplash mostly returns for "eggplant". |
| Fluted pumpkin (Ugu) | Wikipedia, live — `Telfairia occidentalis` | Shows the leaf — correct, since ugu is sold and eaten as a leafy green, not a root. |
| Bitter leaf | Wikipedia, live — `Vernonia amygdalina` | Leaf shown — correct, it's a leaf vegetable. |
| Waterleaf | Wikipedia, live — `Talinum fruticosum` | Leaf shown — correct. |
| Scent leaf | Wikipedia, live — `Ocimum gratissimum` | Leaf shown — correct. |
| Uziza leaf | Wikipedia, live — `Piper guineense` | Leaf shown — correct. |
| Utazi | Wikipedia, live — `Gongronema latifolium` | Leaf shown — correct. |
| Fresh cow milk | Wikipedia, live — `Milk` | |
| Farm eggs | Wikipedia, live — `Egg as food` | |
| Beans | Wikipedia, live — `Phaseolus vulgaris` | The common bean species grown/eaten in this context. |
| Fresh maize | Wikipedia, live — `Maize` | |

A leafy vegetable's photo showing its **leaf** is not a mistake — ugu,
bitter leaf, waterleaf, scent leaf, uziza and utazi are all sold and
cooked as leaves, so a leaf photo is the correct, exact match for those.
It's only the root crops (yam, cassava, cocoyam, sweet potato, Irish
potato) where a leaf photo would be wrong — and each of those is
individually confirmed above to show the tuber, not the plant's foliage.

## Markets — why these can never have an "exact" photo, and what we used instead

**Every market in `data/markets.json` is fictional.** Ubani Green Market,
Olokoro Farm Fair, and the other ten sample markets were invented for this
project (see `README.md`) — they are not real, physical places, so no real
photo of any of them exists anywhere, on Unsplash or otherwise. Asking for
"the real Ubani Green Market photo" isn't possible to fulfil literally.

What we did instead: each market shows a **genuine, real Unsplash photo of
an actual open-air African market** (not a generic "bazaar" or "souq" stock
image standing in for a continent, which is what an even earlier version
used), reused across markets with a similar produce focus, and always
labelled as a **representative photo with its true location** in its
credit link — never presented as if it's a photo of that specific market's
own building, and never claiming a location the photo isn't actually from.

| Photo | Used for | Source |
|---|---|---|
| Tomato & pepper seller, Bodija Market, Ibadan, Nigeria | Ubani, Rumuola, Aba, Watt (vegetable/herb-heavy) | Tunde Buremo, Unsplash |
| Orange fruits in a crate, fruit market, KZN, South Africa | Olokoro, Ariaria, Trans-Amadi, Itam (fruit-focused) | R. du Plessis, Unsplash |
| Vendor at a fruit stand, open-air market, Dar es Salaam, Tanzania | Eleme, Ekeonunwa, Ogbete, Awka (staples/tubers) | Ali Mkumbwa, Unsplash |

All three market photos are now sourced from Unsplash — the two Pexels
hotlinks used previously were swapped out for verified Unsplash photos,
both to keep every image on one license/host and because the Pexels URLs
would occasionally fail to load or render oddly (see the CSS/JS fixes
below for the display bug this looked like on cards generally).

If you'd like each of the 12 markets to have its own distinct photo rather
than 3 reused across groups, or want photos specifically from Rivers/Abia
state markets (where these fictional markets are notionally set) rather
than Ibadan/Jos/Abuja, that's a reasonable next step — just ask.

## Fixed: photos not filling their tile / occasional "ghost" credit chip

Two bugs were making photos look broken even when a good URL was returned:

1. **CSS.** `.card-media`/`.detail-media` center their gradient+icon state
   with `display:flex`, and the `<img>` was just dropped in as a second flex
   item — so instead of covering the tile edge-to-edge, it competed for
   space with the icon and often rendered squashed into a sliver.  The image
   is now taken out of the flex flow with `position:absolute; inset:0`, so
   it always fills the tile exactly, with `object-fit:cover` doing the
   cropping, no matter what the icon underneath is doing.
2. **JS.** `hydratePhotos()` in `app.js` used to append the "Photo: …"
   credit chip as soon as a photo *object* resolved, before the image had
   actually finished loading. If that specific image URL ever failed (a
   dead link, a slow/blocked request), the chip stayed floating over an
   empty tile — a "broken but not obviously broken" look. The credit chip
   is now only added inside the image's own `onload`, so a tile is always
   either a complete photo with its credit, or the plain gradient + icon —
   never something in between.

## Format / performance notes

- Unsplash photo URLs are requested at a fixed width (`w=800`) suited to a
  card thumbnail; the Unsplash License permits this hotlinked, no-attribution-
  required use (credit links are still shown as a courtesy).
- Wikipedia's live results are cached in `sessionStorage` per topic, so
  navigating back to a page you've already visited this session doesn't
  re-fetch.
- All storage access and every fetch is wrapped in try/catch — a blocked
  request degrades to the gradient/icon tile instead of breaking the page.

## Original plans (superseded, kept for history)

The very first plan was locally-stored `.webp` files with Unsplash credit
lines, superseded by hotlinking exact Wikimedia Commons filenames, which
was superseded by a single live-Wikipedia-only mechanism, which is now
superseded by the hybrid approach above once we found Unsplash's own
tagging wasn't reliable across the board.

Full id list is in `data/markets.json` and `data/produce.json`.
