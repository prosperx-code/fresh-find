/**
 * icons.js — a tiny inline-SVG icon set, used everywhere the app used to
 * show an emoji glyph. All icons inherit `currentColor` so they follow
 * their surrounding text/button color with no extra CSS per-icon.
 */
(function (global) {
  const ICONS = {
    basket: '<path d="M3 9h18l-1.6 9.6a2 2 0 0 1-2 1.7H6.6a2 2 0 0 1-2-1.7L3 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/><path d="M8 13v3M12 13v3M16 13v3"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
    chat: '<path d="M4 5h16v11H8l-4 4V5Z"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    map: '<path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4Z"/><path d="M9 4v13M15 7v13"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    // gradient-tile category icons — used only when no live photo is available
    tuber: '<path d="M7 13c-2 2-2 5 0 7s5 2 7 0l6-6c2-2 2-5 0-7s-5-2-7 0Z"/><path d="M9 9l-1-3M14 4l3 1"/>',
    leaf: '<path d="M4 20c8 0 16-8 16-16-8 0-16 8-16 16Z"/><path d="M4 20c3-6 7-10 13-13"/>',
    fruit: '<circle cx="12" cy="14" r="7"/><path d="M12 7c0-2 1.5-3.5 3.5-4"/>',
    dairy: '<path d="M9 3h6v4l2 4v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9l2-4V3Z"/>',
    grain: '<path d="M12 21V9"/><path d="M12 9c0-3-2-5-5-5 0 3 2 5 5 5Z"/><path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5Z"/><path d="M12 15c0-3-2-5-5-5 0 3 2 5 5 5Z"/><path d="M12 15c0-3 2-5 5-5 0 3-2 5-5 5Z"/>',
    market: '<path d="M3 9h18l-1.6 9.6a2 2 0 0 1-2 1.7H6.6a2 2 0 0 1-2-1.7L3 9Z"/><path d="M3 9l2-5h14l2 5"/>'
  };

  const CATEGORY_ICON = {
    'Tubers': 'tuber', 'Vegetables': 'leaf', 'Fruits': 'fruit',
    'Herbs': 'leaf', 'Dairy & Eggs': 'dairy', 'Grains & Legumes': 'grain'
  };

  function svg(name, opts) {
    opts = opts || {};
    const size = opts.size || 22;
    const cls = opts.className ? ' class="' + opts.className + '"' : '';
    const body = ICONS[name] || ICONS.leaf;
    return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  function iconForCategory(cat, opts) {
    opts = opts || {};
    return svg(CATEGORY_ICON[cat] || 'leaf', { size: opts.size || 34, className: opts.className !== undefined ? opts.className : 'tile-icon' });
  }

  global.FFIcons = { svg, iconForCategory };
})(window);
