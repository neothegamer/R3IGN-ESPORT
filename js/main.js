/* R3IGN ESPORTS — shared site behavior (no build step, no dependencies) */
(function () {
  "use strict";

  /* ---------- toast notifications ---------- */
  (function () {
    var activeToasts = [];
    var defaultDuration = 4000;

    function getContainer() {
      var container = document.querySelector(".toast-container");
      if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "false");
        document.body.appendChild(container);
      }
      return container;
    }

    function dismiss(toast, immediate) {
      if (!toast || toast.dismissed) return;
      toast.dismissed = true;
      if (toast.timer) clearTimeout(toast.timer);
      var remove = function () {
        if (toast.element.parentNode) toast.element.parentNode.removeChild(toast.element);
        activeToasts = activeToasts.filter(function (item) { return item !== toast; });
      };
      if (immediate) {
        remove();
        return;
      }
      toast.element.classList.add("is-dismissing");
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) remove();
      else toast.element.addEventListener("transitionend", remove, { once: true });
      setTimeout(remove, 350);
    }

    function startTimer(toast) {
      if (!toast.duration) return;
      toast.startedAt = Date.now();
      toast.timer = setTimeout(function () { dismiss(toast); }, toast.remaining);
    }

    window.R3IGNToast = {
      show: function (message, type, duration) {
        type = ["success", "error", "info", "warning"].indexOf(type) !== -1 ? type : "info";
        var container = getContainer();
        var toast = {
          duration: duration === undefined ? defaultDuration : duration,
          remaining: duration === undefined ? defaultDuration : duration,
          dismissed: false,
          timer: null
        };
        var element = document.createElement("div");
        element.className = "toast toast--" + type;
  /* Themed confirm dialog (replaces window.confirm) */
  window.R3IGNConfirm = function (message, options) {
    options = options || {};
    var title = options.title || "Confirm";
    var confirmLabel = options.confirmLabel || "OK";
    var cancelLabel = options.cancelLabel || "Cancel";
    var danger = options.danger !== false;

    return new Promise(function (resolve) {
      var existing = document.querySelector(".r3ign-confirm-overlay");
      if (existing) existing.remove();

      var overlay = document.createElement("div");
      overlay.className = "r3ign-confirm-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.innerHTML =
        '<div class="r3ign-confirm">' +
        '<h3 class="r3ign-confirm__title"></h3>' +
        '<p class="r3ign-confirm__message"></p>' +
        '<div class="r3ign-confirm__actions">' +
        '<button type="button" class="btn btn-ghost" data-confirm-cancel></button>' +
        '<button type="button" class="btn ' + (danger ? "btn-primary" : "btn-primary") + '" data-confirm-ok></button>' +
        "</div></div>";

      overlay.querySelector(".r3ign-confirm__title").textContent = title;
      overlay.querySelector(".r3ign-confirm__message").textContent = message;
      overlay.querySelector("[data-confirm-cancel]").textContent = cancelLabel;
      overlay.querySelector("[data-confirm-ok]").textContent = confirmLabel;

      function close(result) {
        overlay.classList.remove("is-open");
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
        document.removeEventListener("keydown", onKey);
        resolve(result);
      }

      function onKey(e) {
        if (e.key === "Escape") close(false);
        if (e.key === "Enter") close(true);
      }

      overlay.querySelector("[data-confirm-cancel]").addEventListener("click", function () { close(false); });
      overlay.querySelector("[data-confirm-ok]").addEventListener("click", function () { close(true); });
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close(false);
      });
      document.addEventListener("keydown", onKey);

      document.body.appendChild(overlay);
      requestAnimationFrame(function () {
        overlay.classList.add("is-open");
        overlay.querySelector("[data-confirm-ok]").focus();
      });
    });
  };


        element.setAttribute("role", type === "success" || type === "info" ? "status" : "alert");
        element.innerHTML =
          '<div class="toast__label">' + type + '</div>' +
          '<div class="toast__message"></div>' +
          '<button class="toast__close" type="button" aria-label="Dismiss notification">&times;</button>';
        element.querySelector(".toast__message").innerHTML = String(message);
        element.querySelector(".toast__close").addEventListener("click", function () { dismiss(toast); });
        element.addEventListener("mouseenter", function () {
          if (!toast.timer) return;
          clearTimeout(toast.timer);
          toast.timer = null;
          toast.remaining = Math.max(0, toast.remaining - (Date.now() - toast.startedAt));
        });
        element.addEventListener("mouseleave", function () {
          if (!toast.dismissed) startTimer(toast);
        });
        toast.element = element;
        activeToasts.unshift(toast);
        if (activeToasts.length > 5) dismiss(activeToasts[activeToasts.length - 1], true);
        container.insertBefore(element, container.firstChild);
        if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
          requestAnimationFrame(function () { element.classList.add("is-visible"); });
        } else {
          element.classList.add("is-visible");
        }
        startTimer(toast);
        return toast;
      },
      dismiss: dismiss
    };
  })();

  /* ---------- measured header height (keeps mobile menu background flush) ---------- */
  var headerEl = document.querySelector(".site-header");
  function syncHeaderHeight() {
    if (!headerEl) return;
    document.documentElement.style.setProperty("--header-h", headerEl.offsetHeight + "px");
  }
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);
  window.addEventListener("orientationchange", function () { setTimeout(syncHeaderHeight, 150); });
  if (window.ResizeObserver && headerEl) {
    new ResizeObserver(syncHeaderHeight).observe(headerEl);
  }

  /* ---------- scroll-reveal animation ---------- */
  (function () {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var autoTargets = document.querySelectorAll(
      ".dossier, .team-card, .market-card, .pillar, .value-row, .stat, .form-panel, " +
      ".section-head, .champion-card, .champ-card, .award-card, .social-card, .news-card, " +
      ".game-tile, .event-card, .highlight-card, .contact-card"
    );
    autoTargets.forEach(function (el) { el.classList.add("reveal"); });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      autoTargets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          entry.target.style.setProperty("--reveal-i", i % 6);
          entry.target.classList.add("reveal-stagger", "is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    autoTargets.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });
    links.querySelectorAll(":scope > li > a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
      });
    });
  }

  /* ---------- nav dropdown (Organizations > Player Market) ---------- */
  document.querySelectorAll(".has-dropdown").forEach(function (item) {
    var btn = item.querySelector(".dropdown-toggle");
    var menu = item.querySelector(".dropdown-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        btn.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        if (links) links.classList.remove("is-open");
      });
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".has-dropdown").forEach(function (item) {
      if (!item.contains(e.target)) {
        var btn = item.querySelector(".dropdown-toggle");
        var menu = item.querySelector(".dropdown-menu");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (menu) menu.classList.remove("is-open");
      }
    });
  });

  /* ---------- accordion (support / FAQ) ---------- */
  document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) {
        panel.style.maxHeight = expanded ? null : panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- filter chips (rankings / teams / news) ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var chips = group.querySelectorAll(".filter-chip");
    var targetSelector = group.getAttribute("data-filter-group");
    var emptyState = group.parentElement ? group.parentElement.querySelector(".empty-state") : null;
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        var value = chip.getAttribute("data-filter-value");
        var visibleCount = 0;
        document.querySelectorAll(targetSelector).forEach(function (item) {
          var tags = (item.getAttribute("data-tags") || "").split(",");
          var show = value === "all" || tags.indexOf(value) !== -1;
          item.style.display = show ? "" : "none";
          if (show) visibleCount++;
        });
        if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
      });
    });
  });

  /* ---------- generic client-side form validation ---------- */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var isEmpty = input.type === "checkbox" ? !input.checked : !input.value.trim();
        if (isEmpty) {
          valid = false;
          if (field) field.classList.add("has-error");
        } else if (field) {
          field.classList.remove("has-error");
        }
      });

      var emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value);
        var field = emailField.closest(".field");
        if (!okEmail) {
          valid = false;
          if (field) field.classList.add("has-error");
        }
      }

      if (!valid) {
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      var success = form.querySelector(".form-success") || document.getElementById(form.getAttribute("data-success-target") || "");
      form.reset();
      form.hidden = true;
      if (success) success.classList.add("is-visible");
    });
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- cookie / consent banner ---------- */
  var banner = document.getElementById("consent-banner");
  if (banner) {
    var stored = null;
    try { stored = localStorage.getItem("r3ign-consent"); } catch (e) { /* storage blocked */ }
    if (!stored) {
      setTimeout(function () { banner.classList.add("is-visible"); }, 400);
    }
    var decide = function (value) {
      try { localStorage.setItem("r3ign-consent", value); } catch (e) { /* storage blocked */ }
      banner.classList.remove("is-visible");
    };
    var acceptBtn = document.getElementById("consent-accept");
    var declineBtn = document.getElementById("consent-decline");
    if (acceptBtn) acceptBtn.addEventListener("click", function () { decide("accepted"); });
    if (declineBtn) declineBtn.addEventListener("click", function () { decide("declined"); });
  }
})();

/* ==========================================================================
   SITE-WIDE SEARCH
   ========================================================================== */
(function () {
  "use strict";

  var SEARCH_INDEX = [
    { title: "Home", url: "index.html", description: "R3IGN mobile esports competition, leagues, events, and community.", category: "Page" },
    { title: "Leagues", url: "leagues.html", description: "RCML, RFCL, and RBSL league formats, seasons, and competition.", category: "Page" },
    { title: "Rankings", url: "rankings.html", description: "Current team standings, divisions, wins, losses, and points.", category: "Page" },
    { title: "Events", url: "events.html", description: "Upcoming match nights, tournaments, and R3IGN league events.", category: "Page" },
    { title: "Organizations", url: "organizations.html", description: "Browse registered R3IGN esports organizations and teams.", category: "Page" },
    { title: "Player Market", url: "player-market.html", description: "Find free agents and list yourself for esports opportunities.", category: "Page" },
    { title: "Match Highlights", url: "match-highlights.html", description: "Watch match footage, highlights, and standout plays.", category: "Page" },
    { title: "News", url: "news.html", description: "R3IGN announcements, results, and community news.", category: "Page" },
    { title: "About R3IGN", url: "about.html", description: "Learn about R3IGN and structured mobile esports competition.", category: "Page" },
    { title: "Support", url: "support.html", description: "Frequently asked questions and contact support.", category: "Page" },
    { title: "Guide", url: "guide.html", description: "How to compete, register, manage teams, and use R3IGN.", category: "Page" },
    { title: "Divisions", url: "divisions.html", description: "The six-division ladder, promotion, and relegation system.", category: "Page" },
    { title: "Tournament Brackets", url: "brackets.html", description: "Live tournament bracket and match progression.", category: "Page" },
    { title: "Awards", url: "awards.html", description: "R3IGN awards and hall of champions.", category: "Page" },
    { title: "Media", url: "media.html", description: "R3IGN media, broadcasts, and community coverage.", category: "Page" },
    { title: "Merch", url: "merch.html", description: "Official R3IGN merchandise and store updates.", category: "Page" },
    { title: "Partnerships", url: "partnerships.html", description: "Sponsorship and partnership opportunities.", category: "Page" },
    { title: "Community", url: "community.html", description: "Join the R3IGN community and official channels.", category: "Page" },
    { title: "Messages", url: "messages.html", description: "Manage player market conversations and messages.", category: "Page" },
    { title: "Register Organization", url: "register.html", description: "Submit an organization registration for review.", category: "Page" },
    { title: "Sign In", url: "signin.html", description: "Sign in to manage your account and competition profile.", category: "Page" },
    { title: "Create Account", url: "signup.html", description: "Create a R3IGN account and verify your email.", category: "Page" },
    { title: "Account", url: "account.html", description: "Manage your profile, linked game accounts, and submissions.", category: "Page" },
    { title: "Profile Settings", url: "profile-settings.html", description: "Update your R3IGN profile and account details.", category: "Page" },
    { title: "Terms & Conditions", url: "terms.html", description: "Rules and conditions for using the R3IGN service.", category: "Page" },
    { title: "Privacy Policy", url: "privacy.html", description: "How R3IGN collects, uses, and protects information.", category: "Page" },
    { title: "Copyright Policy", url: "copyright.html", description: "Copyright reporting, takedowns, and intellectual property policy.", category: "Page" },
    { title: "R3IGN Organization", url: "org.html", description: "Organization profile and team information.", category: "Page" },
    { title: "Aether Esports", url: "rankings.html", description: "Competitive R3IGN organization competing in RCML.", category: "Team" },
    { title: "Siroxx", url: "rankings.html", description: "Competitive R3IGN organization and ranked team.", category: "Team" },
    { title: "Infinite", url: "rankings.html", description: "Competitive R3IGN organization and ranked team.", category: "Team" },
    { title: "Nova United", url: "rankings.html", description: "R3IGN ranked esports organization.", category: "Team" },
    { title: "Free Agent Player", url: "player-market.html", description: "Browse available players looking for a competitive team.", category: "Player" },
    { title: "RCML", url: "leagues.html", description: "R3IGN Call of Duty: Mobile League.", category: "League" },
    { title: "RFCL", url: "leagues.html", description: "R3IGN Free Fire Championship League.", category: "League" },
    { title: "RBSL", url: "leagues.html", description: "R3IGN Blood Strike League.", category: "League" },
    { title: "Season 4 is underway", url: "news.html", description: "RCML Season 4 competition and current league updates.", category: "News" },
    { title: "Registration updates", url: "news.html", description: "Latest registration and organization announcements.", category: "News" },
    { title: "Community spotlight", url: "news.html", description: "Stories from the R3IGN esports community.", category: "News" }
  ];
  window.R3IGNSearchIndex = SEARCH_INDEX;

  var overlay, modal, input, results, live, previousFocus, selectedIndex = -1;

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  function highlight(value, terms) {
    var safe = escapeHtml(value);
    terms.forEach(function (term) {
      if (!term) return;
      safe = safe.replace(new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), '<mark>$1</mark>');
    });
    return safe;
  }

  function render(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = !terms.length ? SEARCH_INDEX.slice(0, 8) : SEARCH_INDEX.filter(function (item) {
      var text = (item.title + " " + item.description).toLowerCase();
      return terms.some(function (term) { return text.indexOf(term) !== -1; });
    }).slice(0, 8);
    results.innerHTML = "";
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">No results found. Try searching for \'RCML\', \'Aether\', or \'rankings\'.</div>';
    } else {
      var lastCategory = "";
      matches.forEach(function (item, index) {
        if (item.category !== lastCategory) {
          var heading = document.createElement("div");
          heading.className = "search-category";
          heading.textContent = item.category;
          results.appendChild(heading);
          lastCategory = item.category;
        }
        var link = document.createElement("a");
        link.className = "search-result";
        link.href = item.url;
        link.setAttribute("data-search-index", String(index));
        link.innerHTML = '<span class="r-title">' + highlight(item.title, terms) + '</span>' +
          '<span class="r-meta">' + escapeHtml(item.description) + '</span>';
        results.appendChild(link);
      });
    }
    selectedIndex = -1;
    live.textContent = matches.length + (matches.length === 1 ? " result" : " results") + " found.";
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("search-is-open");
    if (previousFocus) previousFocus.focus();
  }

  function open() {
    if (!overlay) build();
    previousFocus = document.activeElement;
    overlay.classList.add("is-open");
    document.body.classList.add("search-is-open");
    input.value = "";
    render("");
    setTimeout(function () { input.focus(); }, 0);
  }

  function moveSelection(step) {
    var items = results.querySelectorAll(".search-result");
    if (!items.length) return;
    selectedIndex = (selectedIndex + step + items.length) % items.length;
    items.forEach(function (item, i) { item.classList.toggle("is-active", i === selectedIndex); });
    items[selectedIndex].scrollIntoView({ block: "nearest" });
  }

  function build() {
    var trigger = document.createElement("button");
    trigger.className = "search-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-label", "Search");
    trigger.title = "Search (Ctrl+K)";
    trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>';
    var cta = document.querySelector(".nav-cta");
    if (cta) cta.insertBefore(trigger, cta.firstChild);
    trigger.addEventListener("click", open);

    overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Site search");
    overlay.innerHTML = '<div class="search-modal">' +
      '<div class="search-input-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>' +
      '<input id="site-search-input" type="search" placeholder="Search teams, players, news, pages…" autocomplete="off" aria-label="Search teams, players, news, pages">' +
      '<button class="search-close" type="button" aria-label="Close search">&times;</button></div>' +
      '<div class="search-results" id="site-search-results"></div><span class="visually-hidden" id="site-search-live" aria-live="polite"></span></div>';
    document.body.appendChild(overlay);
    modal = overlay.querySelector(".search-modal");
    input = overlay.querySelector("#site-search-input");
    results = overlay.querySelector("#site-search-results");
    live = overlay.querySelector("#site-search-live");
    input.addEventListener("input", function () { render(input.value.trim()); });
    overlay.querySelector(".search-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveSelection(1); }
      if (e.key === "ArrowUp") { e.preventDefault(); moveSelection(-1); }
      if (e.key === "Enter") {
        var selected = results.querySelector(".search-result.is-active") || results.querySelector(".search-result");
        if (selected) window.location.href = selected.href;
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); return; }
    if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) { close(); return; }
    if (overlay && overlay.classList.contains("is-open") && e.key === "Tab") {
      var focusable = modal.querySelectorAll("input, button, a[href]");
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.R3IGNSearch = { open: open, close: close };
  document.addEventListener("DOMContentLoaded", build);
})();


/* ==========================================================================
   PAGE TRANSITIONS
   Intercepts internal link clicks for a smooth fade-out/fade-in experience.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // skip if user prefers reduced motion

  // Create overlay if it doesn't exist
  var overlay = document.querySelector(".page-transition-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  var isNavigating = false;

  function fadeOut(href) {
    if (isNavigating) return;
    isNavigating = true;
    overlay.classList.add("is-exit");
    setTimeout(function () {
      window.location.href = href;
    }, 250);
  }

  function fadeIn() {
    var main = document.querySelector("main");
    if (main) main.classList.add("is-entering");
    overlay.classList.add("is-active");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.remove("is-active");
        if (main) {
          setTimeout(function () {
            main.classList.remove("is-entering");
          }, 400);
        }
      });
    });
  }

  // Run entrance animation on every page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fadeIn);
  } else {
    fadeIn();
  }

  // Intercept clicks on internal links
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href) return;
    // Only intercept same-origin, non-hash, non-target links
    if (href.indexOf("#") === 0) return;
    if (a.getAttribute("target")) return;
    if (a.getAttribute("download")) return;
    if (href.indexOf(":") !== -1 && href.indexOf(window.location.protocol + "//" + window.location.host) !== 0) return;
    // Skip external links
    if (href.indexOf("http") === 0 && href.indexOf(window.location.origin) !== 0) return;
    e.preventDefault();
    fadeOut(href);
  });
})();

/* ==========================================================================
   IMAGE LAZY-LOAD FADE-IN
   Adds loaded class when lazy images finish loading.
   ========================================================================== */
(function () {
  "use strict";
  var lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach(function (img) {
    if (img.complete) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", function () {
        img.classList.add("is-loaded");
      });
      img.addEventListener("error", function () {
        img.classList.add("is-loaded"); // show even on error so alt text is visible
      });
    }
  });
})();

/* ==========================================================================
   SERVICE WORKER REGISTRATION
   Enables offline caching for static assets.
   ========================================================================== */
(function () {
  "use strict";
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        console.log("[R3IGN] Service Worker registered:", reg.scope);
      }).catch(function (err) {
        console.log("[R3IGN] Service Worker registration failed:", err);
      });
    });
  }
})();


/* ==========================================================================
   SCROLL-TO-TOP BUTTON
   ========================================================================== */
(function () {
  "use strict";
  var btn = document.createElement("button");
  btn.className = "scroll-top";
  btn.setAttribute("aria-label", "Scroll to top");
  btn.setAttribute("title", "Scroll to top");
  btn.innerHTML = "&#9650;";
  document.body.appendChild(btn);

  var visible = false;
  function toggle() {
    var shouldShow = window.scrollY > 600;
    if (shouldShow && !visible) {
      btn.classList.add("is-visible");
      visible = true;
    } else if (!shouldShow && visible) {
      btn.classList.remove("is-visible");
      visible = false;
    }
  }
  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
})();

/* ==========================================================================
   KEYBOARD SHORTCUTS
   / = open search    ? = open assistant    Esc = close assistant/modals
   ========================================================================== */
(function () {
  "use strict";
  document.addEventListener("keydown", function (e) {
    // Don't trigger when typing in inputs
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) return;

    if (e.key === "/" && !e.shiftKey) {
      e.preventDefault();
      if (window.R3IGNSearch) window.R3IGNSearch.open();
    }
    if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
      e.preventDefault();
      var assistantLauncher = document.getElementById("assistant-launcher");
      if (assistantLauncher) assistantLauncher.click();
    }
    if (e.key === "Escape") {
      // Close assistant
      var assistant = document.querySelector(".assistant");
      if (assistant && assistant.classList.contains("is-open")) {
        assistant.classList.remove("is-open");
        return;
      }
      // Close mobile nav
      var toggle = document.querySelector(".nav-toggle");
      var links = document.getElementById("nav-links");
      if (toggle && links && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.classList.remove("is-active");
      }
    }
  });
})();


/* ==========================================================================
   PAGE PROGRESS INDICATOR
   ========================================================================== */
(function () {
  "use strict";
  var bar = document.createElement("div");
  bar.className = "page-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  function update() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
