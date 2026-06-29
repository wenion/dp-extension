import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

type Status =
  | "ready"
  | "recording"
  | "paused"
  | "stopped"
  | "uploading"
  | "uploaded";

type ContextType = {
  status: Status;
  setStatus: (value: Status) => void;
  isExpanded: boolean | null;
  setIsExpanded: (value: boolean) => void;
};
const Context = createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }

  return context;
}

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("uploading");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const value = useMemo<ContextType>(
    () => ({
      status,
      setStatus,
      isExpanded,
      setIsExpanded,
    }),
    [
      status,
      isExpanded,
    ],
  );
  
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
