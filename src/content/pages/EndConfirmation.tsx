import { Button } from '@heroui/button';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter
} from "@heroui/card";

import { SquareFill } from '@gravity-ui/icons';

import {
  cancelSessionEndRequest,
  endSession,
 } from "../message/backgroundClient";
import { useAppContext } from "../context/context";


export function EndConfirmation() {
  const { showNotice } = useAppContext();

  const handleCancelSessionEndRequest = async () => {
    try {
      await cancelSessionEndRequest();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession();
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
            onPress={handleCancelSessionEndRequest}
          >
            Cancel
          </Button>
          <Button
            className="w-full border border-rose-200 text-red-600 font-medium"
            variant="bordered"
            startContent={<SquareFill />}
            onPress={handleEndSession}
          >
            End & upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}