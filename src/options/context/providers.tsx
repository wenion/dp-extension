import {ToastProvider} from "@heroui/toast";

import { ContextProvider } from "./context";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastProvider />
      <ContextProvider>
        {children}
      </ContextProvider>
    </>
  );
}
