import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";

import { initialize, refreshSessions } from "../message/BackgroundClient";

import type {
  PageState,
  Session,
  TabState,
  AppState,
} from "@/shared/types";
import type { EventMessage } from "@/shared/message/events";


type ContextType = {
  page: PageState;
  setPage: (value: PageState) => void;

  session: Session | null;

  sessions: Session[];

  tabs: TabState[];
  setTabs: (value: TabState[]) => void;
  numberOfRecordingTabs: number;
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
  const [page, setPage] = useState<PageState>("idle");
  const [session, _setSession] = useState<Session | null>(null);
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    async function init() {
      const state = await initialize() as AppState;

      setPage(state.pageState);
      _setSession(state.activeSession?? null);
      setTabs([...state.tabs]);
      setSessions([...state.sessions]);

      await refreshSessions();
    }

    void init();
  }, []);

  useEffect(() => {
    const listener = (message: EventMessage) => {
      switch (message.type) {
        case "SESSION/UPDATED":
          _setSession(message.payload);
          break;

        case "PAGE_STATE/UPDATED":
          setPage(message.payload);
          break;

        case "TABS/UPDATED":
          setTabs(message.payload);
          break;

        case "SESSIONS/UPDATED":
          setSessions(message.payload);
          break;
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const numberOfRecordingTabs = useMemo(() => {
    let count = 0;

    for (const tab of tabs) {
      if (tab.recordingStatus === "recording") {
        count++;
      }
    }

    return count;
  }, [tabs]);


  const value = useMemo<ContextType>(
    () => ({
      page,
      setPage,
      session,
      sessions,
      setSessions,
      tabs,
      setTabs,
      numberOfRecordingTabs,
    }),
    [
      page,
      session,
      sessions,
      tabs,
      numberOfRecordingTabs,
    ],
  );
  
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
