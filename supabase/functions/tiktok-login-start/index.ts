// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const TIKTOK_CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY")!;
const REDIRECT_URI = Deno.env.get("TIKTOK_REDIRECT_URI")!; // must match the one saved in TikTok dashboard

serve((req) => {
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authorizeUrl.searchParams.set("client_key", TIKTOK_CLIENT_KEY);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "user.info.basic");
  authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authorizeUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      // lightweight CSRF check — verified against the state TikTok sends back
      "Set-Cookie": `tiktok_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
});