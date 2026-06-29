import { ContextProvider } from "./context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ContextProvider>
      {children}
    </ContextProvider>
  );
}
