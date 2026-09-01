import { Button } from "@/components/Button";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@/components/Card";

import { TriangleExclamation } from '@gravity-ui/icons';

import { completeUploadFailedSession } from "../message/backgroundClient";
import { useAppContext } from "../context/context";


export function UploadFailed() {
  const { showNotice } = useAppContext();

  const handleCompleteUploadFailedSession = async () => {
    try {
      await completeUploadFailedSession();
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
      <Card className="border-2 border-gray-300 w-80">
        <CardHeader className="flex flex-col items-center justify-center gap-2 py-3">
          <TriangleExclamation width={80} height={80} color="yellow"/>
          <p className="font-bold">Upload failed</p>
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
            onPress={handleCompleteUploadFailedSession}
          >
            Done
          </Button>
        </CardFooter>
      </Card>      
    </div>
  );
}
