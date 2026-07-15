import { ButtonGroup, Button } from '@heroui/button';
import { Card, CardBody } from "@heroui/card";

import { CircleFill } from '@gravity-ui/icons';
import { CircleStopFill } from '@gravity-ui/icons';
import { Eye } from '@gravity-ui/icons';
import { EyeClosed } from '@gravity-ui/icons';
import { PauseFill } from '@gravity-ui/icons';
import { LayoutHeader } from '@gravity-ui/icons';

import { expand } from "../message/BackgroundClient";
import { useAppContext } from "../context/context";


export function Collapsed() {
  const { session, numberOfRecordingTabs } = useAppContext();
   
  return (
    <div className="flex items-center justify-center">
      <Button
        className='gap-4'
        color="default"
        variant="bordered"
        startContent={session && session.captureState === "recording" ? <CircleFill className='text-red-600'/> : <PauseFill className='text-amber-700'/>}
        endContent={
          <div className='flex gap-x-1 items-center justify-center'>
            <LayoutHeader />
            <span>{numberOfRecordingTabs}</span>
          </div>
        }
        onPress={expand}
      >
        <Eye/>
      </Button>
    </div>
  );
}