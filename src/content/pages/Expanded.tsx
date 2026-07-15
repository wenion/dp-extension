import { Button } from '@heroui/button';
import { Divider } from "@heroui/divider";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";

import { CircleFill } from '@gravity-ui/icons';
import { ChevronDown } from '@gravity-ui/icons';
import { PlayFill } from '@gravity-ui/icons';
import { Eye } from '@gravity-ui/icons';
import { EyeSlash } from '@gravity-ui/icons';
import { EyeClosed } from '@gravity-ui/icons';
import { PauseFill } from '@gravity-ui/icons';
import { SquareFill } from '@gravity-ui/icons';
import { LayoutHeader } from '@gravity-ui/icons';

import { useAppContext } from "../context/context";
import {
  collapse,
  pause,
  resume,
  stop,
  includeTab,
  excludeTab,
  openOptionsPage,
 } from "../message/BackgroundClient";


export function Expanded() {
  const { session, currentTab, numberOfRecordingTabs } = useAppContext();
  const action =
    currentTab?.recordingStatus === "recording"
      ? {
          icon: <Eye />,
          onPress: excludeTab,
          text: session?.captureState === "recording"? "Recording" : "Paused",
          className: session?.captureState === "recording"? "text-red-600":" text-amber-700",
        }
      : currentTab?.recordingStatus === "excluded"
      ? {
          icon: <EyeSlash />,
          onPress: includeTab,
          text: "Excluded",
          className: "text-default-500",
        }
      : currentTab?.recordingStatus === "not_in_scope"
      ? {
          icon: <EyeClosed />,
          text: "Permission required",
          className: "text-default-500",
        }
      : null;

  return (
    <div className="flex items-center">
      <Card className='border-default border-medium w-80' shadow="none">
        <CardHeader className="flex py-2 justify-between items-center">
          {/* <div className="flex gap-x-2 items-center"> */}
          {session && session.captureState === "recording" ? (
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
          {/* </div> */}
          <div className="flex gap-x-2 items-center">
            <Button
              color="default"
              variant="bordered"
              size="sm"
              startContent={<LayoutHeader/>}
              onPress={openOptionsPage}
            >
              {numberOfRecordingTabs}
            </Button>
            <Button
              isIconOnly
              variant="bordered"
              size="sm"
              onPress={collapse}
            >
              <ChevronDown />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="pb-4 px-4">
          <div className='flex gap-x-4'>
            {session && session.captureState === "recording" ? (
              <Button
                className="w-full border border-amber-400 text-amber-700 font-medium"
                variant="bordered"
                startContent={<PauseFill/>}
                onPress={pause}
              >
                Pause
              </Button>
            ): (
              <Button
                className="w-full border border-amber-400 text-amber-700 font-medium"
                variant="bordered"
                startContent={<PlayFill/>}
                onPress={resume}
              >
                Resume
              </Button>
            )}
            <Button
              className="w-full border border-rose-200 text-red-600 font-medium"
              variant="bordered"
              startContent={<SquareFill />}
              onPress={stop}
            >
              Stop
            </Button>
          </div>
          {(!session || session.captureState === "paused") && (
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
                  This tab · <span className={`${action.className} font-medium`}>{action.text}</span>
                </span>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}