"use client";

import type { ReactNode } from "react";
import OnlinePresenceProvider from "@/components/OnlinePresenceProvider";

/** Client-side app providers (presence, future theme/toast, etc.) */
export default function Providers({ children }: { children: ReactNode }) {
  return <OnlinePresenceProvider>{children}</OnlinePresenceProvider>;
}
