import { Button } from "@/components/Button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@/components/Card";

import {
  PauseFill,
  SquareFill,
} from '@gravity-ui/icons';

import {
  cancelSessionExitRequest,
  exitSession,
 } from "../message/backgroundClient";
import { useAppContext } from "../context/context";

 
export function ExitConfirmation() {
  const { showNotice } = useAppContext();

  const handleCancelSessionExitRequest = async () => {
    try {
      await cancelSessionExitRequest();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleExitSession = async () => {
    try {
      await exitSession();
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
      <Card className="w-80" shadow="none">
        <CardHeader className="flex py-2">
          <span className="text-lg font-bold">Turn off extension?</span>
        </CardHeader>

        <CardBody className="px-4 py-0">
          <p className="text-sm">
            Your active session will stop and upload first, then the puck is removed.
          </p>
        </CardBody>

        <CardFooter className="flex gap-4 justify-between items-center">
          <Button
            className="w-full h-11 px-5 border font-medium"
            startContent={<PauseFill/>}
            onPress={handleCancelSessionExitRequest}
          >
            Cancel
          </Button>

          <Button
            className="w-full px-0 h-11 border bg-red-600 text-white font-medium hover:bg-rose-200"
            startContent={<SquareFill />}
            onPress={handleExitSession}
          >
            Turn off & upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
