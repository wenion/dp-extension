import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { OverlayState } from "../types";

import type {
  ActiveSession,
  PanelPage,
  TabState,
} from "@/shared/types";

import type {
  BackgroundEvent,
} from "@/shared/message/backgroundEvents";

type ContextType = {
  page: PanelPage;
  notice?: string;

  activeSession?: ActiveSession;

  tabs: readonly TabState[];
  currentTab?: TabState,

  numberOfRecordingTabs: number,
};

const Context =
  createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "useAppContext must be used within a ContextProvider",
    );
  }

  return context;
}

type Props = {
  contentState: OverlayState;
  children: React.ReactNode;
};

export function ContextProvider({
  contentState,
  children
}: Props) {
  const { tabId } = contentState;

  const [activeSession, setActiveSession] =
    useState<ActiveSession | undefined>(
      contentState.activeSession,
    );

  const [tabs, setTabs] =
    useState<readonly TabState[]>(
      contentState.tabs,
    );

  const [notice, setNotice] =
    useState<string>();

  useEffect(() => {
    const listener = (message: BackgroundEvent) => {
      switch (message.type) {
        case "SESSION/UPDATED":
          setActiveSession(message.payload);
          break;

        case "TABS/UPDATED":
          setTabs(message.payload);
          break;

        case "NOTICE/SHOW":
          setNotice(message.payload);
          break;
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const currentTab = useMemo(
    () =>
      tabs.find(
        tab => tab.tabId === tabId,
      ),
    [tabs, tabId],
  );

  const numberOfRecordingTabs = useMemo(
    () =>
      tabs.filter(
        tab => tab.recordingScope === "recording",
      ).length,
    [tabs],
  );

  const page = useMemo<PanelPage>(() => {
    if (notice) {
      return "notice";
    }
    if (activeSession?.endedAt) {
      return activeSession.uploadStatus;
    }
    else if (activeSession?.page) {
      return activeSession?.page;
    }
    return "idle";
  }, [activeSession, notice]);

  const value = useMemo<ContextType>(
    () => ({
      page,
      notice,
      activeSession,
      tabs,
      currentTab,
      numberOfRecordingTabs,
    }),
    [
      page,
      notice,
      activeSession,
      tabs,
      currentTab,
      numberOfRecordingTabs,
    ],
  );
  
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
