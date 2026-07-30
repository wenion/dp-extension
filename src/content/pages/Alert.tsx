import { Button } from '@heroui/button';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@heroui/card";

import { PauseFill } from '@gravity-ui/icons';
import { SquareFill } from '@gravity-ui/icons';

import {
  cancelStop,
  exit,
 } from "../message/BackgroundClient";
 
export function Alert() {
  return (
    <div className="flex gap-4 items-center">
      <Card className='border-default border-medium w-80' shadow="none">
        <CardHeader className="py-2">
          <span className="font-bold">Turn off extension?</span>
        </CardHeader>
        <CardBody className="p-2">
          <p className="text-sm">Your active session will stop and upload first, then the puck is removed.</p>
        </CardBody>
        <CardFooter className="flex gap-4 justify-between items-center">
          {/* <div className='flex gap-4'> */}
            <Button
              className="w-full border font-medium"
              variant="bordered"
              startContent={<PauseFill/>}
              onPress={cancelStop}
            >
              Cancel
            </Button>
            <Button
              className="w-full border text-red-600 font-medium"
              variant="bordered"
              startContent={<SquareFill />}
              onPress={exit}
            >
              Turn off & upload
            </Button>
          {/* </div> */}
        </CardFooter>
      </Card>
    </div>
  );
}
