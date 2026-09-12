/* ==========================================================================
   R3IGN — PLAYER PROFILE ONBOARDING
   Modular vanilla JS: state, form generation, validation, Supabase persistence.
   Requires: js/supabase-config.js, js/auth.js, js/countries.js, Supabase client.
   ========================================================================== */
(function () {
  "use strict";

  // ---------- game definitions (Step 2 + dynamic Step 3) ----------
  var GAMES = {
    codm: {
      id: "codm",
      label: "Call of Duty: Mobile",
      short: "CODM",
      roles: [
        "Slayer/Fragger",
        "Objective",
        "Support",
        "Sniper",
        "IGL/Shot Caller",
        "Flex"
      ],
      teamLabel: "Clan / Organization",
      hasExperience: true
    },
    freefire: {
      id: "freefire",
      label: "Free Fire",
      short: "Free Fire",
      roles: ["Rusher", "Fragger", "Support", "Sniper", "IGL", "Flex"],
      teamLabel: "Guild / Team",
      hasExperience: false
    },
    bloodstrike: {
      id: "bloodstrike",
      label: "Blood Strike",
      short: "Blood Strike",
      roles: ["Fragger", "Support", "Sniper", "Entry", "IGL", "Flex"],
      teamLabel: "Team / Clan",
      hasExperience: false
    }
  };

  var GAME_ORDER = ["codm", "freefire", "bloodstrike"];

  // ---------- connection providers (config-driven for future Instagram/YouTube/Twitch) ----------
  var CONNECTION_PROVIDERS = [
    {
      id: "discord",
      label: "Discord",
      required: false,
      connectLabel: "Connect Discord",
      connectedLabel: "✓ Discord Connected",
      connect: function () {
        if (window.R3IGNAuth && window.R3IGNAuth.linkWithDiscord) {
          // Return to onboarding after OAuth instead of profile-settings
          return window.R3IGNAuth.linkWithDiscord("onboarding.html");
        }
        toast("Discord linking is not configured yet.", "error");
        return Promise.reject(new Error("Discord not configured"));
      }
    },
    {
      id: "tiktok",
      label: "TikTok",
      required: false,
      connectLabel: "Connect TikTok",
      connectedLabel: "✓ TikTok Connected",
      connect: function () {
        if (window.R3IGNAuth && window.R3IGNAuth.linkWithTikTok) {
          return window.R3IGNAuth.linkWithTikTok("onboarding.html");
        }
        toast("TikTok linking is not configured yet.", "error");
        return Promise.reject(new Error("TikTok not configured"));
      }
    },
    {
      id: "google",
      label: "Google",
      required: false,
      alwaysConnected: true,
      connectedLabel: "✓ Connected"
    }
  ];

  // R3IGN HQ Discord invite (official community)
  var R3IGN_HQ_INVITE = "https://discord.gg/85qGDxyCdp";

  // ---------- state ----------
  var state = {
    userId: null,
    currentStep: 1,
    profile: {
      display_name: "",
      country: "Nigeria",
      bio: "",
      player_id: "",
      avatar_url: null,
      selected_games: [],
      r3ign_hq_joined: false,
      onboarding_completed: false
    },
    gameProfiles: {},   // { codm: {...}, freefire: {...}, ... }
    connections: {},    // { discord: {...}, tiktok: {...}, google: {...} }
    saving: false
  };

  // ---------- DOM helpers ----------
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function toast(msg, type) {
    if (window.R3IGNToast && window.R3IGNToast.show) {
      window.R3IGNToast.show(msg, type || "info");
    } else {
      console.log("[" + (type || "info") + "] " + msg);
    }
  }

  function setBusy(busy) {
    state.saving = busy;
    $$("[data-ob-action]").forEach(function (btn) {
      btn.disabled = busy;
    });
  }

  // ---------- Supabase client ----------
  function getClient() {
    if (window.R3IGNAuth && window.R3IGNAuth.client) return window.R3IGNAuth.client;
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return null;
  }

  // ---------- load / save ----------
  async function ensureAuth() {
    var client = getClient();
    if (!client) {
      toast("Auth is not configured. Add Supabase credentials first.", "error");
      return null;
    }
    var res = await client.auth.getUser();
    if (res.error || !res.data.user) {
      window.location.href = "signin.html?redirect=onboarding.html";
      return null;
    }
    state.userId = res.data.user.id;
    return res.data.user;
  }

  async function loadProgress() {
    var client = getClient();
    if (!client || !state.userId) return;

    var profileRes = await client
      .from("profiles")
      .select("display_name, country, bio, player_id, avatar_url, selected_games, r3ign_hq_joined, onboarding_step, onboarding_completed")
      .eq("id", state.userId)
      .maybeSingle();

    if (profileRes.error) {
      console.error(profileRes.error);
      toast("Could not load profile progress.", "error");
      return;
    }

    if (profileRes.data) {
      var p = profileRes.data;
      state.profile.display_name = p.display_name || "";
      state.profile.country = p.country || "Nigeria";
      state.profile.bio = p.bio || "";
      state.profile.player_id = p.player_id || "";
      state.profile.avatar_url = p.avatar_url || null;
      state.profile.selected_games = Array.isArray(p.selected_games) ? p.selected_games : [];
      state.profile.r3ign_hq_joined = !!p.r3ign_hq_joined;
      state.profile.onboarding_completed = !!p.onboarding_completed;
      state.currentStep = Math.min(Math.max(p.onboarding_step || 1, 1), 6);
    }

    // Ensure player_id exists (DB trigger should set it; client fallback if migration not run yet)
    if (!state.profile.player_id) {
      try {
        var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var candidate = "R3HQ-";
        for (var i = 0; i < 6; i++) {
          candidate += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        var idUpd = await client
          .from("profiles")
          .update({ player_id: candidate })
          .eq("id", state.userId)
          .is("player_id", null)
          .select("player_id")
          .maybeSingle();
        if (idUpd.data && idUpd.data.player_id) {
          state.profile.player_id = idUpd.data.player_id;
        } else {
          // re-fetch in case another process filled it
          var again = await client
            .from("profiles")
            .select("player_id")
            .eq("id", state.userId)
            .maybeSingle();
          state.profile.player_id =
            (again.data && again.data.player_id) || candidate;
        }
      } catch (e) {
        state.profile.player_id = "R3HQ-PENDING";
      }
    }

    // Game profiles
    var gpRes = await client
      .from("game_profiles")
      .select("*")
      .eq("profile_id", state.userId);

    if (!gpRes.error && gpRes.data) {
      gpRes.data.forEach(function (row) {
        state.gameProfiles[row.game] = {
          ign: row.ign || "",
          player_uid: row.player_uid || "",
          country: row.country || "Nigeria",
          role: row.role || "",
          team_clan: row.team_clan || "",
          experience: row.experience || ""
        };
      });
    }

    // Connections
    var connRes = await client
      .from("connections")
      .select("provider, username, provider_user_id")
      .eq("profile_id", state.userId);

    if (!connRes.error && connRes.data) {
      connRes.data.forEach(function (row) {
        state.connections[row.provider] = {
          username: row.username,
          provider_user_id: row.provider_user_id
        };
      });
    }

    // Mark Google as connected if user signed in with any identity (or always for auth account)
    state.connections.google = state.connections.google || { username: "R3IGN Account" };
  }

  async function saveProfileFields(fields) {
    var client = getClient();
    if (!client || !state.userId) return { error: new Error("Not authenticated") };
    var payload = Object.assign({}, fields, { updated_at: new Date().toISOString() });
    // profiles table may not have updated_at — strip if schema doesn't support it
    delete payload.updated_at;
    return client.from("profiles").update(payload).eq("id", state.userId);
  }

  async function saveStep(step) {
    return saveProfileFields({ onboarding_step: step });
  }

  async function saveGameProfile(gameId, data) {
    var client = getClient();
    if (!client || !state.userId) return { error: new Error("Not authenticated") };
    return client.from("game_profiles").upsert(
      {
        profile_id: state.userId,
        game: gameId,
        ign: data.ign || null,
        player_uid: data.player_uid || null,
        country: data.country || null,
        role: data.role || null,
        team_clan: data.team_clan || null,
        experience: data.experience || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "profile_id,game" }
    );
  }

  // ---------- progress calculation ----------
  function calcCompletion() {
    var items = [];
    var done = 0;

    // Basic Profile (display name + country)
    var basicDone = !!(state.profile.display_name && state.profile.country);
    items.push({ id: "basic", label: "Basic Profile", done: basicDone, optional: false });
    if (basicDone) done++;

    // Profile Picture
    var picDone = !!state.profile.avatar_url;
    items.push({ id: "picture", label: "Profile Picture", done: picDone, optional: false });
    if (picDone) done++;

    // Games Selected
    var gamesDone = state.profile.selected_games.length > 0;
    items.push({ id: "games", label: "Games Selected", done: gamesDone, optional: false });
    if (gamesDone) done++;

    // Per-game profiles
    state.profile.selected_games.forEach(function (gid) {
      var g = GAMES[gid];
      if (!g) return;
      var gp = state.gameProfiles[gid];
      var gpDone = !!(gp && gp.ign && gp.player_uid && gp.role);
      items.push({
        id: "game-" + gid,
        label: g.short + " Profile",
        done: gpDone,
        optional: false
      });
      if (gpDone) done++;
    });

    // Discord
    var discordDone = !!state.connections.discord;
    items.push({ id: "discord", label: "Discord Connected", done: discordDone, optional: false });
    if (discordDone) done++;

    // R3IGN HQ
    var hqDone = !!state.profile.r3ign_hq_joined;
    items.push({ id: "hq", label: "R3IGN HQ Joined", done: hqDone, optional: false });
    if (hqDone) done++;

    // TikTok (optional — never blocks)
    var tiktokDone = !!state.connections.tiktok;
    items.push({ id: "tiktok", label: "TikTok Connected — Optional", done: tiktokDone, optional: true });
    // optional items do not increase the required total

    var required = items.filter(function (i) { return !i.optional; }).length;
    var percent = required === 0 ? 0 : Math.round((done / required) * 100);

    return { percent: percent, items: items, requiredDone: done, requiredTotal: required };
  }

  // ---------- UI: progress indicator ----------
  function renderProgress() {
    var track = $("#ob-progress-track");
    if (!track) return;
    var steps = [1, 2, 3, 4, 5, 6];
    track.innerHTML = steps
      .map(function (n) {
        var cls = "ob-step";
        if (n < state.currentStep) cls += " is-done";
        if (n === state.currentStep) cls += " is-current";
        return (
          '<div class="' +
          cls +
          '" data-step="' +
          n +
          '"><span class="ob-step-num">' +
          n +
          "</span></div>"
        );
      })
      .join('<div class="ob-step-line"></div>');
  }

  function showStep(n) {
    state.currentStep = n;
    $$(".ob-panel").forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute("data-step")) !== n;
    });
    renderProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
    saveStep(n).catch(function () {});
  }

  // ---------- STEP 1: Basic Profile ----------
  function renderStep1() {
    var nameInput = $("#ob-display-name");
    var countrySelect = $("#ob-country");
    var bioInput = $("#ob-bio");
    var playerIdEl = $("#ob-player-id");
    var avatarPreview = $("#ob-avatar-preview");
    var avatarInput = $("#ob-avatar-input");

    if (nameInput) nameInput.value = state.profile.display_name || "";
    if (bioInput) bioInput.value = state.profile.bio || "";
    if (playerIdEl) playerIdEl.textContent = state.profile.player_id || "R3HQ-…";
    if (countrySelect && window.R3IGNCountries) {
      window.R3IGNCountries.fillSelect(countrySelect, state.profile.country || "Nigeria");
    }
    if (avatarPreview) {
      if (state.profile.avatar_url) {
        avatarPreview.style.backgroundImage = "url('" + state.profile.avatar_url + "')";
        avatarPreview.classList.add("has-image");
        avatarPreview.textContent = "";
      } else {
        avatarPreview.style.backgroundImage = "";
        avatarPreview.classList.remove("has-image");
        avatarPreview.textContent = (state.profile.display_name || "?").charAt(0).toUpperCase();
      }
    }

    if (avatarInput && !avatarInput._bound) {
      avatarInput._bound = true;
      avatarInput.addEventListener("change", handleAvatarUpload);
    }
  }

  async function handleAvatarUpload(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.match(/^image\//)) {
      toast("Please choose an image file.", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast("Image must be under 3 MB.", "error");
      return;
    }

    var client = getClient();
    if (!client || !state.userId) return;

    setBusy(true);
    var ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    var path = state.userId + "/avatar." + ext;

    try {
      var up = await client.storage.from("profile-avatars").upload(path, file, {
        upsert: true,
        contentType: file.type
      });
      if (up.error) throw up.error;

      var pub = client.storage.from("profile-avatars").getPublicUrl(path);
      var url = pub.data.publicUrl + "?t=" + Date.now();

      var upd = await saveProfileFields({ avatar_url: url });
      if (upd.error) throw upd.error;

      state.profile.avatar_url = url;
      renderStep1();
      document.dispatchEvent(new CustomEvent("r3ign:avatar-updated", { detail: { url: url } }));
      toast("Profile picture saved.", "success");
    } catch (err) {
      console.error(err);
      toast("Could not upload picture. Try again.", "error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function saveStep1AndContinue() {
    var nameInput = $("#ob-display-name");
    var countrySelect = $("#ob-country");
    var bioInput = $("#ob-bio");

    var displayName = (nameInput && nameInput.value || "").trim();
    var country = (countrySelect && countrySelect.value) || "";
    var bio = (bioInput && bioInput.value || "").trim();

    if (!displayName) {
      toast("Display name is required.", "error");
      if (nameInput) nameInput.focus();
      return;
    }
    if (!country) {
      toast("Country / Region is required.", "error");
      if (countrySelect) countrySelect.focus();
      return;
    }

    setBusy(true);
    try {
      var res = await saveProfileFields({
        display_name: displayName,
        country: country,
        bio: bio || null,
        onboarding_step: 2
      });
      if (res.error) throw res.error;

      state.profile.display_name = displayName;
      state.profile.country = country;
      state.profile.bio = bio;
      showStep(2);
      renderStep2();
      toast("Basic profile saved.", "success");
    } catch (err) {
      console.error(err);
      toast("Could not save. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  // ---------- STEP 2: Games ----------
  function renderStep2() {
    var list = $("#ob-games-list");
    if (!list) return;
    list.innerHTML = GAME_ORDER.map(function (gid) {
      var g = GAMES[gid];
      var checked = state.profile.selected_games.indexOf(gid) !== -1;
      return (
        '<label class="ob-game-card' +
        (checked ? " is-selected" : "") +
        '">' +
        '<input type="checkbox" name="games" value="' +
        gid +
        '"' +
        (checked ? " checked" : "") +
        " />" +
        '<span class="ob-game-label">' +
        g.label +
        "</span>" +
        "</label>"
      );
    }).join("");

    $$('input[name="games"]', list).forEach(function (cb) {
      cb.addEventListener("change", function () {
        var card = cb.closest(".ob-game-card");
        if (card) card.classList.toggle("is-selected", cb.checked);
      });
    });
  }

  async function saveStep2AndContinue() {
    var checked = $$('input[name="games"]:checked').map(function (el) {
      return el.value;
    });
    if (checked.length === 0) {
      toast("Select at least one game to continue.", "error");
      return;
    }

    setBusy(true);
    try {
      var res = await saveProfileFields({
        selected_games: checked,
        onboarding_step: 3
      });
      if (res.error) throw res.error;

      state.profile.selected_games = checked;
      showStep(3);
      renderStep3();
      toast("Games saved.", "success");
    } catch (err) {
      console.error(err);
      toast("Could not save games. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  // ---------- STEP 3: Dynamic game profile forms ----------
  function buildGameForm(gameId) {
    var g = GAMES[gameId];
    var existing = state.gameProfiles[gameId] || {};
    var rolesOpts = g.roles
      .map(function (r) {
        return (
          '<option value="' +
          r +
          '"' +
          (existing.role === r ? " selected" : "") +
          ">" +
          r +
          "</option>"
        );
      })
      .join("");

    var expBlock = "";
    if (g.hasExperience) {
      var levels = ["Beginner", "Intermediate", "Advanced"];
      expBlock =
        '<fieldset class="ob-fieldset">' +
        "<legend>Competitive Experience</legend>" +
        '<div class="ob-radio-row">' +
        levels
          .map(function (lvl) {
            return (
              '<label class="ob-radio">' +
              '<input type="radio" name="exp-' +
              gameId +
              '" value="' +
              lvl +
              '"' +
              (existing.experience === lvl ? " checked" : "") +
              " />" +
              "<span>" +
              lvl +
              "</span></label>"
            );
          })
          .join("") +
        "</div></fieldset>";
    }

    return (
      '<div class="ob-game-form dossier" data-game="' +
      gameId +
      '">' +
      '<div class="ob-game-form-head">' +
      "<h3>" +
      g.label +
      "</h3>" +
      "</div>" +
      '<div class="ob-fields">' +
      '<div class="field">' +
      '<label for="ign-' +
      gameId +
      '">In-Game Name / IGN</label>' +
      '<input type="text" id="ign-' +
      gameId +
      '" name="ign" value="' +
      escapeAttr(existing.ign || "") +
      '" required autocomplete="off" />' +
      "</div>" +
      '<div class="field">' +
      '<label for="uid-' +
      gameId +
      '">Player UID</label>' +
      '<input type="text" id="uid-' +
      gameId +
      '" name="player_uid" value="' +
      escapeAttr(existing.player_uid || "") +
      '" required autocomplete="off" />' +
      "</div>" +
      '<div class="field">' +
      '<label for="country-' +
      gameId +
      '">Country / Region</label>' +
      '<select id="country-' +
      gameId +
      '" name="country" required></select>' +
      "</div>" +
      '<div class="field">' +
      '<label for="role-' +
      gameId +
      '">' +
      (g.hasExperience ? "Competitive Role" : "Preferred Role") +
      "</label>" +
      '<select id="role-' +
      gameId +
      '" name="role" required>' +
      '<option value="" disabled' +
      (!existing.role ? " selected" : "") +
      ">Select role</option>" +
      rolesOpts +
      "</select>" +
      "</div>" +
      '<div class="field">' +
      '<label for="team-' +
      gameId +
      '">' +
      g.teamLabel +
      " <span class=\"optional\">(optional)</span></label>" +
      '<input type="text" id="team-' +
      gameId +
      '" name="team_clan" value="' +
      escapeAttr(existing.team_clan || "") +
      '" autocomplete="off" />' +
      "</div>" +
      expBlock +
      "</div>" +
      '<div class="ob-form-actions">' +
      '<button type="button" class="btn btn-primary" data-save-game="' +
      gameId +
      '">Save ' +
      g.short +
      " Profile</button>" +
      '<span class="ob-save-status" data-status-for="' +
      gameId +
      '" hidden>✓ Saved</span>' +
      "</div>" +
      "</div>"
    );
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderStep3() {
    var container = $("#ob-game-forms");
    if (!container) return;

    var selected = state.profile.selected_games || [];
    if (selected.length === 0) {
      container.innerHTML =
        '<p class="ob-empty">No games selected. Go back to Step 2 and choose at least one game.</p>';
      return;
    }

    // Only the games the user selected — exact count
    container.innerHTML = selected
      .map(function (gid) {
        return buildGameForm(gid);
      })
      .join("");

    // Fill country dropdowns
    selected.forEach(function (gid) {
      var sel = $("#country-" + gid);
      var existing = state.gameProfiles[gid] || {};
      if (sel && window.R3IGNCountries) {
        window.R3IGNCountries.fillSelect(sel, existing.country || state.profile.country || "Nigeria");
      }
    });

    // Bind save buttons
    $$("[data-save-game]", container).forEach(function (btn) {
      btn.addEventListener("click", function () {
        saveOneGameProfile(btn.getAttribute("data-save-game"));
      });
    });
  }

  async function saveOneGameProfile(gameId) {
    var form = $('.ob-game-form[data-game="' + gameId + '"]');
    if (!form) return;

    var ign = ($("#ign-" + gameId) || {}).value || "";
    var uid = ($("#uid-" + gameId) || {}).value || "";
    var country = ($("#country-" + gameId) || {}).value || "";
    var role = ($("#role-" + gameId) || {}).value || "";
    var team = ($("#team-" + gameId) || {}).value || "";
    var expEl = form.querySelector('input[name="exp-' + gameId + '"]:checked');
    var experience = expEl ? expEl.value : "";

    ign = ign.trim();
    uid = uid.trim();
    team = team.trim();

    if (!ign || !uid || !country || !role) {
      toast("Please fill all required fields for " + (GAMES[gameId] && GAMES[gameId].short) + ".", "error");
      return;
    }
    if (GAMES[gameId] && GAMES[gameId].hasExperience && !experience) {
      toast("Select competitive experience level.", "error");
      return;
    }

    var data = {
      ign: ign,
      player_uid: uid,
      country: country,
      role: role,
      team_clan: team || null,
      experience: experience || null
    };

    setBusy(true);
    try {
      var res = await saveGameProfile(gameId, data);
      if (res.error) throw res.error;
      state.gameProfiles[gameId] = data;
      var status = $('[data-status-for="' + gameId + '"]');
      if (status) {
        status.hidden = false;
        setTimeout(function () {
          status.hidden = true;
        }, 2500);
      }
      toast((GAMES[gameId] && GAMES[gameId].short) + " profile saved.", "success");
    } catch (err) {
      console.error(err);
      toast("Could not save game profile.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function continueFromStep3() {
    var selected = state.profile.selected_games || [];
    var missing = selected.filter(function (gid) {
      var gp = state.gameProfiles[gid];
      return !(gp && gp.ign && gp.player_uid && gp.role);
    });
    if (missing.length) {
      toast(
        "Save a profile for every selected game before continuing. Missing: " +
          missing
            .map(function (g) {
              return GAMES[g] && GAMES[g].short;
            })
            .join(", "),
        "error"
      );
      return;
    }
    await saveStep(4);
    showStep(4);
    renderStep4();
  }

  // ---------- STEP 4: Connections ----------
  function renderStep4() {
    var list = $("#ob-connections-list");
    if (!list) return;

    list.innerHTML = CONNECTION_PROVIDERS.map(function (p) {
      var isConnected =
        p.alwaysConnected || !!state.connections[p.id];
      var statusHtml = isConnected
        ? '<span class="ob-conn-status is-connected">' +
          (p.connectedLabel || "✓ Connected") +
          "</span>"
        : '<button type="button" class="btn" data-connect="' +
          p.id +
          '">' +
          (p.connectLabel || "Connect") +
          "</button>";

      return (
        '<div class="ob-conn-row dossier" data-provider="' +
        p.id +
        '">' +
        '<div class="ob-conn-info">' +
        '<span class="ob-conn-name">' +
        p.label +
        "</span>" +
        "</div>" +
        '<div class="ob-conn-action">' +
        statusHtml +
        "</div>" +
        "</div>"
      );
    }).join("");

    $$("[data-connect]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        connectProvider(btn.getAttribute("data-connect"));
      });
    });
  }

  async function connectProvider(providerId) {
    var provider = CONNECTION_PROVIDERS.find(function (p) {
      return p.id === providerId;
    });
    if (!provider || !provider.connect) return;

    setBusy(true);
    try {
      await provider.connect();
      // OAuth redirect will leave the page; if it returns without redirect, mark connected optimistically
      // Real connection is confirmed after OAuth callback lands back on profile-settings / onboarding
    } catch (err) {
      console.error(err);
      toast("Could not start " + provider.label + " connection.", "error");
      setBusy(false);
    }
  }

  async function continueFromStep4() {
    await saveStep(5);
    showStep(5);
    renderStep5();
  }

  // ---------- STEP 5: Join R3IGN HQ ----------
  function renderStep5() {
    var status = $("#ob-hq-status");
    var btn = $("#ob-join-hq");
    if (state.profile.r3ign_hq_joined) {
      if (status) {
        status.hidden = false;
        status.textContent = "✓ R3IGN HQ CONNECTED";
      }
      if (btn) btn.hidden = true;
    } else {
      if (status) status.hidden = true;
      if (btn) {
        btn.hidden = false;
        btn.href = R3IGN_HQ_INVITE;
      }
    }
  }

  async function markHqJoined() {
    setBusy(true);
    try {
      var res = await saveProfileFields({
        r3ign_hq_joined: true,
        onboarding_step: 6
      });
      if (res.error) throw res.error;
      state.profile.r3ign_hq_joined = true;
      renderStep5();
      toast("R3IGN HQ marked as joined.", "success");
    } catch (err) {
      console.error(err);
      toast("Could not update status.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function continueFromStep5() {
    // Joining is encouraged but not strictly required to reach review
    await saveStep(6);
    showStep(6);
    renderStep6();
  }

  // ---------- STEP 6: Final review ----------
  function renderStep6() {
    var summary = calcCompletion();
    var percentEl = $("#ob-completion-percent");
    var listEl = $("#ob-checklist");
    var completeBtn = $("#ob-complete-btn");

    if (percentEl) percentEl.textContent = summary.percent + "%";

    if (listEl) {
      listEl.innerHTML = summary.items
        .map(function (item) {
          var icon = item.done ? "✓" : "○";
          var cls = item.done ? "is-done" : "is-pending";
          if (item.optional) cls += " is-optional";
          return (
            '<li class="ob-check-item ' +
            cls +
            '"><span class="ob-check-icon">' +
            icon +
            "</span> " +
            item.label +
            "</li>"
          );
        })
        .join("");
    }

    if (completeBtn) {
      // Optional items never block; required items must be done
      var canComplete = summary.requiredDone >= summary.requiredTotal;
      // Soften: allow complete even if picture/Discord/HQ missing, but show warning
      // Spec: TikTok never blocks. Profile picture is required for 100% but can be skipped during onboarding.
      // We allow finishing with <100% and mark onboarding_completed.
      completeBtn.disabled = false;
    }
  }

  async function completeOnboarding() {
    setBusy(true);
    try {
      var res = await saveProfileFields({
        onboarding_completed: true,
        onboarding_step: 6
      });
      if (res.error) throw res.error;
      state.profile.onboarding_completed = true;
      toast("Profile complete. Welcome to R3IGN.", "success");
      setTimeout(function () {
        window.location.href = "account.html";
      }, 900);
    } catch (err) {
      console.error(err);
      toast("Could not finalize profile.", "error");
      setBusy(false);
    }
  }

  // ---------- navigation bindings ----------
  function bindNav() {
    var next1 = $("#ob-next-1");
    if (next1) next1.addEventListener("click", saveStep1AndContinue);

    var next2 = $("#ob-next-2");
    if (next2) next2.addEventListener("click", saveStep2AndContinue);

    var next3 = $("#ob-next-3");
    if (next3) next3.addEventListener("click", continueFromStep3);

    var next4 = $("#ob-next-4");
    if (next4) next4.addEventListener("click", continueFromStep4);

    var next5 = $("#ob-next-5");
    if (next5) next5.addEventListener("click", continueFromStep5);

    var joinHq = $("#ob-join-hq");
    if (joinHq) {
      joinHq.addEventListener("click", function () {
        // Open invite in new tab, then mark joined when user returns / clicks confirm
        // Also provide an explicit "I've joined" control
        setTimeout(function () {
          var confirmBtn = $("#ob-confirm-hq");
          if (confirmBtn) confirmBtn.hidden = false;
        }, 400);
      });
    }

    var confirmHq = $("#ob-confirm-hq");
    if (confirmHq) {
      confirmHq.addEventListener("click", markHqJoined);
    }

    var completeBtn = $("#ob-complete-btn");
    if (completeBtn) completeBtn.addEventListener("click", completeOnboarding);

    // Back buttons
    $$("[data-ob-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = Number(btn.getAttribute("data-ob-back"));
        if (target >= 1 && target <= 6) {
          showStep(target);
          if (target === 1) renderStep1();
          if (target === 2) renderStep2();
          if (target === 3) renderStep3();
          if (target === 4) renderStep4();
          if (target === 5) renderStep5();
          if (target === 6) renderStep6();
        }
      });
    });
  }

  // ---------- init ----------
  async function init() {
    var user = await ensureAuth();
    if (!user) return;

    await loadProgress();

    if (state.profile.onboarding_completed) {
      // Already done — send to account (allow ?edit=1 to re-open)
      try {
        if (!/[?&]edit=1/.test(window.location.search)) {
          window.location.href = "account.html";
          return;
        }
      } catch (e) {
        window.location.href = "account.html";
        return;
      }
    }

    bindNav();
    renderProgress();
    showStep(state.currentStep);

    if (state.currentStep === 1) renderStep1();
    if (state.currentStep === 2) renderStep2();
    if (state.currentStep === 3) renderStep3();
    if (state.currentStep === 4) renderStep4();
    if (state.currentStep === 5) renderStep5();
    if (state.currentStep === 6) renderStep6();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
