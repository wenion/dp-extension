import { ContextProvider } from "./context";

import type { ReactNode } from "react";
import type { OverlayState } from "../types";

type Props = {
  initialState: OverlayState;
  children: ReactNode;
};

export function Providers({
  initialState,
  children
}: Props) {
  return (
    <ContextProvider contentState={initialState}>
      {children}
    </ContextProvider>
  );
}
