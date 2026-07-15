import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { addToast } from "@heroui/toast";

import { Eye, EyeSlash, EyeClosed } from '@gravity-ui/icons';

type TabRecordCardProps = {
  tabId: number;
  title?: string;
  domain: string;
  favicon?: string;
  captureState: "recording" | "paused";
  recordingStatus: "recording" | "excluded" | "not_in_scope";
  onincludeTab?: (tabId: number) => void;
  onExcludeTab?: (tabId: number) => void;
  onRequestPermission?: (tabId: number) => void;
};

export function TabRecordCard({
  tabId,
  title,
  domain,
  favicon,
  captureState,
  recordingStatus,
  onincludeTab,
  onExcludeTab,
  onRequestPermission,
}: TabRecordCardProps) {
  const displayStatus =
    recordingStatus === "recording"
      ? captureState
      : recordingStatus;

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
    recordingStatus === "recording"
      ? {
          icon: <Eye />,
          onPress: onExcludeTab,
        }
      : recordingStatus === "excluded"
      ? {
          icon: <EyeSlash />,
          onPress: onincludeTab,
        }
      : {
          icon: <EyeClosed />,
          onPress: onRequestPermission,
        };

  const openTab = async(tabId: number) => {
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
              alt={title}
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
          <p
            className="truncate text-base font-semibold text-primary cursor-pointer hover:underline"
            onClick={() => openTab(tabId)}
          >
            {title}
          </p>
          <p className="truncate text-sm text-default-500">{domain}</p>
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
