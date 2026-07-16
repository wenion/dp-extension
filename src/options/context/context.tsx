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
  mounted: boolean;

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
  const [mounted, setMounted] = useState<boolean>(false);
  const [page, setPage] = useState<PageState>("idle");
  const [session, _setSession] = useState<Session | null>(null);
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    async function init() {
      const state = await initialize() as AppState;

      setMounted(state.mounted);
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
      console.log("message.type", message.type, message)
      switch (message.type) {
        case "SESSION/UPDATED":
          _setSession(message.payload);
          break;

        case "PAGE_STATE/UPDATED":
          setPage(message.payload);
          break;

        case "PAGE/MOUNTED":
          setMounted(message.payload.mounted);
          setPage(message.payload.pageState);
          _setSession(message.payload.activeSession?? null);
          setTabs([...message.payload.tabs]);
          setSessions([...message.payload.sessions]);

          break;

        case "PAGE/UNMOUNTED":
          setMounted(false);
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
      mounted,
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
      mounted,
      page,
      session,
      sessions,
      tabs,
      numberOfRecordingTabs,
    ],
  );
  
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
