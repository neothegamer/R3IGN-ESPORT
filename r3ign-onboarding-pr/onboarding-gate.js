/* ==========================================================================
   R3IGN — ONBOARDING GATE
   On signup/signin success paths we send incomplete profiles to onboarding.
   On account.html we do NOT force-redirect (banner handles resume).
   ========================================================================== */
(function () {
  "use strict";

  function pathName() {
    try { return window.location.pathname || ""; } catch (e) { return ""; }
  }

  function shouldSkipGate() {
    if (/onboarding\.html/i.test(pathName())) return true;
    // Let account.html show the resume banner instead of bouncing away
    if (/account\.html/i.test(pathName())) return true;
    try {
      if (/[?&]skip_onboarding=1/.test(window.location.search)) return true;
    } catch (e) {}
    return false;
  }

  function redirectToOnboarding() {
    var base = window.location.pathname.replace(/[^/]+$/, "");
    window.location.replace(base + "onboarding.html");
  }

  function checkProfile(client, userId) {
    return client
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle()
      .then(function (res) {
        if (res.error) {
          console.warn("[R3IGN] onboarding gate:", res.error.message);
          return;
        }
        if (!res.data) return;
        if (res.data.onboarding_completed === true) return;
        redirectToOnboarding();
      })
      .catch(function (err) {
        console.warn("[R3IGN] onboarding gate failed:", err);
      });
  }

  function run() {
    if (shouldSkipGate()) return;
    if (!window.R3IGNAuth || !window.R3IGNAuth.client) return;

    var client = window.R3IGNAuth.client;

    client.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (!session || !session.user) return;
      checkProfile(client, session.user.id);
    });

    if (window.R3IGNAuth.onAuthStateChange) {
      window.R3IGNAuth.onAuthStateChange(function (event, session) {
        if (event === "SIGNED_IN" && session && session.user) {
          // Only auto-redirect from auth pages, not every page
          if (/signin\.html|signup\.html/i.test(pathName())) {
            checkProfile(client, session.user.id);
          }
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
