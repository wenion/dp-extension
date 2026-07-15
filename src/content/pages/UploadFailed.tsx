import { Button } from '@heroui/button';
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";

import { TriangleExclamation } from '@gravity-ui/icons';

import { finish } from "../message/BackgroundClient";

export function UploadFailed() {
  return (
    <div className="flex gap-4 items-center">
      <Card className='border-default border-medium w-80'>
        <CardHeader className="flex flex-col gap-x-4  py-1 justify-center">
          <TriangleExclamation width={80} height={80} color="yellow"/>
          <p className="font-bold ">Upload failed</p>
        </CardHeader>

        <CardBody className="py-1 px-4">
          <p className="text-sm text-center">
            We couldn't upload this session. Your recording has been saved
            locally and you can retry uploading later.
          </p>
        </CardBody>

        <CardFooter className="flex justify-center">
          <Button
            className="w-full"
            color="default"
            variant="bordered"
            onPress={finish}
          >
            Done
          </Button>
        </CardFooter>
      </Card>      
    </div>
  );
}