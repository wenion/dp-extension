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
import { expandPanel } from "../message/backgroundClient";


export function Collapsed() {
  const {
    currentTab,
    numberOfRecordingTabs,
    activeSession,
    showNotice,
  } = useAppContext();

  const handleExpandPanel = async () => {
    try {
      await expandPanel();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

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
          activeSession?.captureState === "recording" ? (
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
        onPress={handleExpandPanel}
      >
        {scopeIcon}
      </Button>
    </div>
  );
}
