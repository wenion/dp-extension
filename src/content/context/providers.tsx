import { ContextProvider } from "./context";

import type { ReactNode } from "react";
import type { InitState } from "@/shared/types";

type Props = {
  initialState: InitState;
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
