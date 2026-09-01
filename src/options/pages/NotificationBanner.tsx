import { env } from "@/config/env";

import type { AlertProps } from "@heroui/alert";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Link as LinkIcon } from "@gravity-ui/icons";

import {
  NotificationAction,
  NotificationLevel,
  type NotificationLevel as NotificationLevelType,
} from "@/shared/types";

import { useAppContext } from "../context/context";
import {
  dismissNotification,
} from "../message/BackgroundClient";

const alertColors: Record<
  NotificationLevelType,
  NonNullable<AlertProps["color"]>
> = {
  [NotificationLevel.Info]: "primary",
  [NotificationLevel.Success]: "success",
  [NotificationLevel.Warning]: "warning",
  [NotificationLevel.Error]: "danger",
};

export function NotificationBanner() {
  const {
    currentNotification,
    tabs,
  } = useAppContext();

  if (!currentNotification) {
    return null;
  }

  const tab =
    currentNotification.action?.tabId === undefined
      ? undefined
      : tabs.find(
          t => t.tabId === currentNotification.action?.tabId,
        );

  const openTab = async () => {
    if (!tab) {
      return;
    }

    try {
      const chromeTab = await chrome.tabs.get(tab.tabId);

      await chrome.windows.update(
        chromeTab.windowId,
        {
          focused: true,
        },
      );

      await chrome.tabs.update(
        tab.tabId,
        {
          active: true,
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  const performNotificationAction = async () => {
    if (!currentNotification.action) {
      return;
    }

    switch (currentNotification.action.type) {
      case NotificationAction.GrantHostPermission: {
        if (!tab) {
          return;
        }

        try {
          const url = new URL(tab.url);

          // const granted =
          //   await chrome.permissions.request({
          //     permissions: ["scripting"],
          //     origins: [`${url.origin}/*`],
          //   });

          // if (granted) {
          //   const result =
          //     await permissionGranted(url.origin);
          //   await dismissNotification(
          //     currentNotification.id,
          //   );
          // }
        } catch (error) {
          console.error(error);
        }

        break;
      }
      case NotificationAction.SignIn: {
        try {
          const url = new URL("/login", env.apiUrl);

          url.searchParams.set("from", "extension");
          url.searchParams.set("ext", chrome.runtime.id);

          chrome.tabs.create({ url: url.href });
        } catch (error) {
          console.error(error);
        }

        break;
      }
    }

    // window.location.reload();
  };

  return (
    <Card shadow="sm" className="mb-4">

      <CardHeader className="flex items-start justify-between">

        <Alert
          color={alertColors[currentNotification.level]}
          title={currentNotification.title}
          isClosable={currentNotification.dismissible}
          onClose={
            currentNotification.dismissible
              ? () => dismissNotification(currentNotification.id)
              : undefined
          }
        >
          {currentNotification.message}
        </Alert>

      </CardHeader>

      {(currentNotification.action) && (
        <>
          <CardFooter className="flex items-center space-x-8 pb-3 pt-0">

            {tab && (
              <Chip
                variant="flat"
                startContent={<LinkIcon />}
              >
                <Link
                  isExternal={false}
                  onPress={openTab}
                  className="max-w-xs truncate cursor-pointer"
                >
                  {new URL(tab.url).hostname}
                </Link>
              </Chip>
            )}

            <Button
              size="sm"
              color="danger"
              onPress={performNotificationAction}
            >
              {currentNotification.action.label}
            </Button>

          </CardFooter>
        </>
      )}

    </Card>
  );
}