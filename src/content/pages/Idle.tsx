import { Button } from "@/components/Button";

import { TriangleRightFill } from '@gravity-ui/icons';

import { startSession } from "../message/backgroundClient";
import { useAppContext } from "../context/context";


export function Idle() {
  const { showNotice } = useAppContext();

  const handleStartSession = async () => {
    try {
      await startSession();
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
      <Button
        className="bg-white hover:bg-gray-50 active:bg-gray-100 shadow-md"
        startContent={<TriangleRightFill />}
        onPress={handleStartSession}
      >
        Start session
      </Button>
    </div>
  );
}
