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

  var anonKey = window.SUPABASE_ANON_KEY || window.SUPABASE_PUBLISHABLE_KEY || "";
  var configured =
    window.SUPABASE_URL &&
    anonKey &&
    window.SUPABASE_URL.indexOf("YOUR_SUPABASE") === -1 &&
    anonKey.indexOf("YOUR_SUPABASE") === -1;

  var client = null;
  if (configured && window.supabase) {
    client = window.supabase.createClient(window.SUPABASE_URL, anonKey);
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

    sendPasswordReset: function (email) {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + "signin.html"
      });
    },

    updatePassword: function (password) {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.updateUser({ password: password });
    },

    onAuthStateChange: function (callback) {
      if (!client) return { data: { subscription: { unsubscribe: function () {} } } };
      return client.auth.onAuthStateChange(callback);
    },

    signInWithDiscord: function () {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + "account.html" }
      }).then(function (res) {
        if (res.error) return Promise.reject(res.error);
        return res;
      });
    },

   signInWithTikTok: function () {
  window.location.href = "https://nyditfrfzarntmekcyli.supabase.co/functions/v1/tiktok-login-start";
},

    linkWithDiscord: function () {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.linkIdentity({
        provider: "discord",
        options: { redirectTo: window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + "profile-settings.html" }
      });
    },

    linkWithTikTok: function () {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.linkIdentity({
        provider: "custom:tiktok",
        options: { redirectTo: window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + "profile-settings.html" }
      });
    },

    addEmailPassword: function (email, password) {
      if (!client) return Promise.reject(new Error("NOT_CONFIGURED"));
      return client.auth.updateUser({ email: email, password: password });
    },

    getUser: function () {
      if (!client) return Promise.resolve({ data: { user: null } });
      return client.auth.getUser();
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
        '<a href="account.html" class="nav-profile-link" aria-label="Open my account"><span class="nav-profile-avatar">' + name.charAt(0).toUpperCase() + '</span></a>' +
        '<a href="messages.html" class="nav-icon-link nav-message-link" aria-label="Open messages"' + (onMessages ? ' aria-current="page"' : '') + '><span class="nav-message-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"></path></svg></span></a>' +
        '<a href="profile-settings.html" class="nav-icon-link nav-settings-link" aria-label="Open profile settings"><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 3.5l1 1.9 2.1.5 1.8-1 1.4 1.4-1 1.8.5 2.1 1.9 1v2l-1.9 1-.5 2.1 1 1.8-1.4 1.4-1.8-1-2.1.5-1 1.9h-2l-1-1.9-2.1-.5-1.8 1-1.4-1.4 1-1.8-.5-2.1-1.9-1v-2l1.9-1 .5-2.1-1-1.8 1.4-1.4 1.8 1 2.1-.5 1-1.9h2zM14.8 12a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0z"></path></svg></span></a>';
      refreshUnreadBadge(session.user.id);
      loadNavAvatar(session.user.id, slot.querySelector(".nav-profile-avatar"));
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
        var mobileName = (session.user.user_metadata && (session.user.user_metadata.display_name || session.user.user_metadata.full_name)) || session.user.email;
        mobileSlot.innerHTML =
          '<span class="mobile-account-icons"><a href="account.html" class="nav-profile-link" aria-label="Open my account"><span class="nav-profile-avatar">' + mobileName.charAt(0).toUpperCase() + '</span></a>' +
          '<a href="messages.html" class="nav-icon-link nav-message-link" aria-label="Open messages"><span class="nav-message-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"></path></svg></span></a>' +
          '<a href="profile-settings.html" class="nav-icon-link nav-settings-link" aria-label="Open profile settings"><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 3.5l1 1.9 2.1.5 1.8-1 1.4 1.4-1 1.8.5 2.1 1.9 1v2l-1.9 1-.5 2.1 1 1.8-1.4 1.4-1.8-1-2.1.5-1 1.9h-2l-1-1.9-2.1-.5-1.8 1-1.4-1.4 1-1.8-.5-2.1-1.9-1v-2l1.9-1 .5-2.1-1-1.8 1.4-1.4 1.8 1 2.1-.5 1-1.9h2zM14.8 12a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0z"></path></svg></span></a></span>';
        loadNavAvatar(session.user.id, mobileSlot.querySelector(".nav-profile-avatar"));
      } else {
        mobileSlot.innerHTML = '<a href="signin.html">Sign In</a>';
      }
    }
  }

  function loadNavAvatar(userId, avatarEl) {
    if (!client || !avatarEl) return;
    client.from("profiles").select("avatar_url").eq("id", userId).maybeSingle().then(function (res) {
      if (res.error || !res.data || !res.data.avatar_url) return;
      avatarEl.textContent = "";
      avatarEl.style.backgroundImage = "url('" + res.data.avatar_url + "')";
    }).catch(function () {});
  }

  document.addEventListener("r3ign:avatar-updated", function (event) {
    var avatarUrl = event.detail && event.detail.url;
    if (!avatarUrl) return;
    document.querySelectorAll(".nav-profile-avatar").forEach(function (avatar) {
      avatar.textContent = "";
      avatar.style.backgroundImage = "url('" + avatarUrl + "')";
    });
  });

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
