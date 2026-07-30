import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { connect } from "../message/BackgroundClient";

import type { EventMessage } from "@/shared/message/events";
import type {
  Notification,
  OptionsState,
  PageState,
  Session,
  TabState,
} from "@/shared/types";


type ContextType = {
  mounted: boolean;

  page: PageState;

  session: Session | null;
  sessions: readonly Session[];

  currentNotification: Notification | null;
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

  const [page, setPage] =
    useState<PageState>("idle");

  const [session, setSession] =
    useState<Session | null>(null);

  const [sessions, setSessions] =
    useState<readonly Session[]>([]);

  const [
    currentNotification,
    setCurrentNotification,
  ] = useState<Notification | null>(null);

  const [notifications, setNotifications] =
    useState<readonly Notification[]>([]);

  const [tabs, setTabs] =
    useState<readonly TabState[]>([]);

  useEffect(() => {
    const listener = (
      message: EventMessage
    ) => {
      switch (message.type) {
        case "OPTIONS/INITIALIZED": {
          const {
            pageMounted,
            pageState,
            activeSession,
            sessions,
            tabs,
            notifications,
            currentNotification,
          } = message.payload as OptionsState;

          setMounted(pageMounted ?? false);

          setPage(pageState ?? "idle");

          setSession(activeSession?? null);

          
          setSessions(sessions);
          setTabs(tabs);

          setNotifications(notifications);
          if (currentNotification) {
            setCurrentNotification(currentNotification);
          }

          break;
        }

        case "SESSION/UPDATED":
          setSession(message.payload);
          break;

        case "PAGE_STATE/UPDATED":
          setPage(message.payload);
          break;

        case "PAGE/MOUNTED":
          connect();
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

        case "NOTIFICATIONS/UPDATED":
          setNotifications(
            message.payload.notifications
          );
          setCurrentNotification(
            message.payload.currentNotification ??
              null,
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

      session,
      sessions,

      currentNotification,
      notifications,

      tabs,

      numberOfRecordingTabs,
    }),
    [
      mounted,

      page,

      session,
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
