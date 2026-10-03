"use client";

import type { ReactNode } from "react";
import OnlinePresenceProvider from "@/components/OnlinePresenceProvider";
import R3ignDialogProvider from "@/components/R3ignDialog";

/** Client-side app providers (presence, themed dialogs, etc.) */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <OnlinePresenceProvider>
      <R3ignDialogProvider>{children}</R3ignDialogProvider>
    </OnlinePresenceProvider>
  );
}
