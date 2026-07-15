import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  // setSession: (value: Session) => void;

  tabs: TabState[];
  setTabs: (value: TabState[]) => void;

  currentTab : TabState | undefined,
  numberOfRecordingTabs: number,
};
const Context = createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }

  return context;
}

type Props = {
  initialState: AppState;
  children: React.ReactNode;
};

export function ContextProvider({
  initialState,
  children
}: Props) {
  const tabId = initialState.tabId;
  // if no tabId?
  // const windowId = initialState.windowId;
  const [page, setPage] = useState<PageState>(initialState.pageState);
  const [session, _setSession] = useState<Session | null>(
    initialState.activeSession ?? null
  );
  const [tabs, setTabs] = useState<TabState[]>([
    ...(initialState.tabs ?? [])
  ]);
  
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

      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const currentTab = useMemo(() => {
    return tabs.find(tab => tab.tabId === tabId);
  }, [tabs, tabId]);

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
      // setSession,
      tabs,
      setTabs,
      currentTab,
      numberOfRecordingTabs,
    }),
    [
      page,
      session,
      tabs,
      currentTab,
      numberOfRecordingTabs,
    ],
  );
  
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
