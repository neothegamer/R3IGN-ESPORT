/* ==========================================================================
   R3IGN OPS BOT — SITE ASSISTANT
   A lightweight, rule-based FAQ assistant that lives entirely in the
   browser. It answers common questions about leagues, rankings,
   registration and player market by matching keywords against a small
   knowledge base, then falls back to pointing people at Support.

   Intentionally has NO external API call and NO key of any kind — nothing
   to configure, nothing to leak. If you later want it backed by a real
   language model, wire fetchBotReply() below to your own server-side
   proxy endpoint (never call a paid API directly from this file, and
   never hardcode a key here).
   ========================================================================== */
(function () {
  "use strict";

  var IS_ADMIN_PAGE = /admin\.html/i.test(window.location.pathname);
  var ADMIN_LOOKUP_TEST = /^r3e\d+$|look\s?up|find (a )?player|verification status|review (this|the) player/i;

  var KB = [
    {
      test: /register|sign\s?up.*(org|team)|create.*(org|team)|join.*league/i,
      reply: 'To register your organization, head to <a href="register.html">Register Organization</a>. You’ll need a team/org name, your primary game, and a captain contact. It only takes a couple of minutes.'
    },
    {
      test: /rank|standing|leaderboard/i,
      reply: 'Live standings for every league and division are on the <a href="rankings.html">Rankings</a> page — filter by league, division, or region.'
    },
    {
      test: /rcml|call of duty/i,
      reply: 'RCML is our Call of Duty: Mobile league. See current standings and schedule on <a href="leagues.html">Leagues</a>.'
    },
    {
      test: /rfcl|free fire/i,
      reply: 'RFCL is our Free Fire league — registration opens soon. Details are on the <a href="leagues.html">Leagues</a> page.'
    },
    {
      test: /rbsl|blood strike/i,
      reply: 'RBSL is our Blood Strike league — registration opens soon. Details are on the <a href="leagues.html">Leagues</a> page.'
    },
    {
      test: /division|promotion|relegation|ladder/i,
      reply: 'R3IGN runs a six-division ladder with promotion and relegation, from Entry all the way to the Pro League. Full breakdown on <a href="divisions.html">Divisions</a>.'
    },
    {
      test: /player market|free agent|list myself|looking for (a )?team/i,
      reply: 'Free agents can list themselves on the <a href="player-market.html">Player Market</a> — orgs browse it to scout for open roster spots.'
    },
    {
      test: /event|schedule|calendar|upcoming/i,
      reply: 'All upcoming match nights and events are on the <a href="events.html">Events</a> page.'
    },
    {
      test: /organi[sz]ation|team list|who plays/i,
      reply: 'Browse every registered organization on the <a href="organizations.html">Organizations</a> page.'
    },
    {
      test: /sign\s?in|log\s?in|account|password/i,
      reply: 'You can sign in or create an account from the button in the top navigation, or go straight to <a href="signin.html">Sign In</a> / <a href="signup.html">Create Account</a>. Trouble signing in? Our <a href="support.html">Support</a> page has answers too.'
    },
    {
      test: /sponsor|partner|advertis/i,
      reply: 'Sponsorship and partnership info is on the <a href="partnerships.html">Partnerships</a> page — reach out from there and our team will follow up.'
    },
    {
      test: /merch|shop|store|buy/i,
      reply: 'The merch store is coming soon — check <a href="merch.html">Merch</a> for updates.'
    },
    {
      test: /contact|help|support|human|talk to (a )?person/i,
      reply: 'For anything I can’t answer, visit <a href="support.html">Support &amp; FAQ</a> or reach the team on <a href="https://discord.gg/85qGDxyCdp" target="_blank" rel="noopener">Discord</a>.'
    },
    {
      test: /search/i,
      reply: 'Press Cmd+K (or Ctrl+K) or click the search icon to search the site.'
    },
    {
      test: /what is r3ign|about|who (are|is) r3ign/i,
      reply: 'R3IGN runs structured mobile esports competition — leagues, divisions, and daily competition. More on <a href="about.html">About R3IGN</a>.'
    },
    {
      test: /hi|hello|hey|sup|yo\b/i,
      reply: 'Hey! I’m the R3IGN Ops Bot. Ask me about leagues, rankings, registration, or the player market — or tap a quick option below.'
    },
    {
      test: /thank/i,
      reply: 'Anytime. GLHF out there. 🎮'
    }
  ];

  var FALLBACK = 'I don’t have a direct answer for that yet. Try asking about leagues, rankings, registration, or the player market — or visit <a href="support.html">Support &amp; FAQ</a> for everything else.';

  var QUICK_REPLIES = [
    { label: "Register a team", q: "How do I register my organization?" },
    { label: "Divisions", q: "How do divisions and promotion work?" },
    { label: "Rankings", q: "Where can I see rankings?" },
    { label: "Player market", q: "How does the player market work?" }
  ];

  var ADMIN_QUICK_REPLIES = [
    { label: "Look up a player", q: "Look up a player" },
    { label: "Upcoming events", q: "What events are coming up?" },
    { label: "Rankings", q: "Where can I see rankings?" }
  ];

  // Admin-only: extracts an R3E ID / email / name from the message and runs
  // the same lookup wired into admin.html's Player Review Assistant panel,
  // so admins can review a player and pull their R3E ID from chat instead of
  // scrolling to the panel. Falls back to the normal FAQ bot for everything
  // else, even on the admin page.
  function tryAdminLookup(text) {
    if (!IS_ADMIN_PAGE || !window.R3IGNAdminPlayerLookup) return null;
    if (!ADMIN_LOOKUP_TEST.test(text)) return null;
    var idMatch = text.match(/r3e\d+/i);
    if (!idMatch && /look\s?up|find (a )?player|verification status|review (this|the) player/i.test(text)) {
      return "Please input the user ID.";
    }
    var term = idMatch ? idMatch[0] : text.replace(ADMIN_LOOKUP_TEST, "").trim();
    if (!term) return "Please input the user ID.";
    window.R3IGNAdminPlayerLookup(term);
    return 'Checking the Player Review Assistant panel below for <strong>' + escapeHtml(term) + '</strong> \u2014 results are loading there now.';
  }

  function matchReply(text) {
    for (var i = 0; i < KB.length; i++) {
      if (KB[i].test.test(text)) return KB[i].reply;
    }
    return FALLBACK;
  }

  // Placeholder for a future real-model backend. Deliberately unused unless
  // you set window.R3IGN_ASSISTANT_ENDPOINT to your own server-side proxy —
  // this file never talks to a third-party API directly and never stores a key.
  function fetchBotReply(text) {
    if (window.R3IGN_ASSISTANT_ENDPOINT) {
      return fetch(window.R3IGN_ASSISTANT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      }).then(function (r) { return r.json(); })
        .then(function (data) { return data.reply || matchReply(text); })
        .catch(function () { return matchReply(text); });
    }
    return Promise.resolve(matchReply(text));
  }

  var panel, body, launcher, formEl, inputEl;

  function buildWidget() {
    launcher = document.createElement("button");
    launcher.className = "assistant-launcher";
    launcher.id = "assistant-launcher";
    launcher.setAttribute("aria-label", "Open site assistant");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' +
      '<span class="ping" aria-hidden="true"></span>';

    panel = document.createElement("div");
    panel.className = "assistant-panel";
    panel.id = "assistant-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "R3IGN Ops Bot site assistant");
    panel.innerHTML =
      '<div class="assistant-head">' +
      '  <div><h4>R3IGN Ops Bot</h4><p>Site Assistant · Online</p></div>' +
      '  <button class="assistant-close" id="assistant-close" aria-label="Close assistant">&#10005;</button>' +
      '</div>' +
      '<div class="assistant-body" id="assistant-body"></div>' +
      '<div class="assistant-quick" id="assistant-quick"></div>' +
      '<form class="assistant-form" id="assistant-form">' +
      '  <input type="text" id="assistant-input" placeholder="Ask about leagues, rankings…" autocomplete="off" aria-label="Message the site assistant">' +
      '  <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>' +
      '</form>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    body = panel.querySelector("#assistant-body");
    formEl = panel.querySelector("#assistant-form");
    inputEl = panel.querySelector("#assistant-input");

    renderQuickReplies();
    addMessage("bot", IS_ADMIN_PAGE
      ? "Hey, I\u2019m the R3IGN Ops Bot \u2014 in admin mode I can also look up a player\u2019s R3E ID and verification status. Try \u201cLook up R3E482910\u201d."
      : "Hey, I\u2019m the R3IGN Ops Bot. Ask me about leagues, rankings, registration, or the player market.");

    launcher.addEventListener("click", togglePanel);
    panel.querySelector("#assistant-close").addEventListener("click", closePanel);
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = "";
      handleUserMessage(text);
    });
  }

  function renderQuickReplies() {
    var wrap = panel.querySelector("#assistant-quick");
    wrap.innerHTML = "";
    var list = IS_ADMIN_PAGE ? ADMIN_QUICK_REPLIES : QUICK_REPLIES;
    list.forEach(function (qr) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "assistant-chip";
      chip.textContent = qr.label;
      chip.addEventListener("click", function () { handleUserMessage(qr.q); });
      wrap.appendChild(chip);
    });
  }

  function addMessage(who, html) {
    var msg = document.createElement("div");
    msg.className = "assistant-msg " + who;
    msg.innerHTML = html;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    return msg;
  }

  function handleUserMessage(text) {
    if (/search/i.test(text) && window.R3IGNSearch) {
      window.R3IGNSearch.open();
      return;
    }
    addMessage("user", escapeHtml(text));
    var typing = document.createElement("div");
    typing.className = "assistant-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    var adminReply = tryAdminLookup(text);
    if (adminReply) {
      setTimeout(function () {
        typing.remove();
        addMessage("bot", adminReply);
      }, 350);
      return;
    }

    fetchBotReply(text).then(function (reply) {
      setTimeout(function () {
        typing.remove();
        addMessage("bot", reply);
      }, 400 + Math.random() * 300);
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function togglePanel() {
    if (!panel) buildWidget();
    var open = panel.classList.toggle("is-open");
    launcher.setAttribute("aria-expanded", String(open));
    if (open) setTimeout(function () { inputEl.focus(); }, 200);
  }

  function closePanel() {
    if (!panel) return;
    panel.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
  }

  document.addEventListener("DOMContentLoaded", buildWidget);
})();
