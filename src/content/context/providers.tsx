import { ContextProvider } from "./context";

import type { ReactNode } from "react";
import type { AppState } from "@/shared/types";

type Props = {
  initialState: AppState;
  children: ReactNode;
};

export function Providers({
  initialState,
  children
}: Props) {
  return (
    <ContextProvider initialState={initialState}>
      {children}
    </ContextProvider>
  );
}
