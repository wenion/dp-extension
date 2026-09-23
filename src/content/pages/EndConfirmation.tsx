import { useState } from "react";

import { Button } from "@/components/Button";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter
} from "@/components/Card";
import { Input } from "@/components/Input";

import { ArrowUpFromLine } from '@gravity-ui/icons';

import {
  cancelSessionEndRequest,
  endSession,
 } from "../message/backgroundClient";
import { useAppContext } from "../context/context";


export function EndConfirmation() {
  const {
    activeSession,
    numberOfRecordingTabs,
    showNotice,
  } = useAppContext();

  const [sessionName, setSessionName] = useState("");

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

  const handleCancelSessionEndRequest = async () => {
    try {
      await cancelSessionEndRequest();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession(
        sessionName.trim() || undefined,
      );
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
            End session?
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
            Recording stops and the session uploads to the database.
          </p>

          <div className="mt-2">
            <label
              htmlFor="session-name"
              className="block mb-1 text-sm font-bold"
            >
              Session name
            </label>

            <Input
              type="text"
              value={sessionName}
              onChange={(event) =>
                setSessionName(event.target.value)
              }
              placeholder="Enter session name"
              maxLength={100}
              disabled={false}
            />
          </div>
        </CardBody>

        <CardFooter className="flex gap-4 justify-between items-center">
          <Button
            className="w-full h-11 px-5 border font-medium"
            onPress={handleCancelSessionEndRequest}
          >
            Keep recording
          </Button>

          <Button
            className="w-full px-0 h-11 border bg-red-700 text-white text-xs font-medium hover:bg-red-500"
            startContent={<ArrowUpFromLine />}
            onPress={handleEndSession}
          >
            End & upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}