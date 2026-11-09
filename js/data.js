/**
 * data.js — FreshFind data service layer
 *
 * IMPORTANT FOR BACKEND HAND-OFF:
 * Every view in app.js calls FFData.* functions instead of fetching JSON
 * directly. Right now those functions read the three JSON files below.
 * When the SQL backend is ready, only this file needs to change — swap
 * each function body for a `fetch('/api/...')` call that returns the same
 * shape, and the rest of the app keeps working unmodified.
 *
 * Suggested SQL tables (field names already match the JSON, on purpose):
 *   markets(id PK, name, area, state, address, lat, lng, emoji, image, desc)
 *   market_hours(market_id FK, day, open_time, close_time)   -- from markets[].days
 *   market_produce(market_id FK, produce_id FK)              -- from markets[].produce
 *   produce(id PK, name, cat, emoji, season, desc)
 *   chatbot_faq(id PK, answer, link)
 *   chatbot_faq_keywords(faq_id FK, keyword)
 */
(function (global) {
  const CACHE = {};

  async function loadJSON(path) {
    if (CACHE[path]) return CACHE[path];
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    const data = await res.json();
    CACHE[path] = data;
    return data;
  }

  function resolveImage(kind, path) {
    // Central place to change if the folder layout moves (e.g. once real
    // photos land, or once a backend serves images from a CDN).
    return 'assets/images/' + path.replace(/^images\//, '');
  }

  async function getMarkets() {
    return loadJSON('data/markets.json');
  }

  async function getMarketById(id) {
    const markets = await getMarkets();
    return markets.find(m => m.id === id) || null;
  }

  async function getProduce() {
    return loadJSON('data/produce.json');
  }

  async function getProduceById(id) {
    const produce = await getProduce();
    return produce.find(p => p.id === id) || null;
  }

  async function getChatbotConfig() {
    return loadJSON('data/chatbot.json');
  }

  /** Markets that carry a given produce id. */
  async function getMarketsForProduce(produceId) {
    const markets = await getMarkets();
    return markets.filter(m => m.produce.includes(produceId));
  }

  /** True if the given market is open at the given Date (defaults to now). */
  function isOpenAt(market, date) {
    date = date || new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = dayNames[date.getDay()];
    const range = market.days[day];
    if (!range) return false;
    const [start, end] = range.split('-');
    const mins = date.getHours() * 60 + date.getMinutes();
    const toMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    return mins >= toMins(start) && mins <= toMins(end);
  }

  /** Next day (from today, inclusive) the market opens, with days-away count. */
  function nextOpenDay(market, date) {
    date = date || new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIdx = date.getDay();
    for (let offset = 0; offset < 7; offset++) {
      const idx = (todayIdx + offset) % 7;
      const name = dayNames[idx];
      if (market.days[name]) return { day: name, offset };
    }
    return null;
  }

  function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  global.FFData = {
    getMarkets, getMarketById, getProduce, getProduceById,
    getChatbotConfig, getMarketsForProduce,
    isOpenAt, nextOpenDay, distanceKm, resolveImage
  };
})(window);
