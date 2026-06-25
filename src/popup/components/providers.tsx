"use client";

import { ContextProvider } from "./context";
import { MessageListener } from "./message-listener";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ContextProvider>
      <MessageListener>{children}</MessageListener>
    </ContextProvider>
  );
}
