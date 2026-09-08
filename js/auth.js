/* ==========================================================================
   R3IGN — AUTH (Supabase)
   Handles: email/password sign up + sign in, Discord OAuth, TikTok OAuth,
   session persistence, sign out, and updating the "Sign In" nav button
   into an account menu once a user is logged in.

   Requires js/supabase-config.js to be loaded first with real project
   credentials. If it's still using the placeholder values, auth features
   degrade gracefully with a clear message instead of throwing errors.
   ========================================================================== */

(function () {
  "use strict";

  var configured =
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    window.SUPABASE_URL.indexOf("YOUR_SUPABASE") === -1 &&
    window.SUPABASE_ANON_KEY.indexOf("YOUR_SUPABASE") === -1;

  var client = null;
  if (configured && window.supabase) {
    client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  // Exposed globally so signin.html / signup.html / account.html can use it.
  window.R3IGNAuth = {
    isConfigured: function () { return !!client; },
    client: client,

    signUpWithEmail: function (email, password, displayName) {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.signUp({
        email: email,
        password: password,
        options: { data: { display_name: displayName || "" } }
      });
    },

    // Verifies the 6-digit code sent to the user's email after signUpWithEmail().
    // On success this returns an authenticated session, same as signing in.
    verifySignupCode: function (email, code) {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.verifyOtp({ email: email, token: code, type: "email" });
    },

    // Asks Supabase to send a fresh 6-digit code to the same address (e.g. if
    // the first one expired or never arrived).
    resendSignupCode: function (email) {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.resend({ type: "signup", email: email });
    },

    signInWithEmail: function (email, password) {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.signInWithPassword({ email: email, password: password });
    },

    signInWithDiscord: function () {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + "account.html" }
      });
    },

    signInWithTikTok: function () {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      // TikTok isn't one of Supabase's built-in OAuth providers, so this uses
      // Supabase's "Custom OAuth/OIDC Providers" feature instead — the
      // provider must be registered in the Supabase dashboard first with the
      // identifier below. See README for the exact setup steps.
      return client.auth.signInWithOAuth({
        provider: "custom:tiktok",
        options: { redirectTo: window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + "account.html" }
      });
    },

    signOut: function () {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.signOut();
    },

    getSession: function () {
      if (!client) return Promise.resolve({ data: { session: null } });
      return client.auth.getSession();
    }
  };

  // ---------- keep the header's Sign In button in sync with session state ----------
  function renderNavAccount(session) {
    var slot = document.getElementById("nav-account");
    if (!slot) return;

    if (!configured) {
      slot.innerHTML = '<a href="signin.html" class="btn">Sign In</a>';
      return;
    }

    if (session && session.user) {
      var name = (session.user.user_metadata && (session.user.user_metadata.display_name || session.user.user_metadata.full_name)) || session.user.email;
      var onMessages = /messages\.html/i.test(window.location.pathname);
      slot.innerHTML =
        '<a href="messages.html" class="btn btn-ghost"' + (onMessages ? ' aria-current="page"' : '') + '>Messages</a>' +
        '<a href="account.html" class="btn btn-ghost">' + name.split("@")[0] + '</a>';
      refreshUnreadBadge(session.user.id);
    } else {
      slot.innerHTML = '<a href="signin.html" class="btn">Sign In</a>';
    }

    // the mobile off-canvas menu has its own static "Sign In" row (it isn't
    // inside #nav-account, since #nav-account is hidden below 1100px) — keep
    // it in sync too, or signed-in mobile users have no way to reach
    // Messages / their account from the hamburger menu.
    var mobileSlot = document.querySelector(".nav-links-signin");
    if (mobileSlot) {
      if (session && session.user) {
        var mName = (session.user.user_metadata && (session.user.user_metadata.display_name || session.user.user_metadata.full_name)) || session.user.email;
        mobileSlot.innerHTML =
          '<a href="messages.html">Messages</a>' +
          '<a href="account.html" style="margin-top:0.6rem">' + mName.split("@")[0] + '</a>';
      } else {
        mobileSlot.innerHTML = '<a href="signin.html">Sign In</a>';
      }
    }
  }

  // Lightweight unread-DM indicator on the nav "Messages" link. Best-effort:
  // if this query fails for any reason (e.g. RLS not applied yet), it just
  // silently skips the badge rather than breaking the rest of the nav.
  function refreshUnreadBadge(userId) {
    if (!client) return;
    try {
      client.from("messages").select("id", { count: "exact", head: true })
        .eq("recipient_id", userId).is("read_at", null)
        .then(function (res) {
          var link = document.querySelector('#nav-account a[href="messages.html"]');
          if (!link || res.error) return;
          var existing = link.querySelector(".nav-badge-dot");
          if (res.count && res.count > 0) {
            if (!existing) {
              var dot = document.createElement("span");
              dot.className = "nav-badge-dot";
              dot.setAttribute("aria-label", res.count + " unread messages");
              link.appendChild(dot);
            }
          } else if (existing) {
            existing.remove();
          }
        })
        .catch(function () { /* best-effort — badge just stays as-is */ });
    } catch (e) { /* best-effort — badge just stays as-is */ }
  }

  if (client) {
    client.auth.getSession().then(function (res) {
      renderNavAccount(res.data.session);
    });
    client.auth.onAuthStateChange(function (_event, session) {
      renderNavAccount(session);
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () { renderNavAccount(null); });
  }
})();
