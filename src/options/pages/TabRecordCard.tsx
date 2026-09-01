import { useState } from "react";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { addToast } from "@heroui/toast";

import {
  Eye,
  EyeClosed,
  EyeSlash,
  LinkSlash,
} from "@gravity-ui/icons";

import {
  promptTemporaryPermission,
} from "../message/BackgroundClient";

import type { TabState } from "@/shared/types"

type TabRecordCardProps = {
  tab: TabState;
  favicon?: string;
  captureState: "recording" | "paused";

  onIncludeTab?: (tabId: number) => void;
  onExcludeTab?: (tabId: number) => void;
  onRequestPermission?: (tabId: number) => void;
};

export function TabRecordCard({
  tab,
  favicon,
  captureState,
  onIncludeTab,
  onExcludeTab,
  onRequestPermission,
}: TabRecordCardProps) {
  const [permissionExpanded, setPermissionExpanded] =
    useState(false);

  const displayStatus =
    tab.recordingScope === "recording"
      ? captureState
      : tab.recordingScope;

  const statusTextColor = {
    recording: "text-red-600",
    paused: "text-amber-700",
    excluded: "text-default-700",
    not_in_scope: "text-default-500",
    no_permission: "text-default-500",
    unsupported: "text-default-500",
  } as const;

  const statusLabel = {
    recording: "RECORDING",
    paused: "PAUSED",
    excluded: "EXCLUDED",
    not_in_scope: "NOT IN SCOPE",
    no_permission: "NOT IN SCOPE",
    unsupported: "NOT IN SCOPE",
  } as const;

  const openTab = async () => {
    try {
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, {
          focused: true,
        });
      }

      await chrome.tabs.update(tab.tabId, {
        active: true,
      });
    } catch {
      addToast({
        title: "Unable to open tab",
        description: "This tab no longer exists.",
        color: "danger",
      });
    }
  };

  const handleAction = async () => {
    if (tab.recordingScope === "recording") {
      onExcludeTab?.(tab.tabId);
      return;
    }

    if (tab.recordingScope === "excluded") {
      onIncludeTab?.(tab.tabId);
      return;
    }

    // Don't request permission yet.
    // Expand the card first.
    onIncludeTab?.(tab.tabId);
    await promptTemporaryPermission(tab.tabId);
    setPermissionExpanded(true);
  };

  const handlePermissionConfirm = () => {
    setPermissionExpanded(false);
    onRequestPermission?.(tab.tabId);
  };

  const handlePermissionCancel = () => {
    setPermissionExpanded(false);
  };

  const actionIcon =
    tab.recordingScope === "recording"
      ? <Eye />
      : tab.recordingScope === "excluded"
        ? <EyeSlash />
        : <EyeClosed />;

  const domain = new URL(tab.url).hostname;

  return (
    <Card
      shadow="sm"
      className="border border-default-200"
    >
      <CardBody className="p-4">
        {/* Main row */}
        <div className="flex flex-row items-center gap-4">
          {/* Favicon */}
          <div className="shrink-0">
            {favicon ? (
              <img
                src={favicon}
                alt={tab.title ?? tab.origin}
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <div className="
                flex h-11 w-11 items-center justify-center
                rounded-xl bg-success
                text-lg font-semibold text-white
              ">
                {tab.title?.charAt(0)?.toUpperCase() ?? ""}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <p className="
              flex min-w-0 items-center gap-2
              text-base font-semibold
            ">
              <span
                className="
                  cursor-pointer truncate
                  text-primary hover:underline
                "
                onClick={openTab}
              >
                {tab.title}
              </span>

              {!tab.connected && (
                <span
                  className="
                    inline-flex items-center gap-1
                    text-xs text-warning
                  "
                  title="
                    Extension is not connected to this page.
                    Reload the page to reconnect.
                  "
                >
                  <LinkSlash />
                  Disconnected · Need to reload the page
                </span>
              )}
            </p>

            <p className="truncate text-sm text-default-500">
              {tab.origin}
            </p>
          </div>

          {/* Status */}
          <div
            className={`
              text-sm font-medium
              ${statusTextColor[displayStatus]}
            `}
          >
            {statusLabel[displayStatus]}
          </div>

          {/* Toggle */}
          <Button
            className={statusTextColor[displayStatus]}
            isIconOnly
            variant="bordered"
            onPress={handleAction}
          >
            {actionIcon}
          </Button>
        </div>

        {/* Permission confirmation */}
        {permissionExpanded && (
          <div className="
            mt-4
            border-t border-default-200
            pt-4
          ">
            <p className="mb-3 text-sm text-default-600">
              Capturing{" "}
              <span className="font-semibold text-default-800">
                {domain}
              </span>{" "}
              this session. Save to your defaults for next time?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="light"
                onPress={handlePermissionCancel}
              >
                Not now
              </Button>

              <Button
                size="sm"
                color="primary"
                onPress={handlePermissionConfirm}
              >
                Allow
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
