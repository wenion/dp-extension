import {
  useEffect,
  useState,
} from "react";
// HeroUI
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";

// Icons
import {
  Check,
  CircleFill,
  PauseFill,
  PlayFill,
  SquareFill,
  TriangleExclamationFill,
  TriangleRightFill,
} from "@gravity-ui/icons";

import { useAppContext } from "../context/context";

// Background actions
import {
  cancelStop,
  endSession,
  excludeTab,
  finishUploaded,
  finishFailed,
  exit,
  includeTab,
  pause,
  permissionGranted,
  resume,
  startSession,
  stop,
  nameSession,
} from "../message/BackgroundClient";

import { TabRecordCard } from "./TabRecordCard";

import type { TabState } from "@/shared/types";

export function Status() {
  const { page, session, tabs, numberOfRecordingTabs } = useAppContext();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    setName(session?.name ?? "");
  }, [session?.name]);

  const commitName = () => {
    const trimmed = name.trim();

    if (
      session &&
      trimmed !== "" &&
      trimmed !== (session.name ?? "")
    ) {
      nameSession(
        session.clientId,
        trimmed
      );
    }
  };

  const requestTabPermission = async (tabId: number) => {
    const tab = tabs.find(tab => tab.tabId === tabId);

    if (!tab) return;

    const url = new URL(tab.url);
    const originPattern = `${url.origin}/*`;

    const granted = await chrome.permissions.request({
      permissions: ["scripting"],
      origins: [originPattern],
    });

    if (granted) {
      await permissionGranted(url.origin);
    }
  }

  const isHttpTab = (tab: TabState) => {
    try {
      const protocol = new URL(tab.url).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }

  switch (page) {
    case "idle":
      return (
        <div className="flex rounded-xl border-default border-medium border-dashed p-4 items-center justify-between gap-4">
          <span>No session running — start one to begin capturing.</span>
          <div className="flex gap-4 items-center">
            <Button
              color="danger"
              startContent={<TriangleRightFill />}
              onPress={startSession}
            >
              Start session
            </Button>
          </div>
        </div>
      )
    case "collapsed":
    case "expanded":
      return (
        <div className="flex flex-col rounded-xl border border-amber-400 ring-4 ring-orange-100 p-4 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-x-2 items-center">
            {session && session.captureState === "recording" ? (
              <>
                <CircleFill color='red'/>
                <p className="font-medium">Recording</p>
              </>
            ): (
              <>
                <PauseFill color="#b25e00"/>
                <p className="text-amber-700 font-medium">Paused</p>
              </>
              )
            }
            </div>
            <div className="flex gap-4 items-center">
              {numberOfRecordingTabs} tab{numberOfRecordingTabs === 1 ? "" : "s"} recording
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {session && session.captureState === "recording" ? (
              <Button
                className="border border-amber-400 text-amber-700 font-medium"
                variant="bordered"
                startContent={<PauseFill/>}
                onPress={pause}
              >
                Pause
              </Button>
            ) : (
              <Button
                className="border border-amber-400 text-amber-700 font-medium"
                variant="bordered"
                startContent={<PlayFill/>}
                onPress={resume}
              >
                Resume
              </Button>
            )}
            <Button
              className="border border-rose-200 text-red-600 font-medium"
              variant="bordered"
              startContent={<SquareFill />}
              onPress={stop}
            >
              Stop & upload
            </Button>
          </div>
          {(!session || session.captureState === "paused") && (
            <h2 className="text-sm text-amber-700">
              Capture suspended — no events recorded while paused.
            </h2>
          )}

          <Input
            variant="bordered"
            placeholder="Name this session...(optional)"
            value={name}
            onValueChange={setName}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          />

          <div className="flex flex-col gap-4">
            <span>TABS IN THIS SESSION</span>
            {tabs
              .filter(isHttpTab)
              .map(tab => (
                <TabRecordCard
                  key={tab.tabId}
                  tabId={tab.tabId}
                  origin={tab.origin}
                  title={tab.title}
                  recordingScope={tab.recordingScope}
                  connected={tab.connected}
                  captureState={session?.captureState??"paused"}
                  onIncludeTab={includeTab}
                  onExcludeTab={excludeTab}
                  onRequestPermission={requestTabPermission}
                />
            ))}
          </div>
        </div>
      )
    case "alert":
      return (
        <Card
          shadow="sm"
          className="border border-amber-400 ring-4 ring-orange-100"
        >
          <CardBody className="space-y-5 p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Turn off extension?
              </h3>

              <p className="mt-1 text-sm text-default-500">
                Your active session will stop and upload first, then the puck is removed.
              </p>
            </div>

            <div className="flex justify-start gap-3">
              <Button
                className="border font-medium"
                variant="bordered"
                onPress={cancelStop}
              >
                Cancel
              </Button>

              <Button
                className="border border-rose-200 text-red-600 font-medium"
                variant="bordered"
                startContent={<SquareFill />}
                onPress={exit}
              >
                Turn off &amp; Upload
              </Button>
            </div>
          </CardBody>
        </Card>
      )
    case "confirm":
      return (
        <Card
          shadow="sm"
          className="border border-amber-400 ring-4 ring-orange-100"
        >
          <CardBody className="space-y-5 p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                End session?
              </h3>

              <p className="mt-1 text-sm text-default-500">
                Recording stops and the session uploads to the database.
              </p>
            </div>

            <div className="flex justify-start gap-3">
              <Button
                className="border font-medium"
                variant="bordered"
                onPress={cancelStop}
              >
                Cancel
              </Button>

              <Button
                className="border border-rose-200 text-red-600 font-medium"
                variant="bordered"
                startContent={<SquareFill />}
                onPress={endSession}
              >
                End &amp; Upload
              </Button>
            </div>
          </CardBody>
        </Card>
      )
    case "uploading":
      return (
        <Alert variant="bordered" icon={<Spinner />}>Uploading session...</Alert>
      )
    case "uploaded":
      return (
        <Card
          shadow="sm"
          className="border border-green-200 ring-2 ring-green-50"
        >
          <CardBody className="space-y-5 p-5">
            <div className="flex items-center gap-x-2">
              <Check className="text-green-700"/>
              <h3 className="text-sm font-semibold text-foreground text-green-700">
                Session uploaded to the database.
              </h3>
            </div>

            <div className="flex justify-start gap-3">
              <Button
                className="border font-medium"
                variant="bordered"
                onPress={finishUploaded}
              >
                Done
              </Button>
            </div>
          </CardBody>
        </Card>
      )
    case "uploadFailed":
      return (
        <Card
          shadow="sm"
          className="border border-danger-200 bg-danger-50"
        >
          <CardBody className="space-y-5 p-5">
            <div className="flex items-start gap-2">
              <TriangleExclamationFill
                className="mt-0.5 text-danger"
              />

              <h3 className="text-sm font-medium text-danger-700">
                Upload failed. We couldn't upload this session. Your recording
                has been saved locally, and you can retry uploading later.
              </h3>
            </div>

            <div className="flex justify-start gap-3">
              <Button
                variant="bordered"
                color="danger"
                className="font-medium"
                onPress={finishFailed}
              >
                Done
              </Button>
            </div>
          </CardBody>
        </Card>
      );
    default:
      return (
        <div className="p-2 border-default border-medium">
          <span>Unknown Status</span>
        </div>
      )
  }
}
