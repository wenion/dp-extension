import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@heroui/card";
import { Divider } from "@heroui/divider";

import {
  ChevronDown,
  CircleFill,
  Eye,
  EyeClosed,
  EyeSlash,
  LayoutHeader,
  PauseFill,
  PlayFill,
  SquareFill,
} from "@gravity-ui/icons";

import {
  addToAllowlist,
  collapsePanel,
  excludeTab,
  includeTab,
  openOptionsPage,
  pauseSession,
  promptHostPermission,
  resumeSession,
  requestSessionEnd,
} from "../message/backgroundClient";
import { useAppContext } from "../context/context";


export function Expanded() {
  const {
    activeSession,
    currentTab,
    numberOfRecordingTabs,
    showDialog,
    hideDialog,
    showNotice,
  } = useAppContext();

  const handleAddToAllowlist = async () => {
    try {
      await addToAllowlist();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleCollapsePanel = async () => {
    try {
      await collapsePanel();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleExcludeTab = async () => {
    try {
      await excludeTab();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleIncludeTab = async () => {
    try {
      await includeTab();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleOpenOptionsPage = async () => {
    try {
      await openOptionsPage();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handlePauseSession = async () => {
    try {
      await pauseSession();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handlePromptHostPermission = async () => {
    try {
      await promptHostPermission();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleResumeSession = async () => {
    try {
      await resumeSession();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleRequestEndSession = async () => {
    try {
      await requestSessionEnd();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const promptTemporaryPermission = async () => {
    if (!currentTab?.url) {
      return;
    }

    const domain = new URL(currentTab.url).hostname;

    await handleIncludeTab();

    showDialog({
      message: `Capturing ${domain} this session. Save to your defaults for next time?`,
      confirmText: "Save",
      cancelText: "Not now",

      onConfirm: async () => {
        await handleAddToAllowlist();
        hideDialog();
      },

      onCancel: hideDialog,
    });
  }

  const action =
    currentTab?.recordingScope === "recording"
      ? {
          icon: <Eye />,
          onPress: handleExcludeTab,
          text:
            activeSession?.captureState === "recording"
              ? "recording"
              : "paused",
          className:
            activeSession?.captureState === "recording"
              ? "text-red-600"
              :" text-amber-700",
        }
      : currentTab?.recordingScope === "excluded"
      ? {
          icon: <EyeSlash />,
          onPress: handleIncludeTab,
          text: "excluded",
          className: "text-default-500",
        }
      : currentTab?.recordingScope === "not_in_scope"
      ? {
          icon: <EyeClosed />,
          onPress: promptTemporaryPermission,
          text: "not in scope",
          className: "text-default-500",
        }
      : currentTab?.recordingScope === "no_permission"
      ? {
          icon: <EyeClosed />,
          onPress: handlePromptHostPermission,
          text: "not in scope",
          className: "text-default-500",
        }
      : {
          icon: <EyeClosed />,
          text: "this URL is not supported",
          className: "text-default-500",
      };

  return (
    <div className="flex items-center">
      <Card 
        className='border-default border-medium w-80'
        shadow="none"
      >
        <CardHeader className="flex py-2 justify-between items-center">
          {activeSession?.captureState === "recording" ? (
            <div className="flex gap-x-2 items-center text-red-600">
              <CircleFill />
              <p>Recording</p>
            </div>
          ): (
            <div className="flex gap-x-2 items-center text-amber-700">
              <PauseFill/>
              <p>Paused</p>
            </div>
            )
          }

          <div className="flex gap-x-2 items-center">
            <Button
              color="default"
              variant="bordered"
              size="sm"
              startContent={<LayoutHeader/>}
              onPress={handleOpenOptionsPage}
            >
              {numberOfRecordingTabs}
            </Button>
            <Button
              isIconOnly
              variant="bordered"
              size="sm"
              onPress={handleCollapsePanel}
            >
              <ChevronDown />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="pb-4 px-4">
          <div className='flex gap-x-4'>
            {activeSession?.captureState === "recording" ? (
              <Button
                className="w-full border border-amber-400 text-amber-700 font-medium"
                variant="bordered"
                startContent={<PauseFill/>}
                onPress={handlePauseSession}
              >
                Pause
              </Button>
            ): (
              <Button
                className="w-full border border-amber-400 text-amber-700 font-medium"
                variant="bordered"
                startContent={<PlayFill/>}
                onPress={handleResumeSession}
              >
                Resume
              </Button>
            )}
            <Button
              className="w-full border border-rose-200 text-red-600 font-medium"
              variant="bordered"
              startContent={<SquareFill />}
              onPress={handleRequestEndSession}
            >
              Stop
            </Button>
          </div>
          {(!activeSession || activeSession.captureState === "paused") && (
            <p className="pt-2 text-sm text-amber-700">Capture suspended — no events recorded while paused.</p>)}
        </CardBody>
        <Divider/>
        <CardFooter className="py-2">
          <div className='flex gap-x-4 items-center'>
            {action && (
              <>
                <Button
                  isIconOnly
                  variant="bordered"
                  size="sm"
                  className={`${action.className} border`}
                  onPress={action.onPress}
                >
                  {action.icon}
                </Button>

                <span>
                  This tab ·{" "}
                  <span
                    className={`${action.className} font-medium`}
                  >
                    {action.text}
                  </span>
                </span>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
