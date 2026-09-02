import { Button } from "@/components/Button";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from "@/components/Card";

import { CircleCheck } from '@gravity-ui/icons';

import { completeUploadedSession } from "../message/backgroundClient";
import { useAppContext } from "../context/context";


export function UploadCompleted() {
  const { showNotice } = useAppContext();

  const handleCompleteUploadedSession = async () => {
    try {
      await completeUploadedSession();
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
      <Card className="w-80">
        <CardHeader className="flex flex-col items-center justify-center gap-2 py-3 text-green-600">
          <CircleCheck width={80} height={80} color="green"/>
          <p className="font-bold">Session uploaded</p>
        </CardHeader>
        <CardBody className="py-1 px-4">
          <p className="text-sm text-center">
            All events confirmed. The extension stays on, ready for another session.
          </p>
        </CardBody>
        <CardFooter className="flex justify-center">
          <Button
            className="w-full"
            onPress={handleCompleteUploadedSession}
          >
            Done
          </Button>
        </CardFooter>
      </Card>      
    </div>
  );
}
