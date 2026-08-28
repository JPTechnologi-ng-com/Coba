// ============================================
// COBA ASSISTANT — floating widget
// Site-wide help bot: sessions persist in localStorage
// so "recent chats" carry across every page.
// ============================================

(function () {
  const STORAGE_KEY = 'coba_chat_sessions_v1';
  const ACTIVE_KEY = 'coba_chat_active_v1';

  let sessions = [];
  let activeId = null;

  /* ---------- Persistence ---------- */
  function loadSessions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      sessions = raw ? JSON.parse(raw) : [];
    } catch (e) {
      sessions = [];
    }
    activeId = localStorage.getItem(ACTIVE_KEY);
  }

  function saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    } catch (e) { /* storage unavailable — fail silently, chat still works this page load */ }
  }

  function getActiveSession() {
    return sessions.find(s => s.id === activeId) || null;
  }

  function createSession() {
    const session = {
      id: 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: 'New chat',
      updatedAt: Date.now(),
      messages: [
        {
          role: 'bot',
          text: "Hi, I'm the Coba Assistant \u2014 ask me about transfers, savings, cards, bills, or opening an account.",
          time: Date.now()
        }
      ]
    };
    sessions.unshift(session);
    activeId = session.id;
    saveSessions();
    return session;
  }

  /* ---------- Assistant brain (rule-based FAQ) ---------- */
  function getBotReply(rawText) {
    const t = rawText.toLowerCase();

    const rules = [
      { k: ['agent', 'human', 'representative', 'support team', 'talk to someone'],
        r: "I can loop in a human teammate. Our support team is available 24/7 \u2014 tap 'Contact us' in the footer, or reply here and I'll flag this chat for a callback." },
      { k: ['fee', 'charge', 'cost', 'free'],
        r: "Coba has no monthly account fees and no charges on transfers between Coba users. Transfers to other banks carry the standard regulatory fee only \u2014 no markup from us." },
      { k: ['transfer', 'send money', 'how long', 'speed'],
        r: "Transfers to any Nigerian bank land in under 10 seconds, day or night \u2014 including weekends. Just add a recipient's account number in the app and confirm." },
      { k: ['saving', 'vault', 'interest', 'invest'],
        r: "The Savings Vault pays interest daily instead of once a year. Lock any amount for a fixed period, or keep it flexible and withdraw anytime \u2014 your choice." },
      { k: ['card', 'lost', 'stolen', 'freeze', 'block'],
        r: "Sorry to hear that. Open the app, go to Card > Freeze card, and it's instantly disabled. You can request a replacement from the same screen, no branch visit needed." },
      { k: ['bill', 'airtime', 'data', 'electricity', 'tv', 'subscription'],
        r: "You can pay airtime, data, electricity and TV subscriptions right from the app, settled instantly with no extra charges." },
      { k: ['safe', 'secure', 'security', 'insured', 'insurance', 'trust'],
        r: "Coba is a licensed digital bank. Your funds are insured up to the regulatory limit, and every login is protected with biometric checks and real-time fraud alerts." },
      { k: ['open account', 'sign up', 'signup', 'register', 'create account', 'get started'],
        r: "Opening an account takes about 3 minutes \u2014 no paperwork or branch visit. Tap 'Open a free account', add your details, verify your ID with a selfie, and you're in." },
      { k: ['login', 'log in', 'sign in', 'password', 'forgot'],
        r: "Having trouble logging in? Use 'Forgot password?' on the login page to reset it by email or SMS. If you're locked out entirely, ask me to connect you with an agent." },
      { k: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
        r: "Hey there! What can I help you with today \u2014 transfers, savings, cards, or opening an account?" },
      { k: ['thank', 'thanks', 'appreciate'],
        r: "Anytime! Let me know if anything else comes up." }
    ];

    for (const rule of rules) {
      if (rule.k.some(keyword => t.includes(keyword))) return rule.r;
    }

    return "I didn't quite catch that. Try asking about transfers, savings, cards, bill payments, security, or opening an account \u2014 or say \"agent\" to reach a human.";
  }

  /* ---------- DOM refs (set on init) ---------- */
  let els = {};

  function fmtTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function fmtRelative(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  /* ---------- Rendering ---------- */
  function renderSessionList() {
    els.sessionList.innerHTML = '';
    if (sessions.length === 0) {
      els.sessionList.innerHTML = '<div class="chat-session-empty">No chats yet \u2014 start one below.</div>';
      return;
    }
    sessions
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .forEach(session => {
        const btn = document.createElement('button');
        btn.className = 'chat-session-item' + (session.id === activeId ? ' active' : '');
        btn.innerHTML =
          '<span class="chat-session-title"></span>' +
          '<span class="chat-session-time"></span>';
        btn.querySelector('.chat-session-title').textContent = session.title;
        btn.querySelector('.chat-session-time').textContent = fmtRelative(session.updatedAt);
        btn.addEventListener('click', () => {
          activeId = session.id;
          saveSessions();
          renderSessionList();
          renderMessages();
          closeSidebar();
        });
        els.sessionList.appendChild(btn);
      });
  }

  function renderMessages() {
    const session = getActiveSession();
    els.messages.innerHTML = '';
    if (!session) return;
    session.messages.forEach(m => {
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.alignItems = m.role === 'user' ? 'flex-end' : 'flex-start';

      const bubble = document.createElement('div');
      bubble.className = 'msg ' + (m.role === 'user' ? 'user' : 'bot');
      bubble.textContent = m.text;

      const time = document.createElement('span');
      time.className = 'msg-time';
      time.textContent = fmtTime(m.time);

      wrap.appendChild(bubble);
      wrap.appendChild(time);
      els.messages.appendChild(wrap);
    });
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'typing-indicator';
    t.id = 'typingIndicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    els.messages.appendChild(t);
    els.messages.scrollTop = els.messages.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  /* ---------- Actions ---------- */
  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    let session = getActiveSession();
    if (!session) session = createSession();

    session.messages.push({ role: 'user', text: trimmed, time: Date.now() });
    if (session.title === 'New chat') {
      session.title = trimmed.length > 34 ? trimmed.slice(0, 34) + '\u2026' : trimmed;
    }
    session.updatedAt = Date.now();
    saveSessions();
    renderMessages();
    renderSessionList();

    els.suggestions.style.display = 'none';
    showTyping();

    setTimeout(() => {
      hideTyping();
      const reply = getBotReply(trimmed);
      session.messages.push({ role: 'bot', text: reply, time: Date.now() });
      session.updatedAt = Date.now();
      saveSessions();
      renderMessages();
      renderSessionList();
    }, 650 + Math.random() * 500);
  }

  function openSidebar() {
    els.sidebar.classList.add('is-open');
    els.sidebarOverlay.classList.add('is-open');
  }
  function closeSidebar() {
    els.sidebar.classList.remove('is-open');
    els.sidebarOverlay.classList.remove('is-open');
  }

  function openPanel() {
    els.panel.classList.add('is-open');
    els.bubble.classList.add('is-open');
    els.panel.setAttribute('aria-hidden', 'false');
    els.badge.classList.add('hidden');
    els.input.focus();
  }
  function closePanel() {
    els.panel.classList.remove('is-open');
    els.bubble.classList.remove('is-open');
    els.panel.setAttribute('aria-hidden', 'true');
    closeSidebar();
  }

  /* ---------- Init ---------- */
  function init() {
    els = {
      bubble: document.getElementById('chatBubble'),
      badge: document.getElementById('chatBadge'),
      panel: document.getElementById('chatPanel'),
      sidebar: document.getElementById('chatSidebar'),
      sidebarOverlay: document.getElementById('sidebarOverlay'),
      sessionList: document.getElementById('chatSessionList'),
      messages: document.getElementById('chatMessages'),
      suggestions: document.getElementById('chatSuggestions'),
      form: document.getElementById('chatForm'),
      input: document.getElementById('chatInput'),
      newChatBtn: document.getElementById('newChatBtn'),
      historyBtn: document.getElementById('historyBtn'),
      closeSidebarBtn: document.getElementById('closeSidebarBtn'),
      closeChatBtn: document.getElementById('closeChatBtn')
    };
    if (!els.bubble) return; // widget markup not present on this page

    loadSessions();
    if (!getActiveSession()) {
      if (sessions.length > 0) {
        activeId = sessions.sort((a, b) => b.updatedAt - a.updatedAt)[0].id;
      } else {
        createSession();
      }
    }
    renderSessionList();
    renderMessages();

    els.bubble.addEventListener('click', () => {
      const isOpen = els.panel.classList.contains('is-open');
      if (isOpen) closePanel(); else openPanel();
    });
    els.closeChatBtn.addEventListener('click', closePanel);
    els.historyBtn.addEventListener('click', () => {
      renderSessionList();
      openSidebar();
    });
    els.closeSidebarBtn.addEventListener('click', closeSidebar);
    els.sidebarOverlay.addEventListener('click', closeSidebar);

    els.newChatBtn.addEventListener('click', () => {
      createSession();
      saveSessions();
      renderSessionList();
      renderMessages();
      els.suggestions.style.display = 'flex';
      closeSidebar();
      els.input.focus();
    });

    els.form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(els.input.value);
      els.input.value = '';
    });

    els.suggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => sendMessage(chip.textContent));
    });

    // hide suggestion chips if the active session already has a conversation going
    const session = getActiveSession();
    if (session && session.messages.length > 1) {
      els.suggestions.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
