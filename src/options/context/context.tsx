import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { connect } from "../message/BackgroundClient";

import type { BackgroundEvent } from "@/shared/message/backgroundEvents";
import type {
  ActiveSession,
  Notification,
  OptionsPage,
  PanelPage,
  Session,
  TabState,
} from "@/shared/types";

type ContextType = {
  mounted: boolean;

  panelPage: PanelPage;
  optionsPage?: OptionsPage;

  activeSession?: ActiveSession;
  sessions: readonly Session[];

  currentNotification?: Notification;
  notifications: readonly Notification[];

  tabs: readonly TabState[];
  allowlist: readonly string[];

  numberOfRecordingTabs: number;
};

const Context = createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "useAppContext must be used within a ContextProvider"
    );
  }

  return context;
}

export function ContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);

  const [activeSession, setActiveSession] =
    useState<ActiveSession | undefined>();

  const [optionsPage, setOptionsPage] =
    useState<OptionsPage | undefined>();

  const [allowlist, setAllowlist] =
    useState<readonly string[]>([]);

  const [tabs, setTabs] =
    useState<readonly TabState[]>([]);

  const [sessions, setSessions] =
    useState<readonly Session[]>([]);

  const [notifications, setNotifications] =
    useState<readonly Notification[]>([]);

  const [
    currentNotification,
    setCurrentNotification,
  ] = useState<Notification | undefined>();

  const panelPage: PanelPage = useMemo(() => {
    if (activeSession?.endedAt) {
      return activeSession.uploadStatus;
    }
    else if (activeSession?.page) {
      return activeSession?.page;
    }
    return "idle";
  }, [activeSession]);

  useEffect(() => {
    const listener = (
      message: BackgroundEvent
    ) => {
      switch (message.type) {
        case "OPTIONS/INITIALIZED": {
          const {
            mount,
            activeSession,
            tabs,
            sessions,
            notifications,
            currentNotification,
            page,
            allowlist,
          } = message.payload;

          setMounted(mount);

          setActiveSession(activeSession);
          setTabs(tabs);
          setSessions(sessions);

          setNotifications(notifications);
          setCurrentNotification(currentNotification);

          setOptionsPage(page);
          setAllowlist(allowlist);

          break;
        }

        case "SESSION/UPDATED":
          setActiveSession(message.payload);
          break;

        case "MOUNT/UPDATED":
          setMounted(message.payload.mounted);
          break;

        case "SESSIONS/UPDATED":
          setSessions(message.payload);
          break;

        case "TABS/UPDATED":
          setTabs(message.payload);
          break;

        case "OPTIONS_PAGE/UPDATED":
          setOptionsPage(message.payload.page);
          break;

        case "ALLOWLIST/UPDATED":
          setAllowlist(message.payload.allowlist);
          break;

        case "NOTIFICATIONS/UPDATED":
          setNotifications(
            message.payload.notifications
          );
          setCurrentNotification(
            message.payload.currentNotification,
          );
          break;
      }
    };

    chrome.runtime.onMessage.addListener(
      listener,
    );

    connect();

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const numberOfRecordingTabs = useMemo(() => {
    let count = 0;

    for (const tab of tabs) {
      if (tab.recordingScope === "recording") {
        count++;
      }
    }

    return count;
  }, [tabs]);

  const value = useMemo<ContextType>(
    () => ({
      mounted,

      panelPage,
      optionsPage,

      activeSession,
      sessions,

      currentNotification,
      notifications,

      tabs,
      allowlist,

      numberOfRecordingTabs,
    }),
    [
      mounted,

      panelPage,
      optionsPage,

      activeSession,
      sessions,

      currentNotification,
      notifications,

      tabs,
      allowlist,

      numberOfRecordingTabs,
    ],
  );
  
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
