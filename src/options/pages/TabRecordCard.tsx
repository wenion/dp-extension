import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { addToast } from "@heroui/toast";

import {
  Eye,
  EyeClosed,
  EyeSlash,
  LinkSlash,
} from "@gravity-ui/icons";

type TabRecordCardProps = {
  tabId: number;

  origin: string;
  title?: string;

  recordingScope: "recording" | "excluded" | "not_in_scope";
  connected: boolean;

  favicon?: string;
  captureState: "recording" | "paused";

  onIncludeTab?: (tabId: number) => void;
  onExcludeTab?: (tabId: number) => void;
  onRequestPermission?: (tabId: number) => void;
};

export function TabRecordCard({
  tabId,
  title,
  origin,
  favicon,
  connected,
  captureState,
  recordingScope,
  onIncludeTab,
  onExcludeTab,
  onRequestPermission,
}: TabRecordCardProps) {
  const displayStatus =
    recordingScope === "recording"
      ? captureState
      : recordingScope;

  const statusTextColor = {
    recording: "text-red-600",
    paused: "text-amber-700",
    excluded: "text-default-700",
    not_in_scope: "text-default-500",
  } as const;

  const statusLabel = {
    recording: "RECORDING",
    paused: "PAUSED",
    excluded: "EXCLUDED",
    not_in_scope: "NOT IN SCOPE",
  } as const;

  const action =
    recordingScope === "recording"
      ? {
          icon: <Eye />,
          onPress: onExcludeTab,
        }
      : recordingScope === "excluded"
      ? {
          icon: <EyeSlash />,
          onPress: onIncludeTab,
        }
      : {
          icon: <EyeClosed />,
          onPress: onRequestPermission,
        };

  const openTab = async (tabId: number) => {
    try {
      const tab = await chrome.tabs.get(tabId);

      await chrome.windows.update(tab.windowId, {
        focused: true,
      });

      await chrome.tabs.update(tabId, {
        active: true,
      });
    } catch {
      addToast({
        title: "Unable to open tab",
        description: "This tab no longer exists.",
        color: "danger",
      });
    }
  }

  return (
    <Card shadow="sm" className="border border-default-200">
      <CardBody className="flex flex-row items-center gap-4 p-4">
        {/* Favicon */}
        <div className="shrink-0">
          {favicon ? (
            <img
              src={favicon}
              alt={title ?? origin}
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success text-lg font-semibold text-white">
              {title?.charAt(0)?.toUpperCase() ?? ""}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 min-w-0 text-base font-semibold">
            <span
              className="truncate cursor-pointer text-primary hover:underline"
              onClick={() => openTab(tabId)}
            >
              {title}
            </span>

            {!connected && (
              <span
                className="inline-flex items-center gap-1 text-warning text-xs "
                title="Extension is not connected to this page. Reload the page to reconnect."
              >
                <LinkSlash />
                Disconnected · Need to reload the page
              </span>
            )}
          </p>
          <p className="truncate text-sm text-default-500">{origin}</p>
        </div>

        {/* Status */}
        <div
          className={`text-sm font-medium ${statusTextColor[displayStatus]}`}
        >
          {statusLabel[displayStatus]}
        </div>

        {/* Toggle */}
        <Button
          className={statusTextColor[displayStatus]}
          isIconOnly
          variant="bordered"
          onPress={() => action.onPress?.(tabId)}
        >
          {action.icon}
        </Button>
      </CardBody>
    </Card>
  );
}
