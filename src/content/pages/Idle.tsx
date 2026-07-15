import { Button } from '@heroui/button';
import { TriangleRightFill } from '@gravity-ui/icons';

import { startSession } from "../message/BackgroundClient";


export function Idle() {
  return (
    <div className="flex gap-4 items-center">
      <Button
        className="border-default border-medium"
        color="default"
        variant="bordered"
        startContent={<TriangleRightFill />}
        onPress={startSession}
      >
        Start session
      </Button>
    </div>
  );
}