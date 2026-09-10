// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TIKTOK_CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY")!;
const TIKTOK_CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET")!;
const REDIRECT_URI = Deno.env.get("TIKTOK_REDIRECT_URI")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "https://r3ign-esport.vercel.app";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const cookieState = req.headers.get("cookie")?.match(/tiktok_oauth_state=([^;]+)/)?.[1];

  if (!code || !returnedState || returnedState !== cookieState) {
    return new Response("Invalid or missing OAuth state/code", { status: 400 });
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    return new Response(`TikTok token exchange failed: ${JSON.stringify(tokenData)}`, { status: 502 });
  }

  // 2. Fetch the TikTok profile
  const profileRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const profileData = await profileRes.json();
  const profile = profileData?.data?.user;
  if (!profile?.open_id) {
    return new Response(`Failed to fetch TikTok profile: ${JSON.stringify(profileData)}`, { status: 502 });
  }

  // 3. Create (or reuse) the synthetic user
  const syntheticEmail = `tiktok_${profile.open_id}@r3ign.tiktok`;

  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: syntheticEmail,
    email_confirm: true,
    user_metadata: {
      provider: "tiktok",
      tiktok_open_id: profile.open_id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
    },
  });

  // Ignore "already registered" — that just means the user already exists
  if (createErr) {
    const msg = createErr.message || "";
    const alreadyExists =
      msg.includes("already been registered") ||
      msg.includes("User already registered") ||
      msg.includes("already exists") ||
      createErr.status === 422;

    if (!alreadyExists) {
      return new Response(`User creation failed: ${createErr.message}`, { status: 500 });
    }
  }

  // 4. Generate a magic link session and redirect the browser
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: syntheticEmail,
    options: { redirectTo: FRONTEND_URL },
  });

  if (linkErr) {
    return new Response(`Session creation failed: ${linkErr.message}`, { status: 500 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: linkData.properties.action_link,
      "Set-Cookie": "tiktok_oauth_state=; Path=/; Max-Age=0",
    },
  });
});