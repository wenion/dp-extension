import { Button } from "@heroui/button";

import {
  CircleFill,
  Eye,
  EyeClosed,
  EyeSlash,
  LayoutHeader,
  PauseFill,
} from "@gravity-ui/icons";

import { useAppContext } from "../context/context";
import { expand } from "../message/BackgroundClient";

export function Collapsed() {
  const {
    currentTab,
    numberOfRecordingTabs,
    session,
  } = useAppContext();

  const scopeIcon =
    currentTab?.recordingScope === "recording" ? (
      <Eye />
    ) : currentTab?.recordingScope === "excluded" ? (
      <EyeSlash />
    ) : (
      <EyeClosed />
    );

  return (
    <div className="flex items-center justify-center">
      <Button
        className='gap-4'
        color="default"
        variant="bordered"
        startContent={
          session && session.captureState === "recording" ? (
            <CircleFill className='text-red-600'/>
          ) : (
            <PauseFill className='text-amber-700'/>
          )
        }
        endContent={
          <div className='flex gap-x-1 items-center justify-center'>
            <LayoutHeader />
            <span>{numberOfRecordingTabs}</span>
          </div>
        }
        onPress={expand}
      >
        {scopeIcon}
      </Button>
    </div>
  );
}
