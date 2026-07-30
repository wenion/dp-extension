import { ContextProvider } from "./context";

import type { ReactNode } from "react";
import type { ContentState } from "@/shared/types";

type Props = {
  initialState: ContentState;
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
