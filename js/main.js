/* R3IGN ESPORTS — shared site behavior (no build step, no dependencies) */
(function () {
  "use strict";

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
   / = open assistant    Esc = close assistant/modals
   ========================================================================== */
(function () {
  "use strict";
  document.addEventListener("keydown", function (e) {
    // Don't trigger when typing in inputs
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) return;

    if (e.key === "/") {
      e.preventDefault();
      var assistantInput = document.getElementById("assistant-input");
      if (assistantInput) {
        assistantInput.focus();
        // Also open assistant if it's closed
        var assistant = document.querySelector(".assistant");
        if (assistant && !assistant.classList.contains("is-open")) {
          assistant.classList.add("is-open");
        }
      }
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

