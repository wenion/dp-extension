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
  PanelPage,
  Session,
  TabState,
} from "@/shared/types";

type ContextType = {
  mounted: boolean;
  page: PanelPage;

  activeSession?: ActiveSession;
  sessions: readonly Session[];

  currentNotification?: Notification;
  notifications: readonly Notification[];

  tabs: readonly TabState[];

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

  const page: PanelPage = useMemo(() => {
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
          } = message.payload;

          setMounted(mount);
          setActiveSession(activeSession);
          setTabs(tabs);
          setSessions(sessions);

          setNotifications(notifications);
          setCurrentNotification(currentNotification);

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

      page,

      activeSession,
      sessions,

      currentNotification,
      notifications,

      tabs,

      numberOfRecordingTabs,
    }),
    [
      mounted,

      page,

      activeSession,
      sessions,

      currentNotification,
      notifications,

      tabs,

      numberOfRecordingTabs,
    ],
  );
  
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
