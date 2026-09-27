## Done
- … register (live)
- **messages** (`app/messages/page.tsx` + MessagesClient.tsx) — auth gate, list/thread, send via Supabase

## Next Up
- Live player-market (listings + create) to match register/messages
- signup / auth polish if needed
- admin, consent banner, PWA last

## Known Issues
- Messages depends on `messages` table + profile FKs + RLS policies matching legacy.
- Player-market still sample; message links still go to signin until listings have real profile_ids.