import { Button } from "@/components/Button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@/components/Card";

import { PauseFill } from '@gravity-ui/icons';
import { SquareFill } from '@gravity-ui/icons';

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
      <Card className='border-2 border-gray-300 w-80' shadow="none">
        <CardHeader className="py-2">
          <span className="text-lg font-bold">Turn off extension?</span>
        </CardHeader>
        <CardBody className="p-2">
          <p className="text-sm">Your active session will stop and upload first, then the puck is removed.</p>
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
            className="w-full h-11 px-5 border text-red-600 font-medium"
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
