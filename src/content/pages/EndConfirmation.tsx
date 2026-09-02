import { Button } from "@/components/Button";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter
} from "@/components/Card";

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
      <Card className="w-80" shadow="none">
        <CardHeader className="py-2">
          <span className="text-lg font-bold">End session?</span>
        </CardHeader>
        <CardBody className="p-2">
          <p className="text-sm">Recording stops and the session uploads to the database.</p>
        </CardBody>
        <CardFooter className="flex gap-4 justify-between items-center">
          <Button
            className="w-full h-11 px-5 border font-medium"
            onPress={handleCancelSessionEndRequest}
          >
            Cancel
          </Button>
          <Button
            className="w-full h-11 px-5 border border-rose-200 text-red-600 font-medium"
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