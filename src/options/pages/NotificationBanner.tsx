import { env } from "@/config/env";

import { Alert, type AlertProps } from "@heroui/alert";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";

import {
  CircleInfoFill as InfoIcon,
  TriangleExclamationFill as WarningIcon,
  CircleCheckFill as CheckCircleIcon,
  SquareExclamation as ErrorIcon,
  CircleXmark as CloseIcon,
  Link as LinkIcon,
} from '@gravity-ui/icons';
import {
  permissionGranted,
 } from "../message/BackgroundClient"; 
import { useAppContext } from "../context/context";
import { dismissNotification } from "../message/BackgroundClient";

import {
  NotificationAction,
  NotificationLevel,
  type NotificationLevel as NotificationLevelType,
} from "@/shared/types";

// const levelIcons = {
//   [NotificationLevel.Info]: (
//     <InfoIcon className="h-5 w-5 text-primary" />
//   ),
//   [NotificationLevel.Success]: (
//     <CheckCircleIcon className="h-5 w-5 text-success" />
//   ),
//   [NotificationLevel.Warning]: (
//     <WarningIcon className="h-5 w-5 text-warning" />
//   ),
//   [NotificationLevel.Error]: (
//     <ErrorIcon className="h-5 w-5 text-danger" />
//   ),
// };
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
    currentNotification.tabId === undefined
      ? undefined
      : tabs.find(
          t => t.tabId === currentNotification.tabId,
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
    if (
      !currentNotification.action ||
      !tab
    ) {
      return;
    }

    switch (currentNotification.action.type) {
      case NotificationAction.GrantHostPermission: {
        try {
          const url = new URL(tab.url);

          const granted =
            await chrome.permissions.request({
              permissions: ["scripting"],
              origins: [`${url.origin}/*`],
            });

          if (granted) {
            const result =
              await permissionGranted(url.origin);
            await dismissNotification(
              currentNotification.id,
            );
          }
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

      {(tab || currentNotification.action) && (
        <>
          <CardFooter className="flex items-center space-x-8 px-8 pb-3 pt-0">

            {tab ? (
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
            ) : (
              <span />
            )}

            {tab && currentNotification.action && (
              <Button
                size="sm"
                color="danger"
                onPress={performNotificationAction}
              >
                {currentNotification.action.label}
              </Button>
            )}

          </CardFooter>
        </>
      )}

    </Card>
  );
}