import { useState } from "react";

import { Button } from "@/components/Button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@/components/Card";

import { ArrowUpFromLine } from '@gravity-ui/icons';

import {
  cancelSessionExitRequest,
  exitSession,
 } from "../message/backgroundClient";
import { useAppContext } from "../context/context";

 
export function ExitConfirmation() {
  const {
    activeSession,
    numberOfRecordingTabs,
    showNotice,
  } = useAppContext();

  const [duration] = useState(() => {
    if (!activeSession?.startedAt) {
      return "00:00";
    }

    const totalSeconds = Math.floor(
      (
        Date.now() -
        new Date(activeSession.startedAt).getTime()
      ) / 1000,
    );

    const hours = Math.floor(
      totalSeconds / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {
      return [
        hours,
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
      ].join(":");
    }

    return [
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  });

  const handleCancelSessionExitRequest = async () => {
    try {
      await cancelSessionExitRequest();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleExitSession = async () => {
    try {
      await exitSession();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <Card className="w-80" shadow="none">
        <CardHeader className="flex py-2 justify-between items-center">
          <span className="text-lg font-bold">
            Turn off extension?
          </span>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{duration}</span>
            <span>·</span>

            <span>
              {numberOfRecordingTabs}
              {numberOfRecordingTabs > 0 &&
              ` ${numberOfRecordingTabs === 1 ? "tab" : "tabs"}`}
            </span>
          </div>
        </CardHeader>

        <CardBody className="px-4 py-0">
          <p className="text-sm">
            Your active session will stop and upload first, then the puck is removed.
          </p>
        </CardBody>

        <CardFooter className="flex gap-4 justify-between items-center">
          <Button
            className="w-full h-11 px-5 border font-medium"
            onPress={handleCancelSessionExitRequest}
          >
            Keep recording
          </Button>

          <Button
            className="w-full px-0 h-11 border bg-red-700 text-white font-medium hover:bg-red-500"
            startContent={<ArrowUpFromLine />}
            onPress={handleExitSession}
          >
            Exit & upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
