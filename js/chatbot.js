/**
 * chatbot.js — Basket Buddy: pre-scripted, rule-based FAQ chatbot.
 * No live AI — matches user text against data/chatbot.json keywords.
 *
 * Matching uses WHOLE-WORD comparison (not substring/.includes()), so a
 * keyword like "map" never matches inside "market". Multi-word keywords
 * (e.g. "open now") are matched as a phrase within the message.
 */
(function () {
  let config = null;
  let panelOpen = false;
  let firstOpenDone = false;

  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const log = document.getElementById('chatLog');
  const quick = document.getElementById('chatQuick');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const hint = document.getElementById('chatHint');

  function tokenize(text) {
    return text.toLowerCase().match(/[a-z0-9]+/g) || [];
  }

  /** Whole-word / whole-phrase match: keyword must appear as its own word(s). */
  function keywordMatches(keyword, messageTokens, messageLower) {
    if (keyword.includes(' ')) {
      // phrase keyword: check as a substring but bounded by word edges
      const re = new RegExp('(^|\\W)' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\W|$)');
      return re.test(messageLower);
    }
    return messageTokens.includes(keyword);
  }

  function findAnswer(message) {
    const tokens = tokenize(message);
    const lower = message.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const entry of config.faq) {
      let score = 0;
      for (const kw of entry.k) {
        if (keywordMatches(kw.toLowerCase(), tokens, lower)) score++;
      }
      if (score > bestScore) { bestScore = score; best = entry; }
    }
    return best ? best : null;
  }

  function scrollLog() { log.scrollTop = log.scrollHeight; }

  function addMessage(text, who, link) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + who;
    div.textContent = text;
    if (link) {
      div.appendChild(document.createTextNode(' '));
      const a = document.createElement('a');
      a.href = link;
      a.textContent = 'Take me there →';
      a.addEventListener('click', () => panelOpen && closePanel());
      div.appendChild(a);
    }
    log.appendChild(div);
    scrollLog();
  }

  function showTyping() {
    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.id = 'typingDots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(dots);
    scrollLog();
  }
  function hideTyping() {
    const d = document.getElementById('typingDots');
    if (d) d.remove();
  }

  function respond(message) {
    addMessage(message, 'user');
    showTyping();
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
    setTimeout(() => {
      hideTyping();
      const match = findAnswer(message);
      if (match) addMessage(match.a, 'bot', match.link || null);
      else addMessage(config.fallback, 'bot');
    }, delay);
  }

  function renderQuickChips() {
    quick.innerHTML = '';
    config.quick.forEach(q => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = q;
      chip.addEventListener('click', () => respond(q));
      quick.appendChild(chip);
    });
  }

  function trapFocus(e) {
    if (!panelOpen) return;
    if (e.key === 'Escape') { closePanel(); fab.focus(); return; }
    if (e.key !== 'Tab') return;
    const focusables = panel.querySelectorAll('button, input, a[href]');
    const list = Array.from(focusables);
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openPanel() {
    panelOpen = true;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    hint.hidden = true;
    sessionStorage.setItem('ff_chat_open', '1');
    document.addEventListener('keydown', trapFocus);
    if (!firstOpenDone) {
      firstOpenDone = true;
      addMessage(config.greeting, 'bot');
      renderQuickChips();
    }
    setTimeout(() => input.focus(), 210);
  }

  function closePanel() {
    panelOpen = false;
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    sessionStorage.setItem('ff_chat_open', '0');
    document.removeEventListener('keydown', trapFocus);
  }

  async function init() {
    config = await FFData.getChatbotConfig();

    fab.addEventListener('click', () => (panelOpen ? closePanel() : openPanel()));
    closeBtn.addEventListener('click', () => { closePanel(); fab.focus(); });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      respond(text);
    });

    // first-visit nudge bubble: 4s after load, hides after 6s
    if (!sessionStorage.getItem('ff_chat_seen')) {
      sessionStorage.setItem('ff_chat_seen', '1');
      setTimeout(() => {
        if (panelOpen) return;
        hint.hidden = false;
        setTimeout(() => { hint.hidden = true; }, 6000);
      }, 4000);
    }

    // remember open/closed for this session
    if (sessionStorage.getItem('ff_chat_open') === '1') openPanel();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
