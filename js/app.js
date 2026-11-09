/**
 * app.js — FreshFind main logic: view rendering, filter/sort, bookmarks,
 * visitor counter, live clock. Talks to data only through FFData (js/data.js)
 * so the eventual SQL backend swap only touches that one file.
 */
(function () {
  const appEl = document.getElementById('app');
  const breadcrumbEl = document.getElementById('breadcrumb');
  const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* ---------------- bookmarks ----------------
   * The saved list itself (which markets/produce) persists across visits in
   * localStorage — a bookmark you make today should still be there tomorrow.
   * Personal notes attached to a bookmark are session-only, per the SRS, so
   * they're kept separately in sessionStorage (see getNote/setNote below)
   * and are never mixed into this list. */
  const BM_KEY = 'ff_bookmarks';
  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(BM_KEY)) || { markets: [], produce: [] }; }
    catch { return { markets: [], produce: [] }; }
  }
  function saveBookmarks(bm) {
    try { localStorage.setItem(BM_KEY, JSON.stringify(bm)); } catch { /* storage unavailable — bookmark still works for this session via in-memory state */ }
    updateBmCount();
  }
  function toggleBookmark(kind, id) {
    const bm = getBookmarks();
    const list = bm[kind];
    const i = list.indexOf(id);
    if (i === -1) list.push(id); else list.splice(i, 1);
    saveBookmarks(bm);
    return i === -1;
  }
  function isBookmarked(kind, id) { return getBookmarks()[kind].includes(id); }

  /* ---------------- bookmark notes (session-only, per SRS) ---------------- */
  const NOTE_KEY = 'ff_notes';
  function getNotes() {
    try { return JSON.parse(sessionStorage.getItem(NOTE_KEY)) || {}; }
    catch { return {}; }
  }
  function getNote(kind, id) { return getNotes()[kind + ':' + id] || ''; }
  function setNote(kind, id, text) {
    const notes = getNotes();
    const key = kind + ':' + id;
    if (text) notes[key] = text; else delete notes[key];
    try { sessionStorage.setItem(NOTE_KEY, JSON.stringify(notes)); } catch { /* note just won't survive a refresh */ }
  }

  /** Appends a small "My note" textarea to a bookmark card's body. Used only
   *  on the Bookmarks page — the directory/produce-guide cards stay as-is. */
  function attachNoteBox(cardEl, kind, id) {
    const body = cardEl.querySelector('.card-body');
    if (!body) return;
    const wrap = document.createElement('div');
    wrap.className = 'note-box';
    const noteId = `note-${kind}-${id}`;
    const label = document.createElement('label');
    label.className = 'note-label';
    label.htmlFor = noteId;
    label.textContent = 'My note (kept for this visit only)';
    const ta = document.createElement('textarea');
    ta.id = noteId;
    ta.className = 'note-input';
    ta.rows = 2;
    ta.placeholder = 'Add a note for your visit…';
    ta.value = getNote(kind, id);
    ta.addEventListener('input', () => setNote(kind, id, ta.value));
    wrap.appendChild(label);
    wrap.appendChild(ta);
    body.appendChild(wrap);
  }
  function updateBmCount() {
    const bm = getBookmarks();
    const n = bm.markets.length + bm.produce.length;
    const el = document.getElementById('bmCount');
    el.hidden = n === 0;
    el.textContent = n;
  }

  /* ---------------- template + card helpers ---------------- */
  function useTemplate(id) {
    const tpl = document.getElementById(id);
    appEl.innerHTML = '';
    appEl.appendChild(tpl.content.cloneNode(true));
    appEl.classList.remove('view'); void appEl.offsetWidth; appEl.classList.add('view'); // replay animation
  }

  function setBreadcrumb(parts) {
    // parts: [{label, href?}] last item has no href
    if (!parts) { breadcrumbEl.hidden = true; return; }
    breadcrumbEl.hidden = false;
    breadcrumbEl.innerHTML = parts.map((p, i) => {
      const isLast = i === parts.length - 1;
      return isLast ? `<span aria-current="page">${p.label}</span>` : `<a href="${p.href}">${p.label}</a> / `;
    }).join('');
  }

  function scheduleSummary(days) {
    return DAY_ORDER.filter(d => days[d]).map(d => `${d} ${days[d]}`).join(' · ');
  }

  function marketCard(m, opts) {
    opts = opts || {};
    const openNow = FFData.isOpenAt(m);
    const saved = isBookmarked('markets', m.id);
    const el = document.createElement('article');
    el.className = 'card';
    el.style.animationDelay = (opts.delay || 0) + 'ms';
    el.innerHTML = `
      <div class="card-media" data-photo-kind="markets" data-photo-id="${m.id}" data-alt="${m.name}">${FFIcons.svg('market', { size: 32, className: 'tile-icon' })}</div>
      <div class="card-body">
        <span class="badge ${openNow ? 'badge-open' : 'badge-closed'}">
          <span class="badge-dot"></span>${openNow ? 'Open now' : 'Closed now'}
        </span>
        <h3><a href="#/market/${m.id}" style="color:inherit;text-decoration:none">${m.name}</a></h3>
        <p class="card-meta">${m.area}, ${m.state} · ${scheduleSummary(m.days)}</p>
        <p class="card-desc">${m.desc}</p>
        <div class="card-actions">
          <a class="btn btn-ghost" href="#/market/${m.id}">View market</a>
          <button class="btn btn-tomato save-btn" type="button" aria-pressed="${saved}" data-kind="markets" data-id="${m.id}">${saved ? 'Saved ✓' : 'Save'}</button>
        </div>
      </div>`;
    return el;
  }

  function produceCard(p, opts) {
    opts = opts || {};
    const saved = isBookmarked('produce', p.id);
    const el = document.createElement('article');
    el.className = 'card';
    el.style.animationDelay = (opts.delay || 0) + 'ms';
    el.innerHTML = `
      <div class="card-media" data-photo-kind="produce" data-photo-id="${p.id}" data-alt="${p.name}">${FFIcons.iconForCategory(p.cat, { size: 32 })}</div>
      <div class="card-body">
        <span class="badge badge-season">${p.season}</span>
        <h3><a href="#/produce/${p.id}" style="color:inherit;text-decoration:none">${p.name}</a></h3>
        <p class="card-meta">${p.cat}</p>
        <p class="card-desc">${p.desc}</p>
        <div class="card-actions">
          <a class="btn btn-ghost" href="#/produce/${p.id}">View</a>
          <button class="btn btn-tomato save-btn" type="button" aria-pressed="${saved}" data-kind="produce" data-id="${p.id}">${saved ? 'Saved ✓' : 'Save'}</button>
        </div>
      </div>`;
    return el;
  }

  /** Fills every [data-photo-kind] tile within `root` with a live photo when one resolves;
   *  otherwise the gradient + icon tile already in the markup stays exactly as-is.
   *
   *  The credit chip is only ever added once the <img> has actually finished
   *  loading (onload) — previously it was appended unconditionally as soon as
   *  a photo *object* resolved, so a broken/expired image URL still left a
   *  floating "Photo: Unsplash" chip over an empty tile. Now a failed image
   *  is removed with nothing left behind, so a tile is either a full,
   *  properly-fitted photo, or the plain gradient + icon — never a
   *  half-broken state in between. */
  function hydratePhotos(root) {
    root.querySelectorAll('[data-photo-kind]').forEach(tile => {
      const kind = tile.dataset.photoKind;
      const id = tile.dataset.photoId;
      const getter = kind === 'markets' ? FFPhotos.getMarketPhoto : FFPhotos.getProducePhoto;
      getter(id).then(photo => {
        if (!photo || !photo.src || !tile.isConnected) return;
        const img = document.createElement('img');
        img.alt = tile.dataset.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';

        img.onload = () => {
          if (!photo.page) return;
          const credit = document.createElement('a');
          credit.className = 'photo-credit';
          credit.href = photo.page;
          credit.target = '_blank';
          credit.rel = 'noopener';
          // photos.js mixes hardcoded Unsplash photos with live Wikipedia
          // lookups — label each chip by its actual source instead of
          // assuming Wikipedia for everything.
          let label = 'Photo: Wikipedia';
          if (/unsplash\.com/.test(photo.page)) label = 'Photo: Unsplash';
          credit.textContent = label;
          tile.appendChild(credit);
        };
        img.onerror = () => img.remove(); // leaves the gradient/icon tile visible underneath, no orphan credit chip

        img.src = photo.srcWide || photo.src;
        tile.appendChild(img);
      }).catch(() => { /* stays a gradient tile */ });
    });
  }

  /** One function creates/re-centers a Leaflet map; if Leaflet failed to load
   *  (blocked network, offline), the container is left with a plain message
   *  instead of a silent blank box. */
  function initLeafletMap(container, lat, lng, zoom) {
    if (typeof L === 'undefined' || !container) {
      if (container) container.innerHTML = '<p class="map-loading">Live map unavailable — check your connection.</p>';
      return null;
    }
    const map = L.map(container, { scrollWheelZoom: false }).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    return map;
  }

  function wireSaveButtons(root) {
    root.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const nowSaved = toggleBookmark(btn.dataset.kind, btn.dataset.id);
        btn.setAttribute('aria-pressed', nowSaved);
        btn.textContent = nowSaved ? 'Saved ✓' : 'Save';
      });
    });
  }

  function skeletons(container, n) {
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      s.className = 'skeleton-card';
      container.appendChild(s);
    }
  }

  /* ---------------- HOME ---------------- */
  async function renderHome() {
    useTemplate('tpl-home');
    setBreadcrumb(null);
    const [markets, produce] = await Promise.all([FFData.getMarkets(), FFData.getProduce()]);

    const areaSel = document.getElementById('qfArea');
    const daySel = document.getElementById('qfDay');
    const produceSel = document.getElementById('qfProduce');
    [...new Set(markets.map(m => m.area))].sort().forEach(a => areaSel.add(new Option(a, a)));
    DAY_ORDER.forEach(d => daySel.add(new Option(d, d)));
    produce.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(p => produceSel.add(new Option(p.name, p.id)));

    document.getElementById('quickFindForm').addEventListener('submit', e => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (areaSel.value) params.set('area', areaSel.value);
      if (daySel.value) params.set('day', daySel.value);
      if (produceSel.value) params.set('produce', produceSel.value);
      FFRouter.navigate('/directory' + (params.toString() ? '?' + params.toString() : ''));
    });

    document.getElementById('useLocationBtn').addEventListener('click', async () => {
      const label = document.getElementById('useLocationLabel');
      label.textContent = 'Locating…';
      try {
        await FFGeo.requestLocation();
        label.textContent = 'Location set — sorting by nearest';
        FFRouter.navigate('/directory?sort=nearest');
      } catch {
        label.textContent = 'Use my location';
        showStatus("Couldn't get your location. You can still browse the full list by name.");
      }
    });

    const openGrid = document.getElementById('openNowGrid');
    skeletons(openGrid, 3);
    const openNow = markets.filter(m => FFData.isOpenAt(m)).slice(0, 6);
    setTimeout(() => {
      openGrid.innerHTML = '';
      if (!openNow.length) {
        openGrid.innerHTML = '<p class="empty-note">No markets are open right now. Check the Directory for weekly hours.</p>';
      } else {
        openNow.forEach((m, i) => openGrid.appendChild(marketCard(m, { delay: i * 40 })));
        wireSaveButtons(openGrid);
        hydratePhotos(openGrid);
      }
    }, 250);

    const seasonGrid = document.getElementById('seasonalGrid');
    skeletons(seasonGrid, 4);
    const month = new Date().getMonth();
    const currentSeason = [3, 4, 5, 6, 7, 8].includes(month) ? 'Rainy' : 'Dry';
    const seasonal = produce.filter(p => p.season === currentSeason || p.season === 'Year-round').slice(0, 8);
    setTimeout(() => {
      seasonGrid.innerHTML = '';
      seasonal.forEach((p, i) => seasonGrid.appendChild(produceCard(p, { delay: i * 40 })));
      wireSaveButtons(seasonGrid);
      hydratePhotos(seasonGrid);
    }, 250);
  }

  /* ---------------- DIRECTORY ---------------- */
  async function renderDirectory(params, query) {
    useTemplate('tpl-directory');
    setBreadcrumb([{ label: 'Home', href: '#/home' }, { label: 'Markets' }]);
    const markets = await FFData.getMarkets();
    const produce = await FFData.getProduce();

    const areaSel = document.getElementById('fArea');
    const daySel = document.getElementById('fDay');
    const produceSel = document.getElementById('fProduce');
    const sortSel = document.getElementById('fSort');
    const grid = document.getElementById('directoryGrid');
    const countEl = document.getElementById('resultCount');

    [...new Set(markets.map(m => m.area))].sort().forEach(a => areaSel.add(new Option(a, a)));
    DAY_ORDER.forEach(d => daySel.add(new Option(d, d)));
    produce.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(p => produceSel.add(new Option(p.name, p.id)));

    areaSel.value = query.area || '';
    daySel.value = query.day || '';
    produceSel.value = query.produce || '';
    sortSel.value = query.sort || 'name';

    function syncUrl() {
      const p = new URLSearchParams();
      if (areaSel.value) p.set('area', areaSel.value);
      if (daySel.value) p.set('day', daySel.value);
      if (produceSel.value) p.set('produce', produceSel.value);
      if (sortSel.value !== 'name') p.set('sort', sortSel.value);
      const hash = '#/directory' + (p.toString() ? '?' + p.toString() : '');
      history.replaceState(null, '', hash);
    }

    async function applyAndRender() {
      let list = markets.filter(m =>
        (!areaSel.value || m.area === areaSel.value) &&
        (!daySel.value || m.days[daySel.value]) &&
        (!produceSel.value || m.produce.includes(produceSel.value))
      );

      if (sortSel.value === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortSel.value === 'nextopen') {
        list.sort((a, b) => {
          const na = FFData.nextOpenDay(a), nb = FFData.nextOpenDay(b);
          return (na ? na.offset : 99) - (nb ? nb.offset : 99);
        });
      } else if (sortSel.value === 'nearest') {
        let pos = FFGeo.getCached();
        if (!pos) {
          try { pos = await FFGeo.requestLocation(); }
          catch { list.sort((a, b) => a.name.localeCompare(b.name)); sortSel.value = 'name'; }
        }
        if (pos) {
          list.sort((a, b) =>
            FFData.distanceKm(pos.lat, pos.lng, a.lat, a.lng) -
            FFData.distanceKm(pos.lat, pos.lng, b.lat, b.lng)
          );
        }
      }

      countEl.textContent = `${list.length} market${list.length === 1 ? '' : 's'} found`;
      grid.innerHTML = '';
      if (!list.length) {
        grid.innerHTML = '<p class="empty-note">No markets match those filters. Try clearing one.</p>';
      } else {
        list.forEach((m, i) => grid.appendChild(marketCard(m, { delay: i * 40 })));
        wireSaveButtons(grid);
        hydratePhotos(grid);
      }
      syncUrl();
    }

    [areaSel, daySel, produceSel, sortSel].forEach(el => el.addEventListener('change', applyAndRender));
    document.getElementById('clearFilters').addEventListener('click', () => {
      areaSel.value = ''; daySel.value = ''; produceSel.value = ''; sortSel.value = 'name';
      applyAndRender();
    });

    skeletons(grid, 6);
    applyAndRender();
  }

  /* ---------------- MARKET DETAIL ---------------- */
  async function renderMarketDetail(params) {
    useTemplate('tpl-detail');
    const m = await FFData.getMarketById(params.id);
    const inner = document.getElementById('detailInner');
    if (!m) {
      inner.innerHTML = '<p>Market not found. <a href="#/directory">Back to Directory</a></p>';
      return;
    }
    setBreadcrumb([{ label: 'Home', href: '#/home' }, { label: 'Markets', href: '#/directory' }, { label: m.name }]);
    const produce = await FFData.getProduce();
    const openNow = FFData.isOpenAt(m);
    const saved = isBookmarked('markets', m.id);
    const rows = DAY_ORDER.filter(d => m.days[d]).map(d => `<tr><th scope="row">${d}</th><td>${m.days[d]}</td></tr>`).join('');
    const tags = m.produce.map(pid => {
      const p = produce.find(x => x.id === pid);
      return p ? `<a class="produce-tag" href="#/produce/${p.id}">${p.name}</a>` : '';
    }).join('');
    const shareUrl = encodeURIComponent(location.href);
    const shareText = encodeURIComponent(`Check out ${m.name} on FreshFind`);

    inner.innerHTML = `
      <div class="detail-head">
        <div class="detail-media" data-photo-kind="markets" data-photo-id="${m.id}" data-alt="${m.name}">${FFIcons.svg('market', { size: 56, className: 'tile-icon' })}</div>
        <div class="detail-info">
          <span class="badge ${openNow ? 'badge-open' : 'badge-closed'}"><span class="badge-dot"></span>${openNow ? 'Open now' : 'Closed now'}</span>
          <h1>${m.name}</h1>
          <p class="card-meta">${m.address}</p>
          <p>${m.desc}</p>
          <button class="btn btn-tomato save-btn" type="button" aria-pressed="${saved}" data-kind="markets" data-id="${m.id}">${saved ? 'Saved ✓' : 'Save market'}</button>
          <div class="share-row">
            <a href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener">WhatsApp</a>
            <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" rel="noopener">X</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener">Facebook</a>
          </div>
        </div>
      </div>
      <h2>Weekly schedule</h2>
      <table class="schedule-table"><tbody>${rows}</tbody></table>
      <h2>Typically found here</h2>
      <div class="produce-tag-list">${tags}</div>
      <h2>Location</h2>
      <div class="map-embed" id="marketMap"></div>
    `;
    wireSaveButtons(inner);
    hydratePhotos(inner);
    const map = initLeafletMap(document.getElementById('marketMap'), m.lat, m.lng, 14);
    if (map) {
      L.marker([m.lat, m.lng]).addTo(map)
        .bindPopup(`<strong>${m.name}</strong><br>${m.address}`)
        .openPopup();
    }
  }

  /* ---------------- PRODUCE GUIDE ---------------- */
  async function renderProduceGuide(params, query) {
    useTemplate('tpl-produce');
    setBreadcrumb([{ label: 'Home', href: '#/home' }, { label: 'Produce' }]);
    const produce = await FFData.getProduce();
    const catSel = document.getElementById('pCat');
    const grid = document.getElementById('produceGrid');
    const countEl = document.getElementById('produceCount');

    [...new Set(produce.map(p => p.cat))].sort().forEach(c => catSel.add(new Option(c, c)));
    catSel.value = query.cat || '';

    function render() {
      const list = produce.filter(p => !catSel.value || p.cat === catSel.value);
      countEl.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
      grid.innerHTML = '';
      list.forEach((p, i) => grid.appendChild(produceCard(p, { delay: i * 40 })));
      wireSaveButtons(grid);
      hydratePhotos(grid);
      const h = catSel.value ? `#/produce?cat=${encodeURIComponent(catSel.value)}` : '#/produce';
      history.replaceState(null, '', h);
    }
    catSel.addEventListener('change', render);
    document.getElementById('clearProduceFilters').addEventListener('click', () => { catSel.value = ''; render(); });

    skeletons(grid, 6);
    render();
  }

  async function renderProduceDetail(params) {
    useTemplate('tpl-produce-detail');
    const p = await FFData.getProduceById(params.id);
    const inner = document.getElementById('produceDetailInner');
    if (!p) { inner.innerHTML = '<p>Produce not found. <a href="#/produce">Back to Produce Guide</a></p>'; return; }
    setBreadcrumb([{ label: 'Home', href: '#/home' }, { label: 'Produce', href: '#/produce' }, { label: p.name }]);
    const markets = await FFData.getMarketsForProduce(p.id);
    const saved = isBookmarked('produce', p.id);
    const marketLinks = markets.map(m => `<a class="produce-tag" href="#/market/${m.id}">${m.name}</a>`).join('') || '<p class="empty-note">No markets listed yet.</p>';

    inner.innerHTML = `
      <div class="detail-head">
        <div class="detail-media" data-photo-kind="produce" data-photo-id="${p.id}" data-alt="${p.name}">${FFIcons.iconForCategory(p.cat, { size: 56 })}</div>
        <div class="detail-info">
          <span class="badge badge-season">${p.season}</span>
          <h1>${p.name}</h1>
          <p class="card-meta">${p.cat}</p>
          <p>${p.desc}</p>
          <button class="btn btn-tomato save-btn" type="button" aria-pressed="${saved}" data-kind="produce" data-id="${p.id}">${saved ? 'Saved ✓' : 'Save produce'}</button>
        </div>
      </div>
      <h2>Find it at</h2>
      <div class="produce-tag-list">${marketLinks}</div>
    `;
    wireSaveButtons(inner);
    hydratePhotos(inner);
  }

  /* ---------------- BOOKMARKS ---------------- */
  async function renderBookmarks() {
    useTemplate('tpl-bookmarks');
    setBreadcrumb([{ label: 'Home', href: '#/home' }, { label: 'Bookmarks' }]);
    const bm = getBookmarks();
    const [markets, produce] = await Promise.all([FFData.getMarkets(), FFData.getProduce()]);
    const savedMarkets = markets.filter(m => bm.markets.includes(m.id));
    const savedProduce = produce.filter(p => bm.produce.includes(p.id));

    const mGrid = document.getElementById('bookmarkMarketsGrid');
    const pGrid = document.getElementById('bookmarkProduceGrid');
    document.getElementById('emptyMarkets').hidden = savedMarkets.length > 0;
    document.getElementById('emptyProduce').hidden = savedProduce.length > 0;
    savedMarkets.forEach((m, i) => {
      const el = marketCard(m, { delay: i * 40 });
      mGrid.appendChild(el);
      attachNoteBox(el, 'markets', m.id);
    });
    savedProduce.forEach((p, i) => {
      const el = produceCard(p, { delay: i * 40 });
      pGrid.appendChild(el);
      attachNoteBox(el, 'produce', p.id);
    });
    wireSaveButtons(mGrid); wireSaveButtons(pGrid);
    hydratePhotos(mGrid); hydratePhotos(pGrid);

    const exportBtn = document.getElementById('exportListBtn');
    const copyBtn = document.getElementById('copyListBtn');
    const box = document.getElementById('exportBox');
    exportBtn.addEventListener('click', () => {
      const withNote = (line, kind, id) => {
        const n = getNote(kind, id);
        return n ? `${line}\n      Note: ${n}` : line;
      };
      const lines = [
        'Markets:',
        ...savedMarkets.map(m => withNote(`  • ${m.name} — ${m.area}`, 'markets', m.id)),
        '', 'Produce:',
        ...savedProduce.map(p => withNote(`  • ${p.name}`, 'produce', p.id))
      ];
      box.textContent = lines.join('\n') || 'Nothing saved yet.';
      box.hidden = false;
      copyBtn.hidden = false;
    });
    copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(box.textContent); copyBtn.textContent = 'Copied ✓'; }
      catch { copyBtn.textContent = 'Copy failed'; }
      setTimeout(() => { copyBtn.textContent = 'Copy list'; }, 1500);
    });
  }

  async function renderAbout() {
    useTemplate('tpl-about');
    setBreadcrumb([{ label: 'Home', href: '#/home' }, { label: 'About' }]);
    const creditsEl = document.getElementById('photoCredits');
    const credits = FFPhotos.listCredits();
    creditsEl.className = 'produce-tag-list';
    creditsEl.innerHTML = credits.map(c =>
      `<a class="produce-tag" href="${c.url}" target="_blank" rel="noopener">${c.title}</a>`
    ).join('');
  }

  async function renderContact() {
    useTemplate('tpl-contact');
    setBreadcrumb([{ label: 'Home', href: '#/home' }, { label: 'Contact' }]);

    const markets = await FFData.getMarkets();
    const mapEl = document.getElementById('contactMap');
    const avgLat = markets.reduce((s, m) => s + m.lat, 0) / markets.length;
    const avgLng = markets.reduce((s, m) => s + m.lng, 0) / markets.length;
    const map = initLeafletMap(mapEl, avgLat, avgLng, 7);

    if (map) {
      const bounds = [];
      markets.forEach(m => {
        L.marker([m.lat, m.lng]).addTo(map)
          .bindPopup(`<strong>${m.name}</strong><br>${m.area}, ${m.state}<br><a href="#/market/${m.id}">View market →</a>`);
        bounds.push([m.lat, m.lng]);
      });
      map.fitBounds(bounds, { padding: [30, 30] });

      const liveBtn = document.getElementById('liveLocationBtn');
      let userMarker = null;
      liveBtn.addEventListener('click', async () => {
        liveBtn.disabled = true;
        try {
          const pos = await FFGeo.requestLocation();
          map.setView([pos.lat, pos.lng], 12);
          if (userMarker) userMarker.remove();
          userMarker = L.marker([pos.lat, pos.lng]).addTo(map).bindPopup('You are here').openPopup();
        } catch {
          showStatus("Couldn't get your location — you can still pan and zoom the map above.");
        } finally {
          liveBtn.disabled = false;
        }
      });
    }
  }

  /* ---------------- routes ---------------- */
  FFRouter.on('/home', renderHome);
  FFRouter.on('/directory', renderDirectory);
  FFRouter.on('/market/:id', renderMarketDetail);
  FFRouter.on('/produce', renderProduceGuide);
  FFRouter.on('/produce/:id', renderProduceDetail);
  FFRouter.on('/bookmarks', renderBookmarks);
  FFRouter.on('/about', renderAbout);
  FFRouter.on('/contact', renderContact);

  /* ---------------- mobile nav ---------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('main-nav-mobile');
  navToggle.addEventListener('click', () => {
    const open = mobileNav.dataset.open === 'true';
    mobileNav.dataset.open = String(!open);
    mobileNav.hidden = open;
    navToggle.setAttribute('aria-expanded', String(!open));
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.dataset.open = 'false'; mobileNav.hidden = true;
  }));

  /* ---------------- header status line (replaces alert()) ---------------- */
  function showStatus(msg) {
    const el = document.getElementById('headerStatus');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showStatus._t);
    showStatus._t = setTimeout(() => { el.hidden = true; }, 4500);
  }

  /* ---------------- dummy login/signup ---------------- */
  document.getElementById('loginBtn').addEventListener('click', () =>
    showStatus('Log in is a placeholder for now — no account needed to use FreshFind.'));
  document.getElementById('signupBtn').addEventListener('click', () =>
    showStatus('Sign up is a placeholder for now — no account needed to use FreshFind.'));

  /* ---------------- nav search (desktop + mobile) ---------------- */
  (function setupNavSearch() {
    const instances = [
      { form: document.getElementById('navSearchForm'), input: document.getElementById('navSearchInput'), results: document.getElementById('navSearchResults'), mobile: false },
      { form: document.getElementById('navSearchFormMobile'), input: document.getElementById('navSearchInputMobile'), results: document.getElementById('navSearchResultsMobile'), mobile: true }
    ];

    async function runSearch(query) {
      const q = query.trim().toLowerCase();
      if (!q) return { markets: [], produce: [] };
      const [markets, produce] = await Promise.all([FFData.getMarkets(), FFData.getProduce()]);
      return {
        markets: markets.filter(m => m.name.toLowerCase().includes(q) || m.area.toLowerCase().includes(q)).slice(0, 5),
        produce: produce.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5)
      };
    }

    function renderResults(inst, results) {
      const { markets, produce } = results;
      if (!markets.length && !produce.length) {
        inst.results.innerHTML = '<p class="nsr-empty">No matches. Try a different name.</p>';
        inst.results.hidden = false;
        return;
      }
      let html = '';
      if (markets.length) {
        html += '<p class="nsr-group-label">Markets</p>' + markets.map(m =>
          `<a class="nsr-item" href="#/market/${m.id}"><span class="nsr-icon">${FFIcons.svg('market', { size: 16 })}</span>${m.name}<span class="nsr-meta">${m.area}</span></a>`
        ).join('');
      }
      if (produce.length) {
        html += '<p class="nsr-group-label">Produce</p>' + produce.map(p =>
          `<a class="nsr-item" href="#/produce/${p.id}"><span class="nsr-icon">${FFIcons.iconForCategory(p.cat, { size: 16, className: '' })}</span>${p.name}</a>`
        ).join('');
      }
      inst.results.innerHTML = html;
      inst.results.hidden = false;
      inst.results.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeInst(inst)));
    }

    function closeInst(inst) {
      inst.results.hidden = true;
      inst.input.value = '';
      if (inst.mobile) { mobileNav.dataset.open = 'false'; mobileNav.hidden = true; }
    }

    instances.forEach(inst => {
      if (!inst.form) return;
      let debounceTimer;
      inst.input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const value = inst.input.value;
        if (!value.trim()) { inst.results.hidden = true; return; }
        debounceTimer = setTimeout(async () => {
          renderResults(inst, await runSearch(value));
        }, 150);
      });
      inst.form.addEventListener('submit', async e => {
        e.preventDefault();
        const r = await runSearch(inst.input.value);
        if (r.markets[0]) FFRouter.navigate('/market/' + r.markets[0].id);
        else if (r.produce[0]) FFRouter.navigate('/produce/' + r.produce[0].id);
        else if (inst.input.value.trim()) FFRouter.navigate('/directory');
        closeInst(inst);
      });
      inst.input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { inst.results.hidden = true; inst.input.blur(); }
      });
      document.addEventListener('click', e => {
        if (!inst.form.contains(e.target)) inst.results.hidden = true;
      });
    });
  })();

  /* ---------------- visitor counter (JS-simulated, per SRS) ---------------- */
  (function visitorCounter() {
    const BASE = 1842; // seed so the counter doesn't start at 0
    let total = parseInt(localStorage.getItem('ff_visits') || '0', 10) || BASE;
    if (!sessionStorage.getItem('ff_counted')) {
      total += 1;
      localStorage.setItem('ff_visits', String(total));
      sessionStorage.setItem('ff_counted', '1');
    }
    document.getElementById('visitorCount').textContent = total.toLocaleString();
  })();

  /* ---------------- live clock ---------------- */
  (function liveClock() {
    const el = document.getElementById('clock');
    function tick() { el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    tick();
    setInterval(tick, 1000);
  })();

  /* ---------------- boot ---------------- */
  updateBmCount();
  FFRouter.start();
})();
