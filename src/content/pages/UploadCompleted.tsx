import { Button } from '@heroui/button';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from "@heroui/card";

import { CircleCheck } from '@gravity-ui/icons';

import { completeUploadedSession } from "../message/BackgroundClient";

export function UploadCompleted() {
  return (
    <div className="flex gap-4 items-center">
      <Card className='border-default border-medium w-80'>
        <CardHeader className="flex flex-col gap-x-4  py-1 justify-center">
          <CircleCheck width={80} height={80} color="green"/>
          <p className="font-bold ">Session uploaded</p>
        </CardHeader>
        <CardBody className="py-1 px-4">
          <p className="text-sm text-center">
            All events confirmed. The extension stays on, ready for another session.
          </p>
        </CardBody>
        <CardFooter className="flex justify-center">
          <Button
            className="w-full"
            color="default"
            variant="bordered"
            onPress={completeUploadedSession}
          >
            Done
          </Button>
        </CardFooter>
      </Card>      
    </div>
  );
}