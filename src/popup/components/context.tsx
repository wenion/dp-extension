"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { addGrantedOrigin, removeGrantedOrigin } from "@/shared/grantedOrigins";
import {
  getActiveIcon,
  getDefaultIcon,
  getCapturingIcon,
} from "@/shared/icons";

import type { Profile, ExtensionJwtPayload } from "../types";

type ContextType = {
  profile: Profile | null;
  payload: ExtensionJwtPayload | null;
  captureOn: boolean | null;
  setCaptureOn: (value: boolean) => void;
  permissionGranted: boolean | null;
  setPermissionGranted: (value: boolean) => void;
  error: string | null;
  setError: (value: string | null) => void;
};
const Context = createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }

  return context;
}

function decodeJwt(token: string): ExtensionJwtPayload | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) return null;

    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isTokenExpired(payload: ExtensionJwtPayload): boolean {
  const nowSec = Math.floor(Date.now() / 1000);

  return payload.exp <= nowSec;
}

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payload, setPayload] = useState<ExtensionJwtPayload | null>(null);
  const [captureOn, _setCaptureOn] = useState<boolean | null>(null);
  const [permissionGranted, _setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const getActiveTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    return tab;
  };

  const checkPermissionGranted = useCallback(async (tab: chrome.tabs.Tab) => {
    if (!tab.url) return;

    const url = new URL(tab.url);
    const originPattern = `${url.origin}/*`;
    const hasPermission = await chrome.permissions.contains({
      permissions: ["scripting"],
      origins: [originPattern],
    });

    if (hasPermission) {
      await chrome.action.setIcon({
        imageData: getActiveIcon(),
        tabId: tab.id!,
      });
    } else {
      await chrome.action.setIcon({
        imageData: getDefaultIcon(),
        tabId: tab.id!,
      });
    }

    _setPermissionGranted(hasPermission);
  }, []);

  const setPermissionGranted = useCallback(
    async (value: boolean) => {
      const tab = await getActiveTab();

      if (!tab?.url) return;

      const url = new URL(tab.url);
      const originPattern = `${url.origin}/*`;

      if (value) {
        await chrome.permissions.request({
          permissions: ["scripting"],
          origins: [originPattern],
        });
      } else {
        await chrome.permissions.remove({
          permissions: ["scripting"],
          origins: [originPattern],
        });
      }
      await checkPermissionGranted(tab);
    },
    [checkPermissionGranted],
  );

  const checkCaptureOn = useCallback(async (tab: chrome.tabs.Tab) => {
    try {
      const res = await chrome.tabs.sendMessage(tab.id!, { type: "PING" });

      if (res.ok) {
        await chrome.action.setIcon({
          imageData: getCapturingIcon(),
          tabId: tab.id!,
        });
        _setCaptureOn(true);
      } else {
        await chrome.action.setIcon({
          imageData: getActiveIcon(),
          tabId: tab.id!,
        });
        _setCaptureOn(false);
      }
    } catch {
      await checkPermissionGranted(tab);
      _setCaptureOn(false);
    }
  }, []);

  const setCaptureOn = useCallback(
    async (value: boolean) => {
      const tab = await getActiveTab();

      if (!tab?.url) return;

      if (value) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ["content-script.js"],
        });
        addGrantedOrigin(tab.url!);
      } else {
        try {
          await chrome.tabs.sendMessage(tab.id!, {
            type: "REMOVE_CONTENT_SCRIPT",
          });
          removeGrantedOrigin(tab.url!);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("Error sending REMOVE_CONTENT_SCRIPT message", e);
        }
      }

      await checkCaptureOn(tab);
    },
    [checkCaptureOn],
  );

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0];

      if (tab) {
        checkPermissionGranted(tab).then(() => checkCaptureOn(tab));
      }
    });

    chrome.storage.local.get("token", (result) => {
      const token = result.token as string | undefined;

      if (!token) return;

      const payload = decodeJwt(token);

      setPayload(payload);
    });

    chrome.storage.local.get("profile", (result) => {
      setProfile(result.profile as Profile | null);
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.profile) {
        const newProfile = changes.profile.newValue;

        setProfile(newProfile as Profile | null);
      }
      if (areaName === "local" && changes.token) {
        const newToken = changes.token.newValue as string | undefined;
        if (newToken) {
          setPayload(decodeJwt(newToken));
        }
      }
    });
  }, []);

  useEffect(() => {
    if (payload && isTokenExpired(payload)) {
      setProfile(null);
    }
  }, [payload]);

  const value = useMemo<ContextType>(
    () => ({
      profile,
      payload,
      captureOn,
      setCaptureOn,
      permissionGranted,
      setPermissionGranted,
      error,
      setError,
    }),
    [
      profile,
      payload,
      captureOn,
      setCaptureOn,
      permissionGranted,
      setPermissionGranted,
      error,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
