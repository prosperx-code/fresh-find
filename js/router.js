/**
 * router.js — hash-based router for FreshFind's single HTML page.
 * Routes look like: #/home  #/directory?day=Sat&area=Aba  #/market/ubani
 * #/produce  #/produce/yam  #/bookmarks  #/about  #/contact
 */
(function (global) {
  const routes = {};
  let current = null;

  function on(pattern, handler) {
    // pattern like '/market/:id' -> regex with named group
    const paramNames = [];
    const regexStr = pattern.replace(/:[^/]+/g, m => {
      paramNames.push(m.slice(1));
      return '([^/?]+)';
    });
    routes[pattern] = { regex: new RegExp('^' + regexStr + '$'), paramNames, handler };
  }

  function parseHash() {
    let hash = global.location.hash.slice(1) || '/home';
    let [path, queryStr] = hash.split('?');
    if (!path) path = '/home';
    const query = {};
    if (queryStr) {
      queryStr.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
    return { path, query };
  }

  function navigate(hash) {
    global.location.hash = hash;
  }

  function updateActiveNav(path) {
    const top = '/' + path.split('/')[1];
    document.querySelectorAll('[data-route]').forEach(a => {
      a.classList.toggle('active', '/' + a.dataset.route === top);
    });
  }

  async function resolve() {
    const { path, query } = parseHash();
    for (const key in routes) {
      const r = routes[key];
      const m = path.match(r.regex);
      if (m) {
        const params = {};
        r.paramNames.forEach((name, i) => { params[name] = m[i + 1]; });
        current = { path, query, params };
        updateActiveNav(path);
        window.scrollTo({ top: 0, behavior: 'auto' });
        await r.handler(params, query);
        return;
      }
    }
    // no match -> home
    navigate('/home');
  }

  function start() {
    global.addEventListener('hashchange', resolve);
    resolve();
  }

  global.FFRouter = { on, navigate, start, current: () => current };
})(window);
