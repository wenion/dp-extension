import { Button } from '@heroui/button';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";

import { PauseFill } from '@gravity-ui/icons';
import { SquareFill } from '@gravity-ui/icons';

import {
  cancelStop,
  endSession,
 } from "../message/BackgroundClient";


export function Confirm() {
  return (
    <div className="flex gap-4 items-center">
      <Card className='border-default border-medium w-80' shadow="none">
        <CardHeader className="py-2">
          <span className="font-bold">End session?</span>
        </CardHeader>
        <CardBody className="p-2">
          <p className="text-sm">Recording stops and the session uploads to the database.</p>
        </CardBody>
        <CardFooter className="flex gap-4 justify-between items-center">
          <Button
            className="w-full border font-medium"
            variant="bordered"
            onPress={cancelStop}
          >
            Cancel
          </Button>
          <Button
            className="w-full border border-rose-200 text-red-600 font-medium"
            variant="bordered"
            startContent={<SquareFill />}
            onPress={endSession}
          >
            End & upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}